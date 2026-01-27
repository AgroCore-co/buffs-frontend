import React, { useMemo, useState } from 'react';
import useSWR from 'swr';
import {
  Syringe,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Droplet,
  Pill,
  History,
} from 'lucide-react';
import Table from '@/components/table/Table';
import Pagination from '@/components/ui/Pagination';
import Card from '../../ui/Card';
import SectionTitle from '../../ui/SectionTitle';
import EmptyState from '@/components/ui/EmptyState';
import Loading from '@/components/loading/Loading';
import { sanitarioService } from '@/services/sanitario.service';

// --- HELPERS ---

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const userTimezoneOffset = date.getTimezoneOffset() * 60000;
  const correctedDate = new Date(date.getTime() + userTimezoneOffset);
  return correctedDate.toLocaleDateString('pt-BR');
};

const getCategoryStyle = (category) => {
  const normalized = category?.toLowerCase() || '';

  if (
    normalized.includes('raiva') ||
    normalized.includes('brucelose') ||
    normalized.includes('aftosa')
  ) {
    return {
      bg: 'bg-red-50',
      text: 'text-red-700',
      icon: AlertCircle,
      border: 'border-red-200',
    };
  }
  if (normalized.includes('parasita') || normalized.includes('verme')) {
    return {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      icon: Droplet,
      border: 'border-amber-200',
    };
  }
  if (normalized.includes('suplement')) {
    return {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      icon: Pill,
      border: 'border-blue-200',
    };
  }
  return {
    bg: 'bg-slate-50',
    text: 'text-slate-700',
    icon: Syringe,
    border: 'border-slate-200',
  };
};

// --- COMPONENTE PRINCIPAL ---

export default function SanitarioTab({ bufalo }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // 1. Busca Main Data (Paginated)
  const { data: responseData, isLoading: loading } = useSWR(
    bufalo?.id_bufalo ? ['sanitario', bufalo.id_bufalo, currentPage] : null,
    () =>
      sanitarioService.getSanitaryDataByBuffalo(
        bufalo.id_bufalo,
        currentPage,
        itemsPerPage
      ),
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
    }
  );

  const sanitaryData = responseData?.data || [];
  const meta = responseData?.meta || {};
  const totalRecords = meta.total || 0;
  const totalPages = meta.totalPages || 1;

  // 2. Busca Última Aplicação (Separate Request)
  const { data: latestData } = useSWR(
    bufalo?.id_bufalo ? ['sanitario-latest', bufalo.id_bufalo] : null,
    () => sanitarioService.getSanitaryDataByBuffalo(bufalo.id_bufalo, 1, 1),
    {
      revalidateOnFocus: false,
    }
  );

  const lastAppDate = latestData?.data?.[0]?.dt_aplicacao || null;

  const startRecord = (currentPage - 1) * itemsPerPage + 1;
  const endRecord = Math.min(currentPage * itemsPerPage, totalRecords);

  const columns = useMemo(
    () => [
      { key: 'dt_aplicacao', label: 'Data Aplicação', className: 'w-40' },
      {
        key: 'doenca',
        label: 'Tratamento / Vacina',
        className: 'min-w-[200px]',
      },
      { key: 'dosagem', label: 'Dosagem', className: 'w-32' },
      {
        key: 'necessita_retorno',
        label: 'Retorno',
        className: 'text-center w-32',
        align: 'center',
      },
    ],
    []
  );

  const renderCell = (row, key) => {
    switch (key) {
      case 'dt_aplicacao':
        return (
          <div className="flex items-center gap-2 text-slate-600 font-medium">
            <Calendar className="w-4 h-4 text-slate-400" />
            {formatDate(row.dt_aplicacao)}
          </div>
        );

      case 'doenca':
        const style = getCategoryStyle(row.doenca);
        const Icon = style.icon;
        return (
          <div className="flex items-center gap-3">
            <div className={`p-1.5 rounded-lg ${style.bg} ${style.text}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-slate-700">{row.doenca}</p>
              {row.observacao && (
                <p className="text-xs text-slate-400 truncate max-w-[200px]">
                  {row.observacao}
                </p>
              )}
            </div>
          </div>
        );

      case 'dosagem':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
            {row.dosagem} {row.unidade_medida}
          </span>
        );

      case 'necessita_retorno':
        return row.necessita_retorno ? (
          <div className="flex flex-col items-center gap-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
              <History className="w-3 h-3" /> Sim
            </span>
            {row.dt_retorno && (
              <span className="text-[10px] text-slate-500 font-medium">
                {formatDate(row.dt_retorno)}
              </span>
            )}
          </div>
        ) : (
          <span className="text-slate-400">-</span>
        );

      default:
        return row[key];
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex items-center gap-4 bg-gradient-to-br from-white to-slate-50">
          <div className="p-3 bg-blue-50 rounded-xl">
            <Syringe className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Total de Registros
            </p>
            <p className="text-2xl font-bold text-slate-800">{totalRecords}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 bg-gradient-to-br from-white to-slate-50">
          <div className="p-3 bg-green-50 rounded-xl">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Situação Sanitária
            </p>
            <p className="text-lg font-bold text-slate-800">Regular</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 bg-gradient-to-br from-white to-slate-50">
          <div className="p-3 bg-amber-50 rounded-xl">
            <History className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Última Aplicação
            </p>
            <p className="text-lg font-bold text-slate-800">
              {formatDate(lastAppDate)}
            </p>
          </div>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden border-0 shadow-sm relative">
        {loading && (
          <div className="absolute inset-0 z-50 bg-white/60 backdrop-blur-sm flex items-center justify-center">
            <Loading text="Carregando dados sanitários..." />
          </div>
        )}

        <div className="p-6 border-b border-slate-100">
          <SectionTitle>Histórico de Vacinas e Tratamentos</SectionTitle>
        </div>

        <div className="p-0">
          {!loading && totalRecords === 0 ? (
            <EmptyState
              title="Nenhum registro encontrado"
              description="Não há dados sanitários registrados para este animal."
              icon={Syringe}
            />
          ) : (
            <>
              <Table
                columns={columns}
                data={sanitaryData}
                renderCell={renderCell}
                className="border-0 shadow-none rounded-none"
                minWidth="800px"
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
