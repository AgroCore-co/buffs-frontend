import React from 'react';
import DashboardContainer from '@/components/ui/DashboardContainer';
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
import { FiBarChart2 } from 'react-icons/fi';

export default function ProducaoLeiteChart({ data, ano, onAnoChange }) {
  // Gerar lista de anos (últimos 5 anos)
  const anoAtual = new Date().getFullYear();
  const anos = Array.from({ length: 5 }, (_, i) => anoAtual - i);

  // Header com seletor de ano (sempre visível)
  const header = (
    <div className="flex items-center justify-between mb-4 shrink-0">
      <h2 className="text-lg font-semibold text-gray-800">
        Produção de Leite Mensal
      </h2>
      {onAnoChange && (
        <select
          value={ano || anoAtual}
          onChange={(e) => onAnoChange(Number(e.target.value))}
          className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent cursor-pointer hover:bg-gray-50 transition-colors"
        >
          {anos.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      )}
    </div>
  );

  // Empty state quando não há dados
  if (!data || data.length === 0) {
    return (
      <DashboardContainer className="p-6 flex flex-col h-full min-h-[400px]">
        {header}
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mb-4">
            <FiBarChart2 className="text-amber-400 text-3xl" />
          </div>
          <p className="text-gray-500 text-sm font-medium">
            Nenhuma produção registrada
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Registre ordenhas para ver a produção mensal
          </p>
        </div>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer className="p-6 flex flex-col h-full min-h-[400px]">
      {header}
      <div
        className="flex-1 w-full"
        style={{ minHeight: '300px', height: '100%' }}
      >
        <ResponsiveContainer width="100%" height="100%" minHeight={300}>
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, bottom: 0, left: -20 }}
            barCategoryGap="5%"
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#E5E7EB"
            />
            <XAxis
              dataKey="name"
              interval={0}
              tick={{ fontSize: 14, fill: '#6B7280', fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 'auto']}
              tick={{ fontSize: 14, fill: '#6B7280', fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => value.toLocaleString('pt-BR')}
            />
            <Tooltip
              cursor={{ fill: '#F3F4F6' }}
              contentStyle={{
                borderRadius: '8px',
                border: 'none',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
              formatter={(value) => [`${value} L`, 'Produção']}
            />
            <Bar dataKey="producao" radius={[4, 4, 0, 0]} barSize={80}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill="#CE7D0A" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </DashboardContainer>
  );
}
