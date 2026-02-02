import React, { useMemo, useState } from 'react';
import useSWR from 'swr';
import {
  Scale,
  TrendingUp,
  Calendar,
  Activity,
  Ruler,
  Info,
} from 'lucide-react';
import Table from '@/components/table/Table';
import Pagination from '@/components/ui/Pagination';
import Card from '../../ui/Card';
import SectionTitle from '../../ui/SectionTitle';
import EmptyState from '@/components/ui/EmptyState';
import Loading from '@/components/loading/Loading';
import { zootecnicoService } from '@/services/zootecnico.service';

// --- HELPERS ---
const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const userTimezoneOffset = date.getTimezoneOffset() * 60000;
  const correctedDate = new Date(date.getTime() + userTimezoneOffset);
  return correctedDate.toLocaleDateString('pt-BR');
};

const formatWeight = (val) => {
  if (val === undefined || val === null) return '-';
  return val.toLocaleString('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  });
};

// --- COMPONENTE PRINCIPAL ---
export default function ZootecnicoTab({ bufalo }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const {
    data: responseData,
    error,
    isLoading: loading,
  } = useSWR(
    bufalo?.idBufalo ? ['zootecnico', bufalo.idBufalo, currentPage] : null,
    () =>
      zootecnicoService.getZootecnicoDataByBuffalo(
        bufalo.idBufalo,
        currentPage,
        itemsPerPage
      ),
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
    }
  );

  const data = responseData?.data || [];
  const meta = responseData?.meta || {};
  const totalRecords = meta.total || 0;
  const totalPages = meta.totalPages || 1;

  // Índices para display "Mostrando X a Y"
  const startRecord = (currentPage - 1) * itemsPerPage + 1;
  const endRecord = Math.min(currentPage * itemsPerPage, totalRecords);

  // Cálculos para os Cards de Resumo
  const latestRecord = data.length > 0 ? data[0] : null;
  const currentWeight = latestRecord ? latestRecord.peso : 0;
  const currentECC = latestRecord ? latestRecord.condicaoCorporal : 0;

  // Definição das Colunas
  const columns = useMemo(
    () => [
      { key: 'dtRegistro', label: 'Data Registro', className: 'w-40' },
      { key: 'peso', label: 'Peso (kg)', className: 'w-32' },
      { key: 'condicaoCorporal', label: 'Escore (ECC)', className: 'w-48' },
      { key: 'formatoChifre', label: 'Formato Chifre', className: 'w-40' },
      { key: 'porteCorporal', label: 'Porte', className: '' },
      {
        key: 'tipoPesagem',
        label: 'Tipo',
        className: 'text-right',
        align: 'right',
      },
    ],
    []
  );

  // Renderização Customizada das Células
  const renderCell = (row, key) => {
    switch (key) {
      case 'dtRegistro':
        return (
          <div className="flex items-center gap-2 text-slate-600 font-medium">
            <Calendar className="w-4 h-4 text-slate-400" />
            {formatDate(row.dtRegistro)}
          </div>
        );

      case 'peso':
        return (
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-slate-400" />
            <span className="font-bold text-slate-800">
              {formatWeight(row.peso)} kg
            </span>
          </div>
        );

      case 'condicaoCorporal':
        const percent = Math.min((row.condicaoCorporal / 5) * 100, 100);
        let colorClass = 'bg-blue-500';
        if (row.condicaoCorporal < 2.5) colorClass = 'bg-amber-500';
        if (row.condicaoCorporal > 4.5) colorClass = 'bg-red-400';

        return (
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-700 w-8">
              {row.condicaoCorporal}
            </span>
            <div className="w-24 bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full ${colorClass}`}
                style={{ width: `${percent}%` }}
              ></div>
            </div>
          </div>
        );

      case 'formatoChifre':
        return (
          <span className="text-slate-600">{row.formatoChifre || '-'}</span>
        );

      case 'porteCorporal':
        return (
          <div className="flex items-center gap-1.5">
            <Ruler className="w-3 h-3 text-slate-400" />
            <span className="text-slate-700">{row.porteCorporal}</span>
          </div>
        );

      case 'tipoPesagem':
        return (
          <div className="flex justify-end">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-50 text-slate-500 border border-slate-100">
              {row.tipoPesagem}
            </span>
          </div>
        );

      default:
        return row[key];
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card Peso Atual */}
        <Card className="flex items-center gap-4 bg-gradient-to-br from-white to-slate-50">
          <div className="p-3 bg-blue-50 rounded-xl">
            <Scale className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Peso Atual
            </p>
            <p className="text-2xl font-bold text-slate-800">
              {formatWeight(currentWeight)}{' '}
              <span className="text-sm font-normal text-slate-500">kg</span>
            </p>
          </div>
        </Card>

        {/* Card ECC Atual */}
        <Card className="flex items-center gap-4 bg-gradient-to-br from-white to-slate-50">
          <div className="p-3 bg-indigo-50 rounded-xl">
            <Activity className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Escore Corporal (ECC)
            </p>
            <p className="text-lg font-bold text-slate-800">
              {currentECC}{' '}
              <span className="text-sm font-normal text-slate-400">/ 5.0</span>
            </p>
          </div>
        </Card>

        {/* Card Total Pesagens */}
        <Card className="flex items-center gap-4 bg-gradient-to-br from-white to-slate-50">
          <div className="p-3 bg-slate-100 rounded-xl">
            <TrendingUp className="w-6 h-6 text-slate-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Total Registros
            </p>
            <p className="text-lg font-bold text-slate-800">{totalRecords}</p>
          </div>
        </Card>
      </div>

      {/* Tabela */}
      <Card className="p-0 overflow-hidden border-0 shadow-sm relative">
        {loading && (
          <div className="absolute inset-0 z-50 bg-white/60 backdrop-blur-sm flex items-center justify-center">
            <Loading text="Carregando dados zootécnicos..." />
          </div>
        )}

        <div className="p-6 border-b border-slate-100">
          <SectionTitle>Histórico Zootécnico</SectionTitle>
        </div>

        <div className="p-0">
          {!loading && totalRecords === 0 ? (
            <EmptyState
              title="Nenhum registro encontrado"
              description="Não há dados zootécnicos registrados para este animal."
              icon={Scale}
            />
          ) : (
            <>
              <Table
                columns={columns}
                data={data}
                renderCell={renderCell}
                className="border-0 shadow-none rounded-none"
                minWidth="900px"
              />
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Mostrando{' '}
                      <span className="font-medium">{startRecord}</span> a{' '}
                      <span className="font-medium">{endRecord}</span> de{' '}
                      <span className="font-medium">{totalRecords}</span>{' '}
                      resultados
                    </p>
                  </div>
                  <div>
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                      navVariant="report"
                      activeNumberVariant="primary"
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
