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
  FilterInput,
  FilterSelect,
} from '@/components/ui/FilterBar';
import {
  FiTruck,
  FiCheckCircle,
  FiXCircle,
  FiActivity,
  FiPlus,
  FiFileText,
} from 'react-icons/fi';

// --- DADOS MOCKADOS (Baseado nas informações fornecidas) ---

const metrics = {
  volumeTotal: '0 L',
  totalColetas: 403,
  taxaAprovacao: '0.0%',
  volumeRejeitado: '0 L',
};

const coletasMock = [
  {
    id: 1,
    data: '2025-11-24',
    empresa: 'Buffs Laticinio',
    quantidade: '105',
    obs: 'Coleta reprovada',
    status: 'Reprovado',
  },
  {
    id: 2,
    data: '2025-11-24',
    empresa: 'Laticinio Valle',
    quantidade: '105',
    obs: 'Coleta reprovada por ambas',
    status: 'Reprovado',
  },
  {
    id: 3,
    data: '2025-11-23',
    empresa: 'Buffs Laticinio',
    quantidade: '200',
    obs: '-',
    status: 'Aprovado',
  },
  {
    id: 4,
    data: '2025-11-23',
    empresa: 'Buffs Laticinio',
    quantidade: '800',
    obs: '-',
    status: 'Aprovado',
  },
  {
    id: 5,
    data: '2025-11-22',
    empresa: 'Buffs Laticinio',
    quantidade: '141,88',
    obs: 'Coleta aprovada',
    status: 'Aprovado',
  },
  {
    id: 6,
    data: '2025-11-20',
    empresa: 'Buffs Laticinio',
    quantidade: '108,5',
    obs: 'Coleta aprovada',
    status: 'Aprovado',
  },
  {
    id: 7,
    data: '2025-11-18',
    empresa: 'Buffs Laticinio',
    quantidade: '9,78',
    obs: 'Coleta aprovada',
    status: 'Aprovado',
  },
  {
    id: 8,
    data: '2025-11-16',
    empresa: 'Buffs Laticinio',
    quantidade: '43,42',
    obs: 'Coleta aprovada',
    status: 'Aprovado',
  },
  {
    id: 9,
    data: '2025-11-14',
    empresa: 'Buffs Laticinio',
    quantidade: '77,06',
    obs: 'Coleta aprovada',
    status: 'Aprovado',
  },
  {
    id: 10,
    data: '2025-11-12',
    empresa: 'Buffs Laticinio',
    quantidade: '110,7',
    obs: 'Coleta aprovada',
    status: 'Aprovado',
  },
];

export default function ColetasPage() {
  const { loading } = useProtectedRoute(['PROPRIETARIO']);

  // --- ESTADOS ---
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 403,
    totalPages: 41,
  });

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  if (loading) return <Loading text="Carregando coletas..." />;

  return (
    <>
      <Head>
        <title>Coletas da Indústria | Buffs</title>
      </Head>

      <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500 pb-10">
        {/* --- HEADER E MÉTRICAS --- */}
        <DashboardContainer>
          <div>
            <h1 className="text-2xl font-bold text-[#404040] mb-1">
              Controle de Produção
            </h1>
            <p className="text-[#404040]/70 text-sm">
              Monitoramento da Produção de Leite de Búfalas.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Volume Total Coletado"
              value={metrics.volumeTotal}
              subtitle="Mês atual"
              icon={<FiTruck className="text-[#ce7d0a]" />}
            />
            <MetricCard
              title="Total de Coletas"
              value={metrics.totalColetas}
              subtitle="Registros"
              icon={<FiActivity className="text-[#ce7d0a]" />}
            />
            <MetricCard
              title="Taxa de Aprovação"
              value={metrics.taxaAprovacao}
              subtitle="Mês atual"
              icon={<FiCheckCircle className="text-green-600" />}
            />
            <MetricCard
              title="Volume Rejeitado"
              value={metrics.volumeRejeitado}
              subtitle="Mês atual"
              icon={<FiXCircle className="text-red-500" />}
            />
          </div>
        </DashboardContainer>

        {/* --- TABELA DE REGISTROS --- */}
        <DashboardContainer>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[#404040] mb-1">
                Registro de Coletas
              </h1>
              <p className="text-[#404040]/70 text-sm">
                Monitoramento da Produção de leite de Búfalas -{' '}
                <strong>{metrics.totalColetas} coletas registradas</strong>
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="report"
                size="medium"
                className="flex items-center gap-2"
              >
                <FiFileText /> Relatório
              </Button>
              <Button
                variant="primary"
                size="medium"
                className="flex items-center gap-2 font-bold"
              >
                <FiPlus /> Nova Coleta
              </Button>
            </div>
          </div>

          {/* Filtros */}
          <FilterBar>
            <FilterInput type="date" placeholder="Data" />
            <FilterInput type="text" placeholder="Buscar Empresa" />
            <FilterSelect>
              <option value="">Status: Todos</option>
              <option value="aprovado">Aprovado</option>
              <option value="reprovado">Reprovado</option>
            </FilterSelect>
          </FilterBar>

          {/* Tabela */}
          {(() => {
            const Table = require('@/components/table/Table').default;
            const Badge = require('@/components/ui/Badge').default;

            const columns = [
              {
                key: 'data',
                label: 'Data da Coleta',
                className: 'p-4 text-left font-semibold',
              },
              {
                key: 'empresa',
                label: 'Empresa',
                className: 'p-4 text-left font-semibold',
              },
              {
                key: 'quantidade',
                label: 'Quantidade',
                className: 'p-4 text-left font-semibold',
              },
              {
                key: 'obs',
                label: 'Observação',
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
                data={coletasMock}
                minWidth="1000px"
                renderCell={(row, key) => {
                  if (key === 'data') {
                    const [y, m, d] = row.data.split('-');
                    return (
                      <span className="font-medium text-gray-700">{`${d}/${m}/${y}`}</span>
                    );
                  }
                  if (key === 'quantidade') {
                    return (
                      <span className="font-bold text-gray-800">
                        {row.quantidade} L
                      </span>
                    );
                  }
                  if (key === 'obs') {
                    return row.obs === '-' ? (
                      <span className="text-gray-400">-</span>
                    ) : (
                      <span
                        className="text-sm text-gray-600 max-w-[200px] block truncate"
                        title={row.obs}
                      >
                        {row.obs}
                      </span>
                    );
                  }
                  if (key === 'status') {
                    const isApproved = row.status === 'Aprovado';
                    return (
                      <Badge type={isApproved ? 'active' : 'inactive'}>
                        {row.status}
                      </Badge>
                    );
                  }
                  return row[key];
                }}
              />
            );
          })()}

          {/* Paginação */}
          <div className="flex justify-between items-center mt-6 text-sm text-gray-600">
            <p>Mostrando 10 de {metrics.totalColetas} registros</p>
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
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
