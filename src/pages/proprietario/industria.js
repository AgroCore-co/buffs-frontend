'use client';
import React, { useState } from 'react';
import Head from 'next/head';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import Loading from '@/components/loading/Loading';
import DashboardContainer from '@/components/ui/DashboardContainer';
import Button from '@/components/ui/Button';
import Pagination from '@/components/ui/Pagination';
import { FilterBar, FilterInput } from '@/components/ui/FilterBar';
import {
  FiPlus,
  FiBriefcase,
  FiPhone,
  FiUser,
  FiCalendar,
  FiMoreHorizontal,
} from 'react-icons/fi';

// --- DADOS MOCKADOS (Baseado nas informações fornecidas) ---

const industriasMock = [
  {
    id: 'a8afbcf3-3a9e-4d14-8e88-d0596b185404',
    nome: 'Buffs Laticinio',
    representante: 'Gilberto',
    contato: '(11) 99744-8877',
    observacao: 'Principal cliente',
    criado_em: '2025-12-10',
    atualizado_em: '2025-12-10',
  },
  {
    id: '325c2c92-793d-4d35-bc9d-0fe4480bf373',
    nome: 'Laticinio Valle',
    representante: 'Carla',
    contato: '(11) 99744-6699',
    observacao: 'Secundário',
    criado_em: '2025-12-10',
    atualizado_em: '2025-12-10',
  },
];

export default function IndustriasPage() {
  const { loading } = useProtectedRoute(['PROPRIETARIO']);

  // --- ESTADOS ---
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: industriasMock.length,
    totalPages: 1,
  });

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  if (loading) return <Loading text="Carregando indústrias..." />;

  // Função auxiliar para formatar data
  const formatDate = (dateStr) => {
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  return (
    <>
      <Head>
        <title>Indústrias | Buffs</title>
      </Head>

      <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500 pb-10">
        {/* --- HEADER --- */}
        <DashboardContainer>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#404040] mb-1">
                Indústrias
              </h1>
              <p className="text-[#404040]/70 text-sm">
                Indústrias parceiras cadastradas no sistema.
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="primary"
                size="medium"
                className="flex items-center gap-2 font-bold"
              >
                <FiPlus /> Nova Indústria
              </Button>
            </div>
          </div>
        </DashboardContainer>

        {/* --- TABELA DE REGISTROS --- */}
        <DashboardContainer>
          {/* Filtros */}
          <FilterBar>
            <FilterInput
              type="text"
              placeholder="Buscar por Nome ou Representante"
            />
          </FilterBar>

          {/* Tabela */}
          {(() => {
            const Table = require('@/components/table/Table').default;

            const columns = [
              {
                key: 'nome',
                label: 'Nome',
                className: 'p-4 text-left font-semibold',
              },
              {
                key: 'representante',
                label: 'Representante',
                className: 'p-4 text-left font-semibold',
              },
              {
                key: 'contato',
                label: 'Contato',
                className: 'p-4 text-left font-semibold',
              },
              {
                key: 'observacao',
                label: 'Observação',
                className: 'p-4 text-left font-semibold',
              },
              {
                key: 'criado_em',
                label: 'Criado em',
                className: 'p-4 text-left font-semibold',
              },
              {
                key: 'atualizado_em',
                label: 'Atualizado em',
                className: 'p-4 text-left font-semibold',
              },
              {
                key: 'id',
                label: 'ID',
                className: 'p-4 text-left font-semibold',
              },
            ];

            return (
              <Table
                columns={columns}
                data={industriasMock}
                minWidth="1200px"
                renderCell={(row, key) => {
                  if (key === 'nome') {
                    return (
                      <div className="flex items-center gap-2">
                        <div className="bg-amber-100 p-2 rounded-full text-amber-600">
                          <FiBriefcase size={14} />
                        </div>
                        <span className="font-bold text-gray-800">
                          {row.nome}
                        </span>
                      </div>
                    );
                  }
                  if (key === 'representante') {
                    return (
                      <div className="flex items-center gap-2 text-gray-700">
                        <FiUser className="text-gray-400" size={14} />
                        {row.representante}
                      </div>
                    );
                  }
                  if (key === 'contato') {
                    return (
                      <div className="flex items-center gap-2 text-gray-700">
                        <FiPhone className="text-gray-400" size={14} />
                        {row.contato}
                      </div>
                    );
                  }
                  if (key === 'observacao') {
                    return (
                      <span
                        className="text-sm text-gray-500 italic max-w-[200px] block truncate"
                        title={row.observacao}
                      >
                        {row.observacao}
                      </span>
                    );
                  }
                  if (key === 'criado_em' || key === 'atualizado_em') {
                    return (
                      <div className="flex items-center gap-1 text-gray-600 text-sm">
                        <FiCalendar className="text-gray-400" />
                        {formatDate(row[key])}
                      </div>
                    );
                  }
                  if (key === 'id') {
                    return (
                      <span className="text-xs text-gray-400 font-mono">
                        {row.id}
                      </span>
                    );
                  }
                  return row[key];
                }}
              />
            );
          })()}

          {/* Paginação */}
          <div className="flex justify-between items-center mt-6 text-sm text-gray-600">
            <p>
              Mostrando {industriasMock.length} de {pagination.total} registros
            </p>
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
