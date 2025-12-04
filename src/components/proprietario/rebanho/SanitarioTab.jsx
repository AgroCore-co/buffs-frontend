import Modal from '../../ui/Modal';
import React, { useMemo, useState } from 'react';
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

// --- DADOS MOCKADOS ---
const MOCK_DATA = {
  data: [
    {
      id_sanit: 'db5851b1-ef2c-4b5f-8f14-9e87f61361b9',
      id_bufalo: 'af6a6ae3-ac00-4161-b97c-6cc4f5a86375',
      dt_aplicacao: '2023-09-05',
      dosagem: 2.77,
      unidade_medida: 'ml',
      doenca: 'Parasitas',
      necessita_retorno: false,
      observacao: null,
    },
    {
      id_sanit: '7f49862f-05c2-4510-8a23-6ec293495a5c',
      id_bufalo: 'af6a6ae3-ac00-4161-b97c-6cc4f5a86375',
      dt_aplicacao: '2023-09-05',
      dosagem: 15,
      unidade_medida: 'ml',
      doenca: 'Suplementação',
      necessita_retorno: false,
      observacao: null,
    },
    {
      id_sanit: 'c18916d3-aea9-4f60-b5b3-c65a20ef5db9',
      id_bufalo: 'af6a6ae3-ac00-4161-b97c-6cc4f5a86375',
      dt_aplicacao: '2023-09-05',
      dosagem: 1,
      unidade_medida: 'dose',
      doenca: 'Parasitas',
      necessita_retorno: false,
      observacao: null,
    },
    {
      id_sanit: '5f00982d-0492-41fb-bb18-d7e484ad7cfb',
      id_bufalo: 'af6a6ae3-ac00-4161-b97c-6cc4f5a86375',
      dt_aplicacao: '2023-08-06',
      dosagem: 1,
      unidade_medida: 'dose',
      doenca: 'Parasitas',
      necessita_retorno: false,
      observacao: null,
    },
    {
      id_sanit: '2197f282-ba3b-4b84-99aa-5814b2e943f2',
      id_bufalo: 'af6a6ae3-ac00-4161-b97c-6cc4f5a86375',
      dt_aplicacao: '2023-06-07',
      dosagem: 1,
      unidade_medida: 'dose',
      doenca: 'Raiva',
      necessita_retorno: false,
      observacao: null,
    },
    {
      id_sanit: 'c03c27aa-5d4f-4e8d-9f19-006c80d2db8f',
      id_bufalo: 'af6a6ae3-ac00-4161-b97c-6cc4f5a86375',
      dt_aplicacao: '2023-06-07',
      dosagem: 1,
      unidade_medida: 'dose',
      doenca: 'Brucelose',
      necessita_retorno: false,
      observacao: null,
    },
    {
      id_sanit: '79eaa4ef-2e1b-4e66-a8fb-033211698fd5',
      id_bufalo: 'af6a6ae3-ac00-4161-b97c-6cc4f5a86375',
      dt_aplicacao: '2023-05-08',
      dosagem: 1,
      unidade_medida: 'dose',
      doenca: 'Raiva',
      necessita_retorno: false,
      observacao: null,
    },
    {
      id_sanit: '219ef469-3cc3-4959-87d9-e900ba5d28ec',
      id_bufalo: 'af6a6ae3-ac00-4161-b97c-6cc4f5a86375',
      dt_aplicacao: '2023-05-08',
      dosagem: 1,
      unidade_medida: 'dose',
      doenca: 'Parasitas',
      necessita_retorno: false,
      observacao: null,
    },
    {
      id_sanit: '5c89d2ad-ca42-4810-b045-f6c1620c2906',
      id_bufalo: 'af6a6ae3-ac00-4161-b97c-6cc4f5a86375',
      dt_aplicacao: '2023-04-08',
      dosagem: 1,
      unidade_medida: 'dose',
      doenca: 'Parasitas',
      necessita_retorno: false,
      observacao: null,
    },
    {
      id_sanit: 'cc4f344d-3fcf-43f8-b5b6-651897bc175a',
      id_bufalo: 'af6a6ae3-ac00-4161-b97c-6cc4f5a86375',
      dt_aplicacao: '2023-03-09',
      dosagem: 1,
      unidade_medida: 'dose',
      doenca: 'Parasitas',
      necessita_retorno: false,
      observacao: null,
    },
  ],
  meta: {
    total: 15,
  },
};

import Card from '../../ui/Card';

import SectionTitle from '../../ui/SectionTitle';

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

  const fullData = bufalo?.sanitaryData || MOCK_DATA.data;
  const totalRecords = bufalo?.sanitaryMeta?.total || fullData.length;

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return fullData.slice(startIndex, endIndex);
  }, [fullData, currentPage]);

  const totalPages = Math.ceil(totalRecords / itemsPerPage);

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
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
            <History className="w-3 h-3" /> Sim
          </span>
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
              {fullData.length > 0 ? formatDate(fullData[0].dt_aplicacao) : '-'}
            </p>
          </div>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden border-0 shadow-sm">
        <div className="p-6 border-b border-slate-100">
          <SectionTitle>Histórico de Vacinas e Tratamentos</SectionTitle>
        </div>

        <div className="p-0">
          <Table
            columns={columns}
            data={paginatedData}
            renderCell={renderCell}
            className="border-0 shadow-none rounded-none"
            minWidth="800px"
          />
        </div>

        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Mostrando <span className="font-medium">{startRecord}</span> a{' '}
                <span className="font-medium">{endRecord}</span> de{' '}
                <span className="font-medium">{totalRecords}</span> resultados
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
      </Card>
    </div>
  );
}
