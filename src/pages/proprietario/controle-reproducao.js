'use client';
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { usePropriedade } from '@/contexts/PropriedadeContext';
import { useCachedFetch } from '@/hooks/useCachedFetch';
import Loading from '@/components/loading/Loading';
import DashboardContainer from '@/components/ui/DashboardContainer';
import MetricCard from '@/components/ui/MetricCard';
import Button from '@/components/ui/Button';
import Pagination from '@/components/ui/Pagination';
import Table from '@/components/table/Table'; // Importando direto
import {
  FilterBar,
  FilterSelect,
  FilterInput,
} from '@/components/ui/FilterBar';
import {
  FiActivity,
  FiCheckCircle,
  FiXCircle,
  FiCalendar,
  FiSearch,
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import ReproducaoModal from '@/components/proprietario/reproducao/ReproducaoModal';

export default function ReproducaoPage() {
  const { loading: authLoading } = useProtectedRoute(['PROPRIETARIO']);
  const { propriedadeSelecionada } = usePropriedade();

  // Estado de controle Local
  const [selectedReproducao, setSelectedReproducao] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const handleOpenModal = (reproducao) => {
    setSelectedReproducao(reproducao);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedReproducao(null);
  };

  // 1. Identificar Propriedade
  const idProp =
    propriedadeSelecionada?.id ||
    propriedadeSelecionada?.idPropriedade ||
    propriedadeSelecionada?.id_propriedade;

  // 2. Hooks de Busca com Cache
  const {
    data: reproducoesData,
    loading: loadingList,
    error: errorList,
  } = useCachedFetch(
    idProp ? `/cobertura/propriedade/${idProp}` : null,
    { page, limit },
    { enabled: !!idProp, ttl: 60000 }
  );

  const { data: metricsData, loading: loadingMetrics } = useCachedFetch(
    idProp ? `/dashboard/reproducao/${idProp}` : null,
    {},
    { enabled: !!idProp, ttl: 60000 }
  );

  // 4. Dados Derivados para o Template
  const reproducoes = reproducoesData?.data || [];
  const totalPages = reproducoesData?.meta?.totalPages || 1;
  const totalItems = reproducoesData?.meta?.totalItems || 0;
  const loading = loadingList || loadingMetrics;

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    // Suportar formatos ISO ou BR simples
    const datePart = dateString.split(' ')[0].split('T')[0];
    const parts = datePart.split('-');
    if (parts.length === 3) {
      const [ano, mes, dia] = parts;
      return `${dia}/${mes}/${ano}`;
    }
    return dateString;
  };

  const metrics = {
    emAndamento: metricsData?.totalEmAndamento || 0,
    confirmadas: metricsData?.totalConfirmada || 0,
    falhas: metricsData?.totalFalha || 0,
    ultimaData: formatDate(metricsData?.ultimaDataReproducao),
  };

  // Efeitos colaterais (Mensagens de Erro)
  useEffect(() => {
    if (errorList) {
      toast.error('Erro ao carregar registros de reprodução.');
    }
  }, [errorList]);

  if (authLoading) {
    return <Loading text="Verificando permissões..." />;
  }

  // Render Cell Customizado
  const renderCell = (row, key) => {
    if (key === 'data') {
      if (!row.dtEvento) return '-';
      const datePart = row.dtEvento.split(' ')[0].split('T')[0];
      const [ano, mes, dia] = datePart.split('-');
      return (
        <span className="font-medium text-gray-700">{`${dia}/${mes}/${ano}`}</span>
      );
    }
    if (key === 'matriz') {
      return (
        <div>
          <div className="font-medium text-slate-800">
            {row.bufalo_idBufala?.nome || '-'}
          </div>
          <div className="text-xs text-slate-500">
            {row.bufalo_idBufala?.brinco || '-'}
          </div>
        </div>
      );
    }
    if (key === 'touro') {
      if (row.idSemen) {
        return (
          <div>
            <div className="font-medium text-slate-800 italic">
              Inseminação Artificial
            </div>
            <div className="text-xs text-slate-500">
              {row.semen?.identifier || '-'}
            </div>
          </div>
        );
      }
      const touro = row.bufalo_idBufalo || row.bufalo_idBufalo_2;
      return (
        <div>
          <div className="font-medium text-slate-800">{touro?.nome || '-'}</div>
          <div className="text-xs text-slate-500">{touro?.brinco || '-'}</div>
        </div>
      );
    }
    if (key === 'status') {
      let badgeType = 'bg-gray-100 text-gray-800';
      if (row.status === 'Confirmada')
        badgeType = 'bg-green-100 text-green-800';
      if (row.status === 'Concluída') badgeType = 'bg-blue-100 text-blue-800';
      if (row.status === 'Falha') badgeType = 'bg-red-100 text-red-800';

      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-bold ${badgeType}`}
        >
          {row.status}
        </span>
      );
    }
    if (key === 'ocorrencia') {
      return (
        <span
          className="text-xs text-gray-500 max-w-[200px] block truncate"
          title={row.ocorrencia}
        >
          {row.ocorrencia || '-'}
        </span>
      );
    }
    return row[key];
  };

  const columns = [
    {
      key: 'data',
      label: 'Data do Evento',
      className: 'p-4 text-left font-semibold',
    },
    {
      key: 'matriz',
      label: 'Matriz',
      className: 'p-4 text-left font-semibold',
    },
    {
      key: 'touro',
      label: 'Touro / Semen',
      className: 'p-4 text-left font-semibold',
    },
    {
      key: 'tipoInseminacao',
      label: 'Tipo',
      className: 'p-4 text-left font-semibold',
    },
    {
      key: 'status',
      label: 'Status',
      className: 'p-4 text-left font-semibold',
    },
    {
      key: 'tipoParto',
      label: 'Parto',
      className: 'p-4 text-left font-semibold',
    },
    {
      key: 'ocorrencia',
      label: 'Ocorrência',
      className: 'p-4 text-left font-semibold',
    },
  ];

  return (
    <>
      <Head>
        <title>Controle de Reprodução | Buffs</title>
      </Head>

      <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500">
        {/* --- HEADER --- */}
        <DashboardContainer>
          <div>
            <h1 className="text-2xl font-bold text-[#404040] mb-1">
              Controle de Reprodução
            </h1>
            <p className="text-[#404040]/70 text-sm">
              Gerencie o ciclo reprodutivo do rebanho, registre inseminações e
              acompanhe prenhezes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Reproduções em Andamento"
              value={metrics.emAndamento}
              subtitle="Reproduções não concluídas"
              icon={<FiActivity className="text-gray-400" />}
            />
            <MetricCard
              title="Reproduções Confirmadas"
              value={metrics.confirmadas}
              subtitle="Gestação confirmada"
              icon={<FiCheckCircle className="text-green-600" />}
            />
            <MetricCard
              title="Reproduções com Falha"
              value={metrics.falhas}
              subtitle="Falha na reprodução"
              icon={<FiXCircle className="text-red-500" />}
            />
            <MetricCard
              title="Última Reprodução"
              value={metrics.ultimaData}
              subtitle="Data da última reprodução"
              icon={<FiCalendar className="text-[#ce7d0a]" />}
            />
          </div>
        </DashboardContainer>

        {/* --- TABELA DE REGISTROS --- */}
        <DashboardContainer>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[#404040] mb-1">
                Registros de Reprodução
              </h1>
              <p className="text-[#404040]/70 text-sm">
                Visualização dos registros de coberturas e inseminações.
              </p>
            </div>
          </div>

          {/* Tabela */}
          {loading ? (
            <div className="flex justify-center p-8">
              <Loading />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table
                  columns={columns}
                  data={reproducoes}
                  minWidth="1100px"
                  renderCell={renderCell}
                  onRowClick={handleOpenModal}
                />
              </div>

              {/* Paginação */}
              <div className="flex justify-between items-center mt-6 text-sm text-gray-600">
                <p>
                  Mostrando {(page - 1) * limit + 1} a{' '}
                  {Math.min(page * limit, totalItems)} de {totalItems} registros
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
            </>
          )}
        </DashboardContainer>
      </div>

      <ReproducaoModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        data={selectedReproducao}
      />
    </>
  );
}
