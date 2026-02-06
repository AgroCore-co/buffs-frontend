import React from 'react';
import DashboardContainer from '@/components/ui/DashboardContainer';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  Tooltip,
} from 'recharts';
import { FiDroplet } from 'react-icons/fi';

export default function TopBufalasChart({ data }) {
  const colors = ['#FCA90F', '#FFCF78', '#CE7D0A', '#F2B84D', '#E6A23C'];

  // Empty state quando não há dados
  if (!data || data.length === 0) {
    return (
      <DashboardContainer className="p-6 flex flex-col h-full min-h-[400px]">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 shrink-0">
          Top 5 Búfalas Produtoras
        </h2>
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mb-4">
            <FiDroplet className="text-amber-400 text-3xl" />
          </div>
          <p className="text-gray-500 text-sm font-medium">
            Nenhuma búfala em lactação
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Registre ordenhas para ver as melhores produtoras
          </p>
        </div>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer className="p-6 flex flex-col h-full min-h-[400px]">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 shrink-0">
        Top 5 Búfalas Produtoras
      </h2>
      <div
        className="flex-1 w-full"
        style={{ minHeight: '300px', height: '100%' }}
      >
        <ResponsiveContainer width="100%" height="100%" minHeight={300}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 10, right: 30, bottom: 10, left: 10 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#E5E7EB"
              horizontal={false}
            />
            <XAxis
              type="number"
              domain={[0, 'auto']}
              tick={{ fontSize: 12, fill: '#9CA3AF' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              dataKey="name"
              type="category"
              width={140}
              tick={{ fontSize: 14, fill: '#374151', fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: 'rgba(252, 169, 15, 0.1)' }}
              contentStyle={{
                borderRadius: '8px',
                border: 'none',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                padding: '8px 12px',
              }}
              formatter={(value) => [`${value} L/dia`, 'Produção Média']}
              labelStyle={{ fontWeight: 'bold', color: '#374151' }}
            />
            <Bar dataKey="leite" radius={[0, 6, 6, 0]} barSize={32}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </DashboardContainer>
  );
}
