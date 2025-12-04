import React from 'react';
import DashboardContainer from '@/components/ui/DashboardContainer';
import {
  ResponsiveContainer,
  BarChart,
  XAxis,
  YAxis,
  Bar,
  CartesianGrid,
  Cell,
  Tooltip,
} from 'recharts';

export default function RacaChart({ data }) {
  const colors = ['#FCA90F', '#FFCF78', '#CE7D0A', '#F2B84D'];

  return (
    <DashboardContainer className="p-6 flex flex-col h-full">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 shrink-0">
        Distribuição por Raça
      </h2>
      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, bottom: 0, left: -20 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#E5E7EB"
            />
            <XAxis
              dataKey="raca"
              tick={{ fontSize: 14, fill: '#6B7280', fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
              interval={0}
            />
            <YAxis
              allowDecimals={false}
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
            />
            <Bar dataKey="quantidade" radius={[4, 4, 0, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={colors[i % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </DashboardContainer>
  );
}
