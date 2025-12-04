import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Table from '@/components/table/Table';
import Pagination from '@/components/ui/Pagination';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Droplet,
  Calendar,
  AlertCircle,
  Activity,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  Archive,
} from 'lucide-react';

const MOCK_DETAIL_DATA = {
  animal: {
    nome: 'Atena',
    brinco: 'IZ-014',
    raca: 'Murrah',
    idade: '72 meses',
  },
  cicloAtual: {
    totalOrdenhas: 6,
    mediaOrdenha: 12.99,
    maiorOrdenha: 30.0,
    menorOrdenha: 7.89,
    totalAcumulado: 64.97,
    diasLactacao: 65,
    status: 'Em Lactação',
    ordenhas: [
      {
        id: 1,
        data: '2025-11-22',
        periodo: 'Manhã',
        quantidade: 30.0,
        ocorrencia: null,
      },
      {
        id: 2,
        data: '2025-11-22',
        periodo: 'Tarde',
        quantidade: 8.99,
        ocorrencia: null,
      },
      {
        id: 3,
        data: '2025-11-20',
        periodo: 'Manhã',
        quantidade: 7.89,
        ocorrencia: null,
      },
      {
        id: 4,
        data: '2025-11-07',
        periodo: 'Manhã',
        quantidade: 9.13,
        ocorrencia: null,
      },
      {
        id: 5,
        data: '2025-10-23',
        periodo: 'Manhã',
        quantidade: 8.96,
        ocorrencia: null,
      },
      {
        id: 6,
        data: '2025-10-10',
        periodo: 'Manhã',
        quantidade: 10.5,
        ocorrencia: 'Leve agitação',
      },
    ],
  },
  // NOVOS DADOS: Histórico de Ciclos Anteriores
  ciclosAnteriores: [
    {
      id: 'c2024',
      titulo: 'Lactação 2024',
      periodo: 'Jan 2024 - Set 2024',
      totalLitros: 2450.5,
      dias: 248,
      ordenhas: [
        {
          id: 101,
          data: '2024-09-15',
          periodo: 'Manhã',
          quantidade: 12.5,
          ocorrencia: 'Secagem',
        },
        {
          id: 102,
          data: '2024-09-14',
          periodo: 'Tarde',
          quantidade: 11.2,
          ocorrencia: null,
        },
        {
          id: 103,
          data: '2024-09-14',
          periodo: 'Manhã',
          quantidade: 13.8,
          ocorrencia: null,
        },
        {
          id: 104,
          data: '2024-01-10',
          periodo: 'Manhã',
          quantidade: 8.5,
          ocorrencia: 'Início',
        },
      ],
    },
    {
      id: 'c2023',
      titulo: 'Lactação 2023',
      periodo: 'Mar 2023 - Nov 2023',
      totalLitros: 2100.2,
      dias: 260,
      ordenhas: [
        {
          id: 201,
          data: '2023-11-20',
          periodo: 'Manhã',
          quantidade: 10.1,
          ocorrencia: null,
        },
        {
          id: 202,
          data: '2023-03-05',
          periodo: 'Manhã',
          quantidade: 9.2,
          ocorrencia: null,
        },
      ],
    },
  ],
};

/* -------------------------------------------------------------------------- */
/* COMPONENTES INTERNOS                      */
/* -------------------------------------------------------------------------- */

const DetailMetric = ({ label, value, subValue, icon: Icon }) => (
  <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 flex items-start gap-3">
    <div className="p-2 bg-white rounded-md border border-slate-200 shadow-sm text-amber-600">
      {Icon ? <Icon className="w-4 h-4" /> : <Droplet className="w-4 h-4" />}
    </div>
    <div>
      <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
        {label}
      </p>
      <p className="text-lg font-bold text-slate-800">{value}</p>
      {subValue && <p className="text-xs text-slate-400 mt-0.5">{subValue}</p>}
    </div>
  </div>
);

// Novo componente para o Accordion dos ciclos anteriores
function CicloAccordion({ ciclo, columns, renderCell, isOpen, onToggle }) {
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white transition-all hover:border-amber-200">
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between p-4 text-left transition-colors ${isOpen ? 'bg-amber-50' : 'bg-white hover:bg-slate-50'}`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-full ${isOpen ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}
          >
            <Archive className="w-4 h-4" />
          </div>
          <div>
            <h5 className="font-bold text-slate-800 text-sm">{ciclo.titulo}</h5>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Calendar className="w-3 h-3" /> {ciclo.periodo}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <span className="text-xs text-slate-400 block uppercase">
              Total Produzido
            </span>
            <span className="text-sm font-bold text-amber-600">
              {ciclo.totalLitros} L
            </span>
          </div>
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </div>
      </button>
      {isOpen && (
        <div className="border-t border-slate-100 animate-in slide-in-from-top-1">
          <div className="bg-slate-50/50 p-2 flex justify-between items-center px-4 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-500 uppercase">
              Registros do Ciclo
            </span>
            <span className="text-xs text-slate-400">
              {ciclo.ordenhas.length} registros
            </span>
          </div>
          <Table
            columns={columns}
            data={ciclo.ordenhas}
            renderCell={renderCell}
            minWidth="100%"
            className="border-0 shadow-none rounded-none"
          />
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* COMPONENTE PRINCIPAL                      */
/* -------------------------------------------------------------------------- */

export default function LactacaoDetailModal({
  isOpen = true,
  onClose,
  animalId,
}) {
  // isOpen true default apenas para preview
  const [activeTab, setActiveTab] = useState('ciclo');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedCicloId, setExpandedCicloId] = useState(null);

  // AUMENTADO DE 5 PARA 7: Isso preenche melhor o espaço vertical disponível e evita paginação desnecessária com poucos itens.
  const itemsPerPage = 7;

  const data = MOCK_DETAIL_DATA;

  // Paginação para o Ciclo Atual
  const paginatedOrdenhas = data.cicloAtual.ordenhas.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(data.cicloAtual.ordenhas.length / itemsPerPage);

  const columns = [
    { key: 'data', label: 'Data', className: 'text-left pl-4' },
    { key: 'periodo', label: 'Período', className: 'text-left' },
    {
      key: 'quantidade',
      label: 'Quantidade (L)',
      className: 'font-bold text-slate-700',
    },
    { key: 'ocorrencia', label: 'Ocorrência', className: 'text-right pr-4' },
  ];

  const renderCell = (row, key) => {
    if (key === 'data') {
      const [ano, mes, dia] = row.data.split('-');
      return `${dia}/${mes}/${ano}`;
    }
    if (key === 'ocorrencia') {
      return row.ocorrencia ? (
        <span className="inline-flex items-center gap-1 text-amber-600 text-xs font-medium bg-amber-50 px-2 py-1 rounded-full border border-amber-100 justify-end">
          <AlertCircle className="w-3 h-3" /> {row.ocorrencia}
        </span>
      ) : (
        <span className="text-slate-400 text-right block">-</span>
      );
    }
    if (key === 'quantidade') return `${row.quantidade.toFixed(2)} L`;
    return row[key];
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="4xl"
      title={
        <div className="flex flex-col">
          <span className="flex items-center gap-2">
            Resumo de Produção •{' '}
            <span className="text-amber-600">{data.animal.nome}</span>
          </span>
          <span className="text-xs font-normal text-slate-500 mt-1">
            Brinco:{' '}
            <span className="font-mono text-slate-700 font-medium">
              {data.animal.brinco}
            </span>{' '}
            • {data.animal.raca}
          </span>
        </div>
      }
      footer={
        <Button variant="ghost" onClick={onClose}>
          Fechar
        </Button>
      }
    >
      <div className="flex flex-col gap-6">
        <div className="flex border-b border-slate-200">
          {[
            { id: 'ciclo', label: 'Ciclo Atual' },
            { id: 'historico', label: 'Histórico' },
            { id: 'grafico', label: 'Gráfico' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id ? 'border-amber-500 text-amber-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* --- CONTEÚDO DA ABA CICLO ATUAL --- */}
        {activeTab === 'ciclo' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="lg:col-span-1 space-y-3">
              <h4 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                <Activity className="w-4 h-4 text-slate-400" /> Resumo
              </h4>
              <DetailMetric
                label="Total de Ordenhas"
                value={data.cicloAtual.totalOrdenhas}
                icon={Calendar}
              />
              <DetailMetric
                label="Média por Ordenha"
                value={`${data.cicloAtual.mediaOrdenha} L`}
                icon={Droplet}
              />
              <DetailMetric
                label="Maior Ordenha"
                value={`${data.cicloAtual.maiorOrdenha} L`}
                icon={TrendingUp}
              />
              <DetailMetric
                label="Menor Ordenha"
                value={`${data.cicloAtual.menorOrdenha} L`}
                icon={TrendingDown}
              />
              <div className="pt-4 border-t border-slate-100 mt-4">
                <div className="bg-amber-50 rounded-lg p-4 border border-amber-100 text-center">
                  <p className="text-xs text-amber-700 uppercase font-bold tracking-wider mb-1">
                    Total Acumulado
                  </p>
                  <p className="text-3xl font-extrabold text-amber-600">
                    {data.cicloAtual.totalAcumulado} L
                  </p>
                </div>
              </div>
            </div>
            <div className="lg:col-span-2 flex flex-col">
              <h4 className="text-sm font-bold text-slate-800 mb-3">
                Ordenhas do Ciclo Atual
              </h4>

              {/* CORREÇÃO AQUI: Removido 'flex-1' para o quadro não esticar e criar lacunas brancas */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
                <Table
                  columns={columns}
                  data={paginatedOrdenhas}
                  renderCell={renderCell}
                  minWidth="100%"
                  className="border-0 shadow-none rounded-none"
                />
              </div>

              <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-100">
                <span className="text-xs text-slate-400">
                  Página {currentPage} de {totalPages}
                </span>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            </div>
          </div>
        )}

        {/* --- CONTEÚDO DA ABA HISTÓRICO (ALTERADO) --- */}
        {activeTab === 'historico' && (
          <div className="animate-in fade-in duration-300 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Archive className="w-4 h-4 text-slate-400" /> Ciclos Anteriores
              </h4>
            </div>

            {data.ciclosAnteriores.map((ciclo) => (
              <CicloAccordion
                key={ciclo.id}
                ciclo={ciclo}
                columns={columns}
                renderCell={renderCell}
                isOpen={expandedCicloId === ciclo.id}
                onToggle={() =>
                  setExpandedCicloId(
                    expandedCicloId === ciclo.id ? null : ciclo.id
                  )
                }
              />
            ))}

            {data.ciclosAnteriores.length === 0 && (
              <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                Nenhum histórico anterior encontrado.
              </div>
            )}
          </div>
        )}

        {/* --- CONTEÚDO DA ABA GRÁFICO --- */}
        {activeTab === 'grafico' && (
          <div className="h-[300px] w-full animate-in fade-in duration-300 bg-slate-50 rounded-xl border border-slate-200 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[...data.cicloAtual.ordenhas].reverse()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="data"
                  tickFormatter={(val) => {
                    const [_, mes, dia] = val.split('-');
                    return `${dia}/${mes}`;
                  }}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="quantidade"
                  stroke="#d97706"
                  strokeWidth={3}
                  activeDot={{ r: 6, fill: '#fbbf24' }}
                  name="Litros"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </Modal>
  );
}
