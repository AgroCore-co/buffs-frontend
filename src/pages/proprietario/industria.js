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

import { usePropriedade } from '@/contexts/PropriedadeContext';
import { useCachedFetch } from '@/hooks/useCachedFetch';
import IndustriaCriarModal from '@/components/proprietario/industria/IndustriaCriarModal';
import IndustriaEditarModal from '@/components/proprietario/industria/IndustriaEditarModal';
import IndustriaDetalheModal from '@/components/proprietario/industria/IndustriaDetalheModal';
import { Building2, User, Phone, Calendar, Plus } from 'lucide-react';

export default function IndustriasPage() {
  const { loading: authLoading } = useProtectedRoute(['PROPRIETARIO']);
  const { propriedadeSelecionada } = usePropriedade();

  // --- ESTADOS ---
  const [searchTerm, setSearchTerm] = useState('');
  const [isCriarOpen, setIsCriarOpen] = useState(false);
  const [isEditarOpen, setIsEditarOpen] = useState(false);
  const [isDetalheOpen, setIsDetalheOpen] = useState(false);
  const [selectedIndustria, setSelectedIndustria] = useState(null);

  // 1. Identificar Propriedade
  const idProp =
    propriedadeSelecionada?.id ||
    propriedadeSelecionada?.idPropriedade ||
    propriedadeSelecionada?.id_propriedade;

  // 2. Hook de Busca com Cache
  const {
    data: laticinios,
    loading: loadingData,
    revalidate,
  } = useCachedFetch(
    idProp ? `/laticinios/propriedade/${idProp}` : null,
    {},
    { enabled: !!idProp, ttl: 60000 }
  );

  // 3. Busca/Filtro local (já que o endpoint é simples)
  const filteredData = (laticinios || []).filter(
    (item) =>
      item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.representante?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenDetalhe = (industria) => {
    setSelectedIndustria(industria);
    setIsDetalheOpen(true);
  };

  const handleOpenEditar = (industria) => {
    setSelectedIndustria(industria);
    setIsEditarOpen(true);
  };

  if (authLoading || (loadingData && !laticinios))
    return <Loading text="Carregando indústrias..." />;

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

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
      key: 'id',
      label: 'ID',
      className: 'p-4 text-left font-semibold',
    },
  ];

  const renderCell = (row, key) => {
    if (key === 'nome') {
      return (
        <div className="flex items-center gap-2">
          <div className="bg-amber-100 p-2 rounded-full text-amber-600">
            <Building2 size={14} />
          </div>
          <span className="font-bold text-gray-800">{row.nome}</span>
        </div>
      );
    }
    if (key === 'representante') {
      return (
        <div className="flex items-center gap-2 text-gray-700">
          <User className="text-gray-400 w-3.5 h-3.5" />
          {row.representante}
        </div>
      );
    }
    if (key === 'contato') {
      return (
        <div className="flex items-center gap-2 text-gray-700">
          <Phone className="text-gray-400 w-3.5 h-3.5" />
          {row.contato}
        </div>
      );
    }
    if (key === 'criado_em') {
      return (
        <div className="flex items-center gap-1 text-gray-600 text-sm">
          <Calendar className="text-gray-400 w-3.5 h-3.5" />
          {formatDate(row.created_at)}
        </div>
      );
    }
    if (key === 'id') {
      return (
        <span className="text-xs text-gray-400 font-mono">
          {row.id_industria || row.id}
        </span>
      );
    }
    return row[key];
  };

  return (
    <>
      <Head>
        <title>Indústrias | Buffs</title>
      </Head>

      <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500 pb-10">
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
            <Button
              variant="primary"
              size="medium"
              className="flex items-center gap-2 font-bold shadow-sm"
              onClick={() => setIsCriarOpen(true)}
            >
              <Plus className="w-5 h-5" /> Nova Indústria
            </Button>
          </div>
        </DashboardContainer>

        <DashboardContainer>
          <FilterBar>
            <FilterInput
              type="text"
              placeholder="Buscar por Nome ou Representante"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </FilterBar>

          <div className="relative min-h-[400px]">
            {loadingData && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-lg">
                <Loading />
              </div>
            )}

            {(() => {
              const Table = require('@/components/table/Table').default;
              return (
                <Table
                  columns={columns}
                  data={filteredData}
                  minWidth="1000px"
                  renderCell={renderCell}
                  onRowClick={handleOpenDetalhe}
                />
              );
            })()}
          </div>

          <div className="flex justify-between items-center mt-6 text-sm text-gray-600">
            <p>Mostrando {filteredData.length} registros</p>
          </div>
        </DashboardContainer>
      </div>

      <IndustriaCriarModal
        isOpen={isCriarOpen}
        onClose={() => setIsCriarOpen(false)}
        onRefresh={revalidate}
      />

      <IndustriaEditarModal
        isOpen={isEditarOpen}
        onClose={() => {
          setIsEditarOpen(false);
          setSelectedIndustria(null);
        }}
        data={selectedIndustria}
        onRefresh={revalidate}
      />

      <IndustriaDetalheModal
        isOpen={isDetalheOpen}
        onClose={() => {
          setIsDetalheOpen(false);
        }}
        data={selectedIndustria}
        onEdit={handleOpenEditar}
        onRefresh={revalidate}
      />
    </>
  );
}
