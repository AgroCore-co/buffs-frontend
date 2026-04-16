"use client";

import React from 'react';
import Container from '@/components/ui/Container';
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
import { BarChart3 } from 'lucide-react';

interface ProducaoLeiteChartProps {
  data: any[];
  ano?: number;
  onAnoChange?: (ano: number) => void;
}

export default function ProducaoLeiteChart({ data, ano, onAnoChange }: ProducaoLeiteChartProps) {
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
      <Container className="p-6 flex flex-col h-full min-h-[400px]">
        {header}
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mb-4">
            <BarChart3 className="text-amber-400 w-8 h-8" />
          </div>
          <p className="text-gray-500 text-sm font-medium">
            Nenhuma produção registrada
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Registre ordenhas para ver a produção mensal
          </p>
        </div>
      </Container>
    );
  }

  // Ajustes de layout e estilo para melhor leitura
  const safeData = Array.isArray(data) ? data : [];
  const isSingle = safeData.length === 1;
  const chartMinHeight = 380; // aumentar altura para melhor presença visual
  const barSize = isSingle ? 140 : 100; // barra mais larga
  const barCategoryGap = isSingle ? '50%' : '5%';
  const chartMargin = isSingle
    ? { top: 10, right: 120, bottom: 0, left: 120 }
    : { top: 10, right: 10, bottom: 0, left: -20 };

  return (
    <Container className="p-6 flex flex-col h-full min-h-[400px]">
      {header}
      <div
        className="flex-1 w-full"
        style={{ minHeight: '300px', height: '100%' }}
      >
        <ResponsiveContainer
          width="100%"
          height="100%"
          minHeight={chartMinHeight}
        >
          <BarChart
            data={safeData}
            margin={chartMargin}
            barCategoryGap={barCategoryGap}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#F3F4F6"
            />
            <XAxis
              dataKey="name"
              interval={0}
              tick={{ fontSize: 16, fill: '#374151', fontWeight: 600 }}
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
              cursor={{ fill: '#FBF7ED' }}
              contentStyle={{
                borderRadius: '8px',
                border: 'none',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.08)',
              }}
              formatter={(value) => [
                `${Number(value).toLocaleString('pt-BR')} L`,
                'Produção',
              ]}
            />
            <Bar dataKey="producao" radius={[4, 4, 0, 0]} barSize={barSize}>
              {safeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill="#CE7D0A" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Container>
  );
}