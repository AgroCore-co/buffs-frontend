import React, { useMemo, useState } from 'react';
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

// --- DADOS MOCKADOS (Baseado no JSON fornecido) ---
const MOCK_DATA = {
  data: [
    {
      id_zootec: 'da88655f-4413-49d0-9912-01b22b1370b8',
      id_bufalo: 'af6a6ae3-ac00-4161-b97c-6cc4f5a86375',
      peso: 208.46,
      condicao_corporal: 2.64,
      cor_pelagem: 'Preta',
      formato_chifre: 'Enrolado',
      porte_corporal: 'Médio',
      dt_registro: '2025-11-01',
      tipo_pesagem: 'Mensal',
    },
    {
      id_zootec: 'cdad8710-ffff-4c27-9a97-06c8183f4bd8',
      id_bufalo: 'af6a6ae3-ac00-4161-b97c-6cc4f5a86375',
      peso: 170.24,
      condicao_corporal: 3.92,
      cor_pelagem: 'Preta',
      formato_chifre: 'Enrolado',
      porte_corporal: 'Médio',
      dt_registro: '2025-10-01',
      tipo_pesagem: 'Mensal',
    },
    {
      id_zootec: '360aad30-169b-4587-9150-c902b5804e12',
      id_bufalo: 'af6a6ae3-ac00-4161-b97c-6cc4f5a86375',
      peso: 152.18,
      condicao_corporal: 4.31,
      cor_pelagem: 'Preta',
      formato_chifre: 'Em Cacho',
      porte_corporal: 'Médio',
      dt_registro: '2025-09-01',
      tipo_pesagem: 'Mensal',
    },
    {
      id_zootec: '776dc952-aa1f-43bd-bf7f-8ab00444e857',
      id_bufalo: 'af6a6ae3-ac00-4161-b97c-6cc4f5a86375',
      peso: 315.53,
      condicao_corporal: 4.63,
      cor_pelagem: 'Preta',
      formato_chifre: 'Curvado',
      porte_corporal: 'Médio',
      dt_registro: '2025-08-01',
      tipo_pesagem: 'Mensal',
    },
    {
      id_zootec: '181db58e-6091-4329-b488-75aea1fa645c',
      id_bufalo: 'af6a6ae3-ac00-4161-b97c-6cc4f5a86375',
      peso: 162.8,
      condicao_corporal: 2.59,
      cor_pelagem: 'Preta',
      formato_chifre: 'Curvado',
      porte_corporal: 'Médio',
      dt_registro: '2025-07-01',
      tipo_pesagem: 'Mensal',
    },
    {
      id_zootec: '0c3f4fb7-3576-4f04-ad48-b58f93598796',
      id_bufalo: 'af6a6ae3-ac00-4161-b97c-6cc4f5a86375',
      peso: 199.71,
      condicao_corporal: 2.63,
      cor_pelagem: 'Preta',
      formato_chifre: 'Em Cacho',
      porte_corporal: 'Médio',
      dt_registro: '2025-06-01',
      tipo_pesagem: 'Mensal',
    },
    {
      id_zootec: '984ea105-88b4-41aa-8f8a-2618131b1be3',
      id_bufalo: 'af6a6ae3-ac00-4161-b97c-6cc4f5a86375',
      peso: 337.98,
      condicao_corporal: 2.8,
      cor_pelagem: 'Preta',
      formato_chifre: 'Enrolado',
      porte_corporal: 'Médio',
      dt_registro: '2025-05-01',
      tipo_pesagem: 'Mensal',
    },
    {
      id_zootec: '74070753-587c-4c85-88df-d9b265bbabfd',
      id_bufalo: 'af6a6ae3-ac00-4161-b97c-6cc4f5a86375',
      peso: 336.2,
      condicao_corporal: 4.7,
      cor_pelagem: 'Preta',
      formato_chifre: 'Em Cacho',
      porte_corporal: 'Médio',
      dt_registro: '2025-04-01',
      tipo_pesagem: 'Mensal',
    },
    {
      id_zootec: '2e8d2396-fc63-42be-8d4b-73ef3a29b2a7',
      id_bufalo: 'af6a6ae3-ac00-4161-b97c-6cc4f5a86375',
      peso: 272.3,
      condicao_corporal: 1.42,
      cor_pelagem: 'Preta',
      formato_chifre: 'Em Cacho',
      porte_corporal: 'Médio',
      dt_registro: '2025-03-01',
      tipo_pesagem: 'Mensal',
    },
    {
      id_zootec: '9760ea32-6d8d-438a-a781-415fd1e87685',
      id_bufalo: 'af6a6ae3-ac00-4161-b97c-6cc4f5a86375',
      peso: 336.55,
      condicao_corporal: 1.02,
      cor_pelagem: 'Preta',
      formato_chifre: 'Enrolado',
      porte_corporal: 'Médio',
      dt_registro: '2025-02-01',
      tipo_pesagem: 'Mensal',
    },
  ],
  meta: {
    total: 83,
  },
};

// --- COMPONENTES VISUAIS ---
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
  const itemsPerPage = 5;

  // Usa dados da prop ou o mock
  const fullData = bufalo?.zootecnicoData || MOCK_DATA.data;
  const totalRecords = bufalo?.zootecnicoMeta?.total || fullData.length;

  // Lógica de Paginação Client-Side
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return fullData.slice(startIndex, endIndex);
  }, [fullData, currentPage]);

  const totalPages = Math.ceil(totalRecords / itemsPerPage);

  // Índices para display "Mostrando X a Y"
  const startRecord = (currentPage - 1) * itemsPerPage + 1;
  const endRecord = Math.min(currentPage * itemsPerPage, totalRecords);

  // Cálculos para os Cards de Resumo
  const latestRecord = fullData.length > 0 ? fullData[0] : null;
  const currentWeight = latestRecord ? latestRecord.peso : 0;
  const currentECC = latestRecord ? latestRecord.condicao_corporal : 0;

  // Definição das Colunas
  const columns = useMemo(
    () => [
      { key: 'dt_registro', label: 'Data Registro', className: 'w-40' },
      { key: 'peso', label: 'Peso (kg)', className: 'w-32' },
      { key: 'condicao_corporal', label: 'Escore (ECC)', className: 'w-48' },
      { key: 'formato_chifre', label: 'Formato Chifre', className: 'w-40' },
      { key: 'porte_corporal', label: 'Porte', className: '' },
      {
        key: 'tipo_pesagem',
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
      case 'dt_registro':
        return (
          <div className="flex items-center gap-2 text-slate-600 font-medium">
            <Calendar className="w-4 h-4 text-slate-400" />
            {formatDate(row.dt_registro)}
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

      case 'condicao_corporal':
        const percent = Math.min((row.condicao_corporal / 5) * 100, 100);
        let colorClass = 'bg-blue-500';
        if (row.condicao_corporal < 2.5) colorClass = 'bg-amber-500';
        if (row.condicao_corporal > 4.5) colorClass = 'bg-red-400';

        return (
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-700 w-8">
              {row.condicao_corporal}
            </span>
            <div className="w-24 bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full ${colorClass}`}
                style={{ width: `${percent}%` }}
              ></div>
            </div>
          </div>
        );

      case 'formato_chifre':
        return (
          <span className="text-slate-600">{row.formato_chifre || '-'}</span>
        );

      case 'porte_corporal':
        return (
          <div className="flex items-center gap-1.5">
            <Ruler className="w-3 h-3 text-slate-400" />
            <span className="text-slate-700">{row.porte_corporal}</span>
          </div>
        );

      case 'tipo_pesagem':
        return (
          <div className="flex justify-end">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-50 text-slate-500 border border-slate-100">
              {row.tipo_pesagem}
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
      <Card className="p-0 overflow-hidden border-0 shadow-sm">
        <div className="p-6 border-b border-slate-100">
          <SectionTitle>Histórico Zootécnico</SectionTitle>
        </div>

        <div className="p-0">
          <Table
            columns={columns}
            data={paginatedData}
            renderCell={renderCell}
            className="border-0 shadow-none rounded-none"
            minWidth="900px"
          />
        </div>

        {/* Paginação */}
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
