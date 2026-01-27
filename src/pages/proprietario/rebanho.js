'use client';
import Loading from '@/components/loading/Loading';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import useSWR, { mutate } from 'swr';
import Button from '@/components/ui/Button';
import Pagination from '@/components/ui/Pagination';
import { FilterBar, FilterSelect } from '@/components/ui/FilterBar';
import DashboardContainer from '@/components/ui/DashboardContainer';
import MetricCard from '@/components/ui/MetricCard';
import MaturidadeChart from '@/components/proprietario/rebanho/MaturidadeChart';
import SexoChart from '@/components/proprietario/rebanho/SexoChart';
import RacaChart from '@/components/proprietario/rebanho/RacaChart';
import DoencasChart from '@/components/proprietario/rebanho/DoencasChart';
import { usePropriedade } from '@/contexts/PropriedadeContext';
import { dashboardService } from '@/services/dashboard.service';
import { sanitarioService } from '@/services/sanitario.service';
import bufaloService from '@/services/bufalo.service';
import EmptyState from '@/components/ui/EmptyState';
import BufaloCriarModal from '@/components/proprietario/rebanho/BufaloCriarModal';

export default function Rebanho() {
  const { loading: authLoading } = useProtectedRoute(['PROPRIETARIO']);
  const router = useRouter();
  const { propriedadeSelecionada } = usePropriedade();

  // Modal Creation
  const [isCriarModalOpen, setIsCriarModalOpen] = useState(false);

  // --- SWR Data Fetching ---

  const id =
    propriedadeSelecionada?.idPropriedade ||
    propriedadeSelecionada?.id_propriedade;

  // Fetcher wrapper
  const fetcher = (key) => key; // Dummy fetcher, actual logic inside useSWR fetcher fn or simple wrapper

  // 1. Dashboard Stats
  const {
    data: statsData,
    error: statsError,
    isLoading: statsLoading,
  } = useSWR(
    id ? ['dashboard', id] : null,
    () => dashboardService.getDashboardStats(id),
    {
      revalidateOnFocus: true,
      dedupingInterval: 60000, // Cache por 1 minuto sem refetch (opcional)
    }
  );

  // 2. Doenças Stats
  const {
    data: doencasResponse,
    error: doencasError,
    isLoading: doencasLoading,
  } = useSWR(
    id ? ['doencas', id] : null,
    () => sanitarioService.getFrequenciaDoencas(id),
    { revalidateOnFocus: false }
  );

  // 3. Lista de Búfalos
  const [page, setPage] = useState(1);
  const {
    data: bufalosData,
    error: bufalosError,
    isLoading: bufalosLoading,
  } = useSWR(
    id ? ['bufalos', id, page] : null,
    () => bufaloService.getBufalosByPropriedade(id, page, 10),
    { keepPreviousData: true } // Mantém dados antigos enquanto carrega nova página
  );

  // Derived States
  const stats = statsData || {
    qtd_lotes: 0,
    bufalosPorRaca: [],
    qtd_bufalos_bezerro: 0,
    qtd_bufalos_novilha: 0,
    qtd_bufalos_vaca: 0,
    qtd_bufalos_touro: 0,
    qtd_femeas_ativas: 0,
    qtd_macho_ativos: 0,
    qtd_bufalas_lactando: 0,
    qtd_bufalos_registradas: 0,
  };

  const doencasData = doencasResponse?.dados || [];

  const bufalos = bufalosData?.data || [];
  const totalPages = bufalosData?.meta?.totalPages || 1;
  const totalBufalos = bufalosData?.meta?.total || 0;

  // Combine loading states
  // Se dashboard ou doenças estiver carregando E não tivermos dados em cache, consideramos loading geral.
  // Se tiver dados em cache (revalidação), loadingData é false para não piscar a tela.
  const loadingData = (statsLoading || doencasLoading) && !statsData;
  const loadingBufalos = bufalosLoading && !bufalosData;

  const handleSuccessCreate = () => {
    // Revalida todos os dados desta propriedade
    mutate(['dashboard', id]);
    mutate(['doencas', id]);
    mutate(['bufalos', id, page]);
  };

  if (authLoading) {
    return <Loading text="Carregando painel..." />;
  }

  // --- Processamento de Dados para Gráficos ---

  const totalAtivos =
    stats.qtd_bufalos_registradas ||
    stats.qtd_macho_ativos + stats.qtd_femeas_ativas;

  // Maturidade
  const maturidadeData = [
    {
      name: 'Bezerros',
      value: stats.qtd_bufalos_bezerro || 0,
      color: '#FCA90F',
    },
    {
      name: 'Novilhas',
      value: stats.qtd_bufalos_novilha || 0,
      color: '#FFCF78',
    },
    { name: 'Vacas', value: stats.qtd_bufalos_vaca || 0, color: '#CE7D0A' },
    { name: 'Touros', value: stats.qtd_bufalos_touro || 0, color: '#F2B84D' },
  ];

  // Sexo
  const sexData = [
    { name: 'Fêmeas', value: stats.qtd_femeas_ativas || 0, color: '#CE7D0A' },
    { name: 'Machos', value: stats.qtd_macho_ativos || 0, color: '#FFCF78' },
  ];

  // Raça
  const racaData = (stats.bufalosPorRaca || []).map((r) => ({
    raca: r.raca,
    quantidade: r.quantidade,
  }));

  // Doenças (Vindo da API)
  const frequenciaDoencas = doencasData.map((d) => ({
    doenca: d.doenca.charAt(0).toUpperCase() + d.doenca.slice(1), // Capitaliza
    frequencia: d.frequencia,
  }));

  // Percentuais
  const percentualFemeas =
    totalAtivos > 0
      ? Math.round((stats.qtd_femeas_ativas / totalAtivos) * 100)
      : 0;
  const percentualMachos =
    totalAtivos > 0
      ? Math.round((stats.qtd_macho_ativos / totalAtivos) * 100)
      : 0;

  const handleRowClick = (bufalo) => {
    router.push(`/proprietario/rebanho/${bufalo.id}`);
  };

  const getMaturidadeTexto = (codigo) => {
    switch (codigo) {
      case 'B':
        return 'Bezerro(a)';
      case 'N':
        return 'Novilho(a)';
      case 'V':
        return 'Vaca';
      case 'T':
        return 'Touro';
      case 'A':
        return 'Adulto';
      default:
        return 'N/D';
    }
  };

  if (!propriedadeSelecionada) {
    return (
      <DashboardContainer>
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <h2 className="text-xl font-bold text-gray-400 mb-2">
            Nenhuma Propriedade Selecionada
          </h2>
          <p className="text-gray-500">
            Selecione uma propriedade no menu flutuante para visualizar o
            rebanho.
          </p>
        </div>
      </DashboardContainer>
    );
  }

  // Se estiver carregando e não tiver dados, mostra loading
  if (loadingData && totalAtivos === 0) {
    return <Loading text="Carregando indicadores..." />;
  }

  // Se não estiver carregando e não tiver dados, mostra empty state
  if (!loadingData && totalAtivos === 0) {
    return (
      <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500">
        <DashboardContainer>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-[#404040] mb-1">
                Gestão do Rebanho - {propriedadeSelecionada.nome}
              </h1>
              <p className="text-[#404040]/70 text-sm">
                Gerencie seu rebanho de búfalos, registre informações
                zootécnicas e sanitárias.
              </p>
            </div>
          </div>
          <EmptyState
            title="Nenhum búfalo encontrado"
            description="Cadastre os animais do seu rebanho para visualizar os indicadores e gráficos."
            buttonText="Adicionar Búfalo"
            onButtonClick={() => setIsCriarModalOpen(true)}
          />
        </DashboardContainer>

        <BufaloCriarModal
          isOpen={isCriarModalOpen}
          onClose={() => setIsCriarModalOpen(false)}
          onSuccess={handleSuccessCreate}
          idPropriedade={
            propriedadeSelecionada.idPropriedade ||
            propriedadeSelecionada.id_propriedade
          }
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500">
      {/* Header */}
      <DashboardContainer>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-[#404040] mb-1">
              Gestão do Rebanho - {propriedadeSelecionada.nome}
            </h1>
            <p className="text-[#404040]/70 text-sm">
              Gerencie seu rebanho de búfalos, registre informações zootécnicas
              e sanitárias.
            </p>
          </div>
          {loadingData && (
            <span className="text-xs text-[#ce7d0a] font-medium px-3 py-1 bg-[#ffcf78]/20 rounded-full animate-pulse">
              Atualizando...
            </span>
          )}
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          <MetricCard
            title="Total do Rebanho"
            value={totalAtivos}
            subtitle="Búfalos ativos (Machos + Fêmeas)"
          />
          <MetricCard
            title="Fêmeas"
            value={stats.qtd_femeas_ativas}
            subtitle={`${percentualFemeas}% do rebanho`}
          />
          <MetricCard
            title="Machos"
            value={stats.qtd_macho_ativos}
            subtitle={`${percentualMachos}% do rebanho`}
          />
          <MetricCard
            title="Vacas Produtoras"
            value={stats.qtd_bufalas_lactando}
            subtitle="Em lactação"
          />
        </div>
      </DashboardContainer>

      {/* Gráficos e Distribuições */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <MaturidadeChart data={maturidadeData} />
        <SexoChart
          data={sexData}
          totalAtivos={totalAtivos}
          percentualFemeas={percentualFemeas}
        />
        <RacaChart data={racaData} />
      </div>

      {/* TABELA DE BÚFALOS */}
      <DashboardContainer>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#404040] mb-1">
              Registro de Búfalos
            </h1>
            <p className="text-[#404040]/70 text-sm">
              Lista completa do rebanho
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="report"
              size="medium"
              className="flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Gerar Relatório
            </Button>
            <Button
              variant="primary"
              size="medium"
              className="font-bold"
              onClick={() => setIsCriarModalOpen(true)}
            >
              + Adicionar Búfalo
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <FilterBar>
          <FilterSelect defaultValue="">
            <option disabled value="">
              Sexo: Todos
            </option>
            <option value="F">Fêmea</option>
            <option value="M">Macho</option>
          </FilterSelect>
          <FilterSelect defaultValue="">
            <option disabled value="">
              Raça: Todas
            </option>
            <option value="Murrah">Murrah</option>
            <option value="Jafarabadi">Jafarabadi</option>
            <option value="Mediterrâneo">Mediterrâneo</option>
            <option value="Carabao">Carabao</option>
          </FilterSelect>
          <FilterSelect defaultValue="">
            <option disabled value="">
              Maturidade: Todas
            </option>
            <option value="B">Bezerro(a)</option>
            <option value="N">Novilho(a)</option>
            <option value="V">Vaca</option>
            <option value="T">Touro</option>
            <option value="A">Adulto</option>
          </FilterSelect>
        </FilterBar>

        {/* Tabela */}
        {loadingBufalos ? (
          <div className="py-12 flex justify-center items-center">
            <Loading text="Carregando lista de búfalos..." />
          </div>
        ) : (
          (() => {
            const Table = require('@/components/table/Table').default;
            const columns = [
              {
                key: 'brinco',
                label: 'TAG',
                className: 'p-4 text-left font-semibold',
              },
              {
                key: 'nome',
                label: 'Nome',
                className: 'p-4 text-left font-semibold',
              },
              {
                key: 'sexo',
                label: 'Sexo',
                className: 'p-4 text-left font-semibold',
              },
              {
                key: 'raca',
                label: 'Raça',
                className: 'p-4 text-left font-semibold',
              },
              {
                key: 'maturidade',
                label: 'Maturidade',
                className: 'p-4 text-left font-semibold',
              },
              {
                key: 'status',
                label: 'Status',
                className: 'p-4 text-left font-semibold',
              },
            ];

            return (
              <Table
                columns={columns}
                data={bufalos}
                minWidth="900px"
                renderCell={(b, key) => {
                  if (key === 'sexo') return b.sexo === 'F' ? 'Fêmea' : 'Macho';
                  if (key === 'maturidade')
                    return getMaturidadeTexto(
                      b.nivel_maturidade || b.maturidade
                    );
                  if (key === 'raca') return b.raca?.nome || b.raca || '-';
                  if (key === 'status') {
                    const Badge = require('@/components/ui/Badge').default;
                    return (
                      <Badge type={b.status ? 'active' : 'inactive'}>
                        {b.status ? 'Ativo' : 'Inativo'}
                      </Badge>
                    );
                  }
                  return b[key];
                }}
                onRowClick={(b) =>
                  router.push(`/proprietario/rebanho/${b.id || b.id_bufalo}`)
                }
                rowClassName="cursor-pointer hover:bg-amber-50 transition"
              />
            );
          })()
        )}

        <div className="flex justify-between items-center mt-6 text-sm text-gray-600">
          <p>
            Mostrando {bufalos.length} de {totalBufalos} búfalos
          </p>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            navVariant="report"
            numberVariant="secondary"
            activeNumberVariant="primary"
          />
        </div>
      </DashboardContainer>

      {/* Gráfico de Doenças */}
      {frequenciaDoencas.length > 0 ? (
        <DoencasChart data={frequenciaDoencas} />
      ) : (
        <DashboardContainer>
          <div className="flex flex-col h-full">
            <h2 className="text-2xl font-bold text-[#404040] mb-6">
              Frequência de Doenças
            </h2>
            <div className="py-12">
              <EmptyState
                title="Nenhum dado sanitário"
                description="Os registros de doenças mais frequentes aparecerão aqui."
              />
            </div>
          </div>
        </DashboardContainer>
      )}

      {/* Modal - Renderizado fora das condicionais para garantir que esteja sempre disponível ou condicionado a isOpen */}
      <BufaloCriarModal
        isOpen={isCriarModalOpen}
        onClose={() => setIsCriarModalOpen(false)}
        onSuccess={handleSuccessCreate}
        idPropriedade={
          propriedadeSelecionada.idPropriedade ||
          propriedadeSelecionada.id_propriedade
        }
      />
    </div>
  );
}
