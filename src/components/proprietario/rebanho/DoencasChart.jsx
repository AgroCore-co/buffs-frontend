import React from 'react';
import DashboardContainer from '@/components/ui/DashboardContainer';
import {
  ResponsiveContainer,
  BarChart,
  XAxis,
  YAxis,
  Bar,
  CartesianGrid,
  Tooltip,
} from 'recharts';

export default function DoencasChart({ data }) {
  return (
    <DashboardContainer>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Frequência de Doenças
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#E5E7EB"
          />
          <XAxis
            dataKey="doenca"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6B7280' }}
          />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
          <Tooltip
            contentStyle={{
              borderRadius: '8px',
              border: 'none',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
          />
          <Bar dataKey="frequencia" fill="#CE7D0A" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </DashboardContainer>
  );
}
