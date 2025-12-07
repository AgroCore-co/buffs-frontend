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

export default function ProducaoLeiteChart({ data }) {
  return (
    <DashboardContainer className="p-6 flex flex-col h-full min-h-[400px]">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 shrink-0">
        Produção de Leite Mensal
      </h2>
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
              domain={[1000, 2000]}
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
