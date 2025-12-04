'use client';
import React, { useState } from 'react';
import Head from 'next/head';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import Loading from '@/components/loading/Loading';
import DashboardContainer from '@/components/ui/DashboardContainer';
import MetricCard from '@/components/ui/MetricCard';
import Button from '@/components/ui/Button';
import Pagination from '@/components/ui/Pagination';
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
  FiTrendingUp,
  FiGitMerge,
} from 'react-icons/fi';

// --- DADOS MOCKADOS (Baseados no seu prompt) ---

const metrics = {
  emAndamento: 0,
  confirmadas: 84,
  falhas: 9,
  ultimaData: '09/08/2025',
};

const topBufalas = [
  {
    rank: 1,
    nome: 'Hera',
    brinco: 'IZ-012',
    idade: '6a 2m',
    raca: 'Murrah',
    status: 'Apta (Pós-Parto)',
    score: 100,
  },
  {
    rank: 2,
    nome: 'Buffs 01',
    brinco: 'BFF-001',
    idade: '2a 7m',
    raca: 'Murrah',
    status: 'Apta (Novilha)',
    score: 97,
  },
  {
    rank: 3,
    nome: 'Buffs 02',
    brinco: 'BR54321',
    idade: '2a 7m',
    raca: 'Murrah',
    status: 'Apta (Novilha)',
    score: 97,
  },
  {
    rank: 4,
    nome: 'Buffs 03',
    brinco: 'BR54321',
    idade: '2a 7m',
    raca: 'Murrah',
    status: 'Apta (Novilha)',
    score: 97,
  },
  {
    rank: 5,
    nome: 'Liriope',
    brinco: 'IZ-039',
    idade: '2a 11m',
    raca: 'Murrah',
    status: 'Apta (Novilha)',
    score: 97,
  },
];

const topTouros = [
  {
    rank: 1,
    nome: 'Corona da UPD',
    brinco: 'BUFF-017',
    idade: '9a 11m',
    raca: 'Murrah',
    status: '-',
    score: 100,
  },
  {
    rank: 2,
    nome: 'P. Loures',
    brinco: 'BUFF-019',
    idade: '9a 11m',
    raca: 'Murrah',
    status: '-',
    score: 100,
  },
  {
    rank: 3,
    nome: 'Pingo',
    brinco: 'BUFF-032',
    idade: '6a 11m',
    raca: 'Murrah',
    status: '-',
    score: 100,
  },
  {
    rank: 4,
    nome: 'Zeus',
    brinco: 'IZ-001',
    idade: '11a 7m',
    raca: 'Murrah',
    status: '-',
    score: 100,
  },
  {
    rank: 5,
    nome: 'Ares',
    brinco: 'IZ-053',
    idade: '3a 8m',
    raca: 'Murrah',
    status: '-',
    score: 100,
  },
];

// Listas parciais para os Selects (Simulação)
const listaTouros = [
  'Cronos - BUFF-007',
  'Tífon - BUFF-009',
  'Zeus - IZ-001',
  'Chupisco da UPD - BUFF-012',
  'Tufão Av. Brasil - BUFF-014',
  'Corona da UPD - BUFF-017',
  'P. Loures - BUFF-019',
  'Barretos - BUFF-022',
  'BOPE da UPD - BUFF-024',
  'Ares - IZ-053',
];

const listaMatrizes = [
  'Pérola - BUFF-001',
  'Mel - BUFF-002',
  'Gaya - BUFF-003',
  'JADE - BUFF-004',
  'Maya Massafera - BUFF-005',
  'Eirene - BUFF-006',
  'Hera II - BUFF-008',
  'Temis - BUFF-010',
  'Estrela - IZ-002',
  'Lua - IZ-003',
  'Aurora - IZ-004',
];

const historicoReproducao = [
  {
    id: 1,
    data: '2025-08-09',
    matriz: 'IZ-002',
    touro: 'IZ-001',
    tipo: 'Monta Natural',
    status: 'Concluída',
    parto: '-',
    ocorrencia: 'Cobertura realizada. Aguardando diagnóstico.',
    acoes: 'Detalhes',
  },
  {
    id: 2,
    data: '2025-01-26',
    matriz: 'IZ-003',
    touro: 'IZ-001',
    tipo: 'Monta Natural',
    status: 'Concluída',
    parto: 'Normal',
    ocorrencia: 'Gestação confirmada. Parto previsto em ~20 dias.',
    acoes: 'Detalhes',
  },
  {
    id: 3,
    data: '2024-11-28',
    matriz: 'IZ-020',
    touro: 'IZ-053',
    tipo: 'Monta Natural',
    status: 'Concluída',
    parto: '-',
    ocorrencia: '-',
    acoes: 'Detalhes',
  },
  {
    id: 4,
    data: '2024-11-28',
    matriz: 'IZ-017',
    touro: 'IZ-053',
    tipo: 'Monta Natural',
    status: 'Confirmada',
    parto: 'Normal',
    ocorrencia: '-',
    acoes: 'Detalhes',
  },
  {
    id: 5,
    data: '2024-11-28',
    matriz: 'IZ-021',
    touro: '-',
    tipo: 'Inseminação Artificial',
    status: 'Concluída',
    parto: 'Normal',
    ocorrencia: '-',
    acoes: 'Detalhes',
  },
  {
    id: 6,
    data: '2024-11-28',
    matriz: 'IZ-019',
    touro: '-',
    tipo: 'Inseminação Artificial',
    status: 'Concluída',
    parto: 'Normal',
    ocorrencia: '-',
    acoes: 'Detalhes',
  },
  {
    id: 7,
    data: '2024-11-28',
    matriz: 'IZ-014',
    touro: 'IZ-053',
    tipo: 'Monta Natural',
    status: 'Confirmada',
    parto: 'Normal',
    ocorrencia: '-',
    acoes: 'Detalhes',
  },
  {
    id: 8,
    data: '2024-11-28',
    matriz: 'IZ-012',
    touro: '-',
    tipo: 'Inseminação Artificial',
    status: 'Confirmada',
    parto: 'Normal',
    ocorrencia: '-',
    acoes: 'Detalhes',
  },
  {
    id: 9,
    data: '2024-11-28',
    matriz: 'IZ-015',
    touro: '-',
    tipo: 'Inseminação Artificial',
    status: 'Confirmada',
    parto: 'Normal',
    ocorrencia: '-',
    acoes: 'Detalhes',
  },
  {
    id: 10,
    data: '2024-05-12',
    matriz: 'IZ-005',
    touro: 'IZ-001',
    tipo: 'Monta Natural',
    status: 'Confirmada',
    parto: 'Normal',
    ocorrencia: '-',
    acoes: 'Detalhes',
  },
];

export default function ReproducaoPage() {
  const { loading } = useProtectedRoute(['PROPRIETARIO']);
  const [simulationState, setSimulationState] = useState('idle'); // idle, loading, done

  if (loading) {
    return <Loading text="Carregando controle reprodutivo..." />;
  }

  const handleSimulation = (e) => {
    e.preventDefault();
    setSimulationState('loading');
    setTimeout(() => setSimulationState('done'), 1500);
  };

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

            <div className="flex gap-2">
              <Button
                variant="primary"
                size="medium"
                className="flex items-center gap-2"
              >
                <span>+</span> Novo Registro
              </Button>
            </div>
          </div>

          {/* Filtros */}
          <FilterBar>
            <FilterInput type="date" placeholder="Data" />
            <FilterInput type="text" placeholder="Buscar Matriz ou Touro" />
            <FilterSelect>
              <option value="">Status: Todos</option>
              <option value="concluida">Concluída</option>
              <option value="confirmada">Confirmada</option>
              <option value="falha">Falha</option>
            </FilterSelect>
          </FilterBar>

          {/* Tabela */}
          {(() => {
            // Importação condicional para manter compatibilidade com o padrão do projeto
            const Table = require('@/components/table/Table').default;
            const Badge = require('@/components/ui/Badge').default;

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
                label: 'Touro',
                className: 'p-4 text-left font-semibold',
              },
              {
                key: 'tipo',
                label: 'Tipo de Inseminação',
                className: 'p-4 text-left font-semibold',
              },
              {
                key: 'status',
                label: 'Status',
                className: 'p-4 text-left font-semibold',
              },
              {
                key: 'parto',
                label: 'Tipo de Parto',
                className: 'p-4 text-left font-semibold',
              },
              {
                key: 'ocorrencia',
                label: 'Ocorrência',
                className: 'p-4 text-left font-semibold',
              },
              {
                key: 'acoes',
                label: 'Ações',
                className: 'p-4 text-right font-semibold',
              },
            ];

            return (
              <Table
                columns={columns}
                data={historicoReproducao}
                minWidth="1100px"
                renderCell={(row, key) => {
                  if (key === 'data') {
                    const [y, m, d] = row.data.split('-');
                    return (
                      <span className="font-medium text-gray-700">{`${d}/${m}/${y}`}</span>
                    );
                  }
                  if (key === 'status') {
                    let badgeType = 'default';
                    if (row.status === 'Confirmada') badgeType = 'active'; // Verde
                    if (row.status === 'Concluída') badgeType = 'info'; // Azul/Neutro
                    if (row.status === 'Falha') badgeType = 'inactive'; // Vermelho

                    // Fallback se o componente Badge não tiver types customizados além de active/inactive
                    const styleClass =
                      row.status === 'Confirmada'
                        ? 'bg-green-100 text-green-800'
                        : row.status === 'Concluída'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800';

                    return (
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold ${styleClass}`}
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
                        {row.ocorrencia}
                      </span>
                    );
                  }
                  if (key === 'acoes') {
                    return (
                      <div className="text-right">
                        <button className="text-[#ce7d0a] font-semibold text-sm hover:underline">
                          Detalhes
                        </button>
                      </div>
                    );
                  }
                  return row[key];
                }}
              />
            );
          })()}

          {/* Paginação */}
          <div className="flex justify-between items-center mt-6 text-sm text-gray-600">
            <p>Mostrando 10 de 128 registros</p>
            <Pagination
              currentPage={1}
              totalPages={13}
              onPageChange={() => {}}
              navVariant="report"
              numberVariant="secondary"
              activeNumberVariant="primary"
            />
          </div>
        </DashboardContainer>
      </div>
    </>
  );
}
