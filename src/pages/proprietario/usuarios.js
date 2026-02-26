'use client';
import React, { useState } from 'react';
import Head from 'next/head';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import Loading from '@/components/loading/Loading';
import DashboardContainer from '@/components/ui/DashboardContainer';
import Button from '@/components/ui/Button';
import Pagination from '@/components/ui/Pagination';
import { FilterBar, FilterInput } from '@/components/ui/FilterBar';
import { Plus } from 'lucide-react';
import { usePropriedade } from '@/contexts/PropriedadeContext';
import { useCachedFetch } from '@/hooks/useCachedFetch';
import UsuarioEditarModal from '@/components/proprietario/usuario/UsuarioEditarModal';
import UsuarioDetalheModal from '@/components/proprietario/usuario/UsuarioDetalheModal';

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  } catch (e) {
    return dateStr;
  }
};

export default function UsuariosPage() {
  const { loading: authLoading } = useProtectedRoute(['PROPRIETARIO']);
  const { propriedadeSelecionada } = usePropriedade();

  const [searchTerm, setSearchTerm] = useState('');
  const [isCriarOpen, setIsCriarOpen] = useState(false);
  const [isEditarOpen, setIsEditarOpen] = useState(false);
  const [isDetalheOpen, setIsDetalheOpen] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState(null);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const idProp =
    propriedadeSelecionada?.id ||
    propriedadeSelecionada?.idPropriedade ||
    propriedadeSelecionada?.id_propriedade;

  const {
    data: usuariosData,
    loading: loadingData,
    error: fetchError,
    revalidate,
  } = useCachedFetch(
    idProp ? `/usuarios/funcionarios/propriedade/${idProp}` : null,
    { page, limit },
    { enabled: !!idProp, ttl: 60000 }
  );

  const usuarios = Array.isArray(usuariosData) ? usuariosData : usuariosData?.data || [];
  const meta = Array.isArray(usuariosData) ? null : usuariosData?.meta || {};
  const totalItems = meta?.total || meta?.totalItems || usuarios.length || 0;
  const totalPages = meta
    ? meta.totalPages || meta.total_pages || 1
    : Math.max(1, Math.ceil((usuarios.length || 0) / (limit || 10)));

  const handlePageChange = (newPage) => setPage(newPage);

  const handleOpenDetalhe = (u) => {
    setSelectedUsuario(u);
    setIsDetalheOpen(true);
  };

  const handleOpenEditar = (u) => {
    setSelectedUsuario(u);
    setIsEditarOpen(true);
  };

  if (authLoading || (loadingData && !usuariosData))
    return <Loading text="Carregando usuários..." />;

  const columns = [
    { key: 'nome', label: 'Nome', className: 'p-4 text-left font-semibold' },
    { key: 'email', label: 'E-mail', className: 'p-4 text-left font-semibold' },
    { key: 'papel', label: 'Papel', className: 'p-4 text-left font-semibold' },
    { key: 'contato', label: 'Contato', className: 'p-4 text-left font-semibold' },
    { key: 'criado_em', label: 'Criado em', className: 'p-4 text-left font-semibold' },
  ];

  const renderCell = (row, key) => {
    if (key === 'nome') {
      return <span className="font-bold text-gray-800">{row.nome || row.nome_completo || '-'}</span>;
    }
    if (key === 'email') {
      return <span className="text-sm text-gray-600">{row.email || '-'}</span>;
    }
    if (key === 'papel') {
      const papel = row.cargo || row.papel || row.role || row.roles?.[0] || '-';
      return <span className="text-sm text-gray-700 capitalize">{papel}</span>;
    }
    if (key === 'contato') {
      return <span className="text-sm text-gray-600">{row.telefone || row.contato || '-'}</span>;
    }
    if (key === 'criado_em') {
      return <span className="text-sm text-gray-600">{formatDate(row.created_at || row.criado_em || row.createdAt || row.created_at)}</span>;
    }
    
    return row[key];
  };

  const filteredData = (usuarios || []).filter((u) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return (
      (u.nome || u.nome_completo || '')?.toLowerCase().includes(term) ||
      (u.email || '')?.toLowerCase().includes(term) ||
      (u.cargo || u.papel || u.role || '')?.toLowerCase().includes(term)
    );
  });

  return (
    <>
      <Head>
        <title>Usuários | Buffs</title>
      </Head>

      <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500 pb-10">
        <DashboardContainer>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#404040] mb-1">Usuários</h1>
              <p className="text-[#404040]/70 text-sm">Usuários com acesso à propriedade selecionada.</p>
            </div>
          </div>
        </DashboardContainer>

        <DashboardContainer>
          <FilterBar>
            <FilterInput
              type="text"
              placeholder="Buscar por nome, e-mail ou papel"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </FilterBar>

          <div className="relative min-h-[300px]">
            {fetchError && (
              <div className="p-6 rounded-lg bg-red-50 border border-red-100 text-red-700">
                Erro ao carregar usuários. Tente novamente.
                <button className="ml-4 underline" onClick={revalidate}>
                  Recarregar
                </button>
              </div>
            )}
            {loadingData && (
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
                    data={filteredData}
                    minWidth="1000px"
                    renderCell={renderCell}
                    onRowClick={handleOpenDetalhe}
                  />
                </div>
              );
            })()}
          </div>

          <div className="flex justify-between items-center mt-6 text-sm text-gray-600">
            <p>Mostrando {Math.min(limit, totalItems)} de {totalItems} registros</p>
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

      

      <UsuarioEditarModal
        isOpen={isEditarOpen}
        onClose={() => setIsEditarOpen(false)}
        data={selectedUsuario}
        onRefresh={revalidate}
      />

      <UsuarioDetalheModal
        isOpen={isDetalheOpen}
        onClose={() => setIsDetalheOpen(false)}
        data={selectedUsuario}
        onEdit={handleOpenEditar}
        onRefresh={revalidate}
      />
    </>
  );
}
