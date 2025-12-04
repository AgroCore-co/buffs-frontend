'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import Loading from '@/components/loading/Loading';
import Button from '@/components/ui/Button';
import Pagination from '@/components/ui/Pagination';
import {
  FilterBar,
  FilterInput,
  FilterSelect,
} from '@/components/ui/FilterBar';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import DashboardContainer from '@/components/ui/DashboardContainer';
import MetricCard from '@/components/ui/MetricCard';
import {
  FiActivity,
  FiDroplet,
  FiRefreshCw,
  FiTrendingUp,
  FiAlertCircle,
  FiPlus,
} from 'react-icons/fi';
import ProductionModal from '@/components/proprietario/lactacao/ProductionModal';

// --- DADOS MOCKADOS (ESTÁTICOS) ---

const metrics = {
  lactando: 17,
  producaoMes: '286.5 L',
  comparacaoMes: '+54.2%',
  producaoAnterior: '185.8 L',
  totalCiclos: 94,
};

const lactationCurveData = [
  { mes: 'Jan', producao: 210, variacao: 0 },
  { mes: 'Fev', producao: 230, variacao: 9.5 },
  { mes: 'Mar', producao: 250, variacao: 8.7 },
  { mes: 'Abr', producao: 286.5, variacao: 14.6 },
  { mes: 'Mai', producao: 270, variacao: -5.8 },
  { mes: 'Jun', producao: 240, variacao: -11.1 },
];

const ordenhaMock = [
  {
    id: 1,
    dt_ordenha: '2023-10-25',
    bufalo: { nome: 'Estrela', brinco: '001' },
    periodo: 'M',
    qt_ordenha: 6.5,
    ocorrencia: 'Mastite leve',
  },
  {
    id: 2,
    dt_ordenha: '2023-10-25',
    bufalo: { nome: 'Luna', brinco: '042' },
    periodo: 'M',
    qt_ordenha: 5.8,
    ocorrencia: '',
  },
  {
    id: 3,
    dt_ordenha: '2023-10-25',
    bufalo: { nome: 'Mimosa', brinco: '103' },
    periodo: 'M',
    qt_ordenha: 6.2,
    ocorrencia: '',
  },
  {
    id: 4,
    dt_ordenha: '2023-10-24',
    bufalo: { nome: 'Estrela', brinco: '001' },
    periodo: 'T',
    qt_ordenha: 5.2,
    ocorrencia: '',
  },
  {
    id: 5,
    dt_ordenha: '2023-10-24',
    bufalo: { nome: 'Luna', brinco: '042' },
    periodo: 'T',
    qt_ordenha: 4.9,
    ocorrencia: '',
  },
  {
    id: 6,
    dt_ordenha: '2023-10-24',
    bufalo: { nome: 'Preta', brinco: '055' },
    periodo: 'M',
    qt_ordenha: 5.5,
    ocorrencia: '',
  },
  {
    id: 7,
    dt_ordenha: '2023-10-23',
    bufalo: { nome: 'Malhada', brinco: '020' },
    periodo: 'M',
    qt_ordenha: 7.1,
    ocorrencia: '',
  },
  {
    id: 8,
    dt_ordenha: '2023-10-23',
    bufalo: { nome: 'Estrela', brinco: '001' },
    periodo: 'M',
    qt_ordenha: 6.8,
    ocorrencia: '',
  },
];

const femeasMock = [
  { id_bufalo: '1', nome: 'Estrela', brinco: '001', classificacao: 'Ótima' },
  { id_bufalo: '2', nome: 'Luna', brinco: '042', classificacao: 'Boa' },
  { id_bufalo: '3', nome: 'Mimosa', brinco: '103', classificacao: 'Boa' },
  { id_bufalo: '4', nome: 'Preta', brinco: '055', classificacao: 'Mediana' },
  { id_bufalo: '5', nome: 'Malhada', brinco: '020', classificacao: 'Ótima' },
];

export default function Lactacao() {
  const { loading } = useProtectedRoute(['PROPRIETARIO']);

  // --- ESTADOS ---
  const [ordenhas, setOrdenhas] = useState(ordenhaMock);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    total: ordenhaMock.length,
    totalPages: 2,
  });

  // Estado do modal de produção
  const [selectedAnimal, setSelectedAnimal] = useState(null);

  // Simulação de paginação client-side para o mock
  const paginatedOrdenhas = useMemo(() => {
    const startIndex = (pagination.page - 1) * pagination.limit;
    return ordenhas.slice(startIndex, startIndex + pagination.limit);
  }, [pagination.page, pagination.limit, ordenhas]);

  // --- HANDLERS ---

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleRowClick = (row) => {
    setSelectedAnimal(row.bufalo?.brinco || null);
  };

  if (loading) return <Loading text="Carregando controle leiteiro..." />;

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500">
      {/* --- HEADER E CARDS --- */}
      <DashboardContainer>
        <div>
          <h1 className="text-2xl font-bold text-[#404040] mb-1">
            Controle de Produção
          </h1>
          <p className="text-[#404040]/70 text-sm">
            Gerencie a produção leiteira e os ciclos de lactação do rebanho.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Búfalas Lactando */}
          <MetricCard
            title="Búfalas Lactando"
            value={metrics.lactando}
            subtitle="Dados do mês atual"
            icon={<FiActivity className="text-[#ce7d0a]" />}
          />

          {/* Card 2: Produção */}
          <MetricCard
            title="Leite produzido (mês atual)"
            value={metrics.producaoMes}
            subtitle={
              <span className="flex flex-col sm:flex-row sm:items-center gap-1">
                <span className="text-green-600 font-bold flex items-center gap-1">
                  <FiTrendingUp /> {metrics.comparacaoMes}
                </span>
                <span className="text-xs text-gray-500">
                  ({metrics.producaoAnterior} no mês anterior)
                </span>
              </span>
            }
            icon={<FiDroplet className="text-[#ce7d0a]" />}
          />

          {/* Card 3: Total de Ciclos */}
          <MetricCard
            title="Total de Ciclos"
            value={metrics.totalCiclos}
            subtitle="Ciclos reprodutivos registrados"
            icon={<FiRefreshCw className="text-[#ce7d0a]" />}
          />
        </div>
      </DashboardContainer>

      {/* --- GRÁFICOS E ALERTAS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Produção Mês a Mês */}
        <DashboardContainer className="p-6 col-span-2">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 border-l-4 border-[#ffcf78] pl-3">
            Produção mês a mês (2025)
          </h2>
          <div className="w-full h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={lactationCurveData}
                margin={{ top: 20, right: 20, bottom: 0, left: -20 }}
                barCategoryGap="5%"
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E5E7EB"
                />
                <XAxis
                  dataKey="mes"
                  tick={{ fontSize: 14, fill: '#6B7280', fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[200, 300]}
                  tick={{ fontSize: 14, fill: '#6B7280', fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: '#F3F4F6' }}
                  contentStyle={{
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                  formatter={(value, name, props) => {
                    const variacao = props.payload.variacao;
                    return [
                      <div key="tooltip" className="flex flex-col gap-1">
                        <span className="font-bold">{value} L</span>
                        {variacao !== 0 && (
                          <span
                            className={`text-xs font-semibold ${variacao > 0 ? 'text-green-600' : 'text-red-600'}`}
                          >
                            {variacao > 0 ? '▲' : '▼'}{' '}
                            {Math.abs(variacao).toFixed(1)}%
                          </span>
                        )}
                      </div>,
                      'Produção',
                    ];
                  }}
                />
                <Bar dataKey="producao" radius={[4, 4, 0, 0]} barSize={80}>
                  {lactationCurveData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.variacao > 0
                          ? '#FCA90F'
                          : entry.variacao < 0
                            ? '#CE7D0A'
                            : '#FFCF78'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </DashboardContainer>

        {/* Card de Alertas Clínicos (quadrado) */}
        <DashboardContainer className="p-6 flex flex-col h-full min-h-[350px] col-span-1 justify-center items-center">
          <div className="flex justify-between items-start mb-6 w-full">
            <h2 className="text-xl font-bold text-[#404040]">
              Alertas Clínicos
            </h2>
            <button className="bg-[#FFCF78] hover:bg-[#fca90f] text-[#404040] font-medium py-1.5 px-4 rounded text-sm transition-colors">
              Ver Todos
            </button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center text-center w-full">
            <p className="text-gray-500 text-lg">Nenhum alerta no momento.</p>
          </div>
        </DashboardContainer>
      </div>

      {/* --- TABELA E AÇÕES --- */}
      <DashboardContainer>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#404040] mb-1">
              Registros de Ordenha
            </h1>
            <p className="text-[#404040]/70 text-sm">
              Histórico recente de pesagem do leite
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="report"
              size="medium"
              className="flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Relatório
            </Button>
            <Button
              variant="primary"
              size="medium"
              className="font-bold flex items-center gap-2"
              // Sem ação de modal
            >
              <FiPlus /> Nova Ordenha
            </Button>
          </div>
        </div>

        {/* Filtros - usando FilterBar do sistema */}
        <FilterBar>
          <FilterInput type="date" />
          <FilterSelect defaultValue="">
            <option disabled value="">
              Período: Todos
            </option>
            <option value="M">Manhã</option>
            <option value="T">Tarde</option>
          </FilterSelect>
        </FilterBar>

        {/* Tabela */}
        {(() => {
          const Table = require('@/components/table/Table').default;
          const columns = [
            {
              key: 'dt_ordenha',
              label: 'Data',
              className: 'p-4 text-left font-semibold',
            },
            {
              key: 'bufalo',
              label: 'Animal (TAG)',
              className: 'p-4 text-left font-semibold',
            },
            {
              key: 'periodo',
              label: 'Período',
              className: 'p-4 text-left font-semibold',
            },
            {
              key: 'qt_ordenha',
              label: 'Produção',
              className: 'p-4 text-left font-semibold',
            },
            {
              key: 'ocorrencia',
              label: 'Ocorrência',
              className: 'p-4 text-left font-semibold',
            },
          ];

          return (
            <Table
              columns={columns}
              data={paginatedOrdenhas}
              minWidth="900px"
              onRowClick={handleRowClick}
              renderCell={(row, key) => {
                if (key === 'dt_ordenha') {
                  const date = new Date(row.dt_ordenha);
                  // Ajuste simples para não perder 1 dia por timezone no mock
                  const userTimezoneOffset = date.getTimezoneOffset() * 60000;
                  const correctedDate = new Date(
                    date.getTime() + userTimezoneOffset
                  );
                  return correctedDate.toLocaleDateString('pt-BR');
                }
                if (key === 'bufalo') {
                  return (
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">
                        {row.bufalo?.nome || 'Desconhecido'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {row.bufalo?.brinco || '-'}
                      </span>
                    </div>
                  );
                }
                if (key === 'periodo') {
                  return (
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        row.periodo === 'M'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}
                    >
                      {row.periodo === 'M' ? 'Manhã' : 'Tarde'}
                    </span>
                  );
                }
                if (key === 'qt_ordenha') {
                  return (
                    <span className="font-bold text-gray-700">
                      {row.qt_ordenha} L
                    </span>
                  );
                }
                if (key === 'ocorrencia') {
                  return row.ocorrencia ? (
                    <div className="flex items-center text-amber-600 text-sm">
                      <FiAlertCircle className="mr-1" /> {row.ocorrencia}
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  );
                }
                return row[key];
              }}
            />
          );
        })()}
        {/* Modal de produção individual */}
        <ProductionModal
          isOpen={!!selectedAnimal}
          onClose={() => setSelectedAnimal(null)}
          animalId={selectedAnimal}
        />

        {/* Paginação */}
        <div className="flex justify-between items-center mt-6 text-sm text-gray-600">
          <p>
            Mostrando {paginatedOrdenhas.length} de {pagination.total} registros
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
  );
}
