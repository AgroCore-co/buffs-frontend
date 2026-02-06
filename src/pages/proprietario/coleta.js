'use client';
import React, { useState } from 'react';
import Head from 'next/head';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import Loading from '@/components/loading/Loading';
import DashboardContainer from '@/components/ui/DashboardContainer';
import Pagination from '@/components/ui/Pagination';
import { usePropriedade } from '@/contexts/PropriedadeContext';
import { useCachedFetch } from '@/hooks/useCachedFetch';
import ColetaModal from '@/components/proprietario/coleta/ColetaModal';

export default function ColetasPage() {
  const { loading: authLoading } = useProtectedRoute(['PROPRIETARIO']);
  const { propriedadeSelecionada } = usePropriedade();

  // --- ESTADOS ---
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [selectedColeta, setSelectedColeta] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = (coleta) => {
    setSelectedColeta(coleta);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedColeta(null);
  };

  // 1. Identificar Propriedade
  const idProp =
    propriedadeSelecionada?.id ||
    propriedadeSelecionada?.idPropriedade ||
    propriedadeSelecionada?.id_propriedade;

  // 2. Hook de Busca com Cache
  const { data: coletasData, loading: loadingColetas } = useCachedFetch(
    idProp ? `/retiradas/propriedade/${idProp}` : null,
    { page, limit },
    { enabled: !!idProp, ttl: 60000 }
  );

  // 3. Dados Derivados
  const coletas = coletasData?.data || [];
  const meta = coletasData?.meta || {};
  const totalPages = meta.totalPages || meta.total_pages || 1;
  const totalItems = meta.total || 0;

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  if (authLoading || (loadingColetas && !coletasData))
    return <Loading text="Carregando coletas..." />;

  const columns = [
    {
      key: 'dt_coleta',
      label: 'Data da Coleta',
      className: 'p-4 text-left font-semibold',
    },
    {
      key: 'nome_empresa',
      label: 'Empresa',
      className: 'p-4 text-left font-semibold',
    },
    {
      key: 'quantidade',
      label: 'Quantidade',
      className: 'p-4 text-left font-semibold',
    },
    {
      key: 'observacao',
      label: 'Observação',
      className: 'p-4 text-left font-semibold',
    },
    {
      key: 'resultado_teste',
      label: 'Status',
      className: 'p-4 text-left font-semibold',
    },
  ];

  const renderCell = (row, key) => {
    if (key === 'dt_coleta') {
      const datePart = row.dt_coleta.split(' ')[0].split('T')[0];
      const [y, m, d] = datePart.split('-');
      return (
        <span className="font-medium text-gray-700">{`${d}/${m}/${y}`}</span>
      );
    }
    if (key === 'quantidade') {
      return (
        <span className="font-bold text-gray-800">
          {parseFloat(row.quantidade).toLocaleString('pt-BR')} L
        </span>
      );
    }
    if (key === 'observacao') {
      return !row.observacao ? (
        <span className="text-gray-400">-</span>
      ) : (
        <span
          className="text-sm text-gray-600 max-w-[200px] block truncate"
          title={row.observacao}
        >
          {row.observacao}
        </span>
      );
    }
    if (key === 'resultado_teste') {
      const isApproved = row.resultado_teste;
      const Badge = require('@/components/ui/Badge').default;
      return (
        <Badge type={isApproved ? 'active' : 'inactive'}>
          {isApproved ? 'Aprovado' : 'Reprovado'}
        </Badge>
      );
    }
    return row[key];
  };

  return (
    <>
      <Head>
        <title>Coletas da Indústria | Buffs</title>
      </Head>

      <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500 pb-10">
        {/* --- HEADER --- */}
        <DashboardContainer>
          <div>
            <h1 className="text-2xl font-bold text-[#404040] mb-1">
              Controle de Produção
            </h1>
            <p className="text-[#404040]/70 text-sm">
              Monitoramento da Produção de Leite de Búfalas.
            </p>
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
                <strong>{totalItems} coletas registradas</strong>
              </p>
            </div>
          </div>

          {/* Tabela */}
          <div className="relative min-h-[400px]">
            {loadingColetas && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-lg">
                <Loading />
              </div>
            )}

            {(() => {
              const Table = require('@/components/table/Table').default;
              return (
                <div className="overflow-x-auto">
                  <Table
                    columns={columns}
                    data={coletas}
                    minWidth="1000px"
                    renderCell={renderCell}
                    onRowClick={handleOpenModal}
                  />
                </div>
              );
            })()}
          </div>

          {/* Paginação */}
          <div className="flex justify-between items-center mt-6 text-sm text-gray-600">
            <p>
              Mostrando {Math.min(limit, totalItems)} de {totalItems} registros
            </p>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              navVariant="report"
              numberVariant="secondary"
              activeNumberVariant="primary"
            />
          </div>
        </DashboardContainer>
      </div>

      <ColetaModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        data={selectedColeta}
      />
    </>
  );
}
