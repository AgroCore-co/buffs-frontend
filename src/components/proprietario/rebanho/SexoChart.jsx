import React from 'react';
import DashboardContainer from '@/components/ui/DashboardContainer';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

export default function SexoChart({ data, totalAtivos, percentualFemeas }) {
  return (
    <DashboardContainer className="p-6 flex flex-col">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-lg font-semibold text-gray-800">
          Distribuição por Sexo
        </h2>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-stretch w-full">
        {/* Gráfico de Rosca Fina descentralizado */}
        <div className="flex-1 flex items-center justify-center">
          <div className="relative w-full h-[220px] z-10 max-w-[320px] mx-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={100}
                  paddingAngle={5}
                  startAngle={90}
                  endAngle={-270}
                  cornerRadius={6}
                >
                  {data.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip wrapperStyle={{ zIndex: 1000 }} />
              </PieChart>
            </ResponsiveContainer>
            {/* Texto Centralizado */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
              <span className="text-5xl font-bold text-gray-800">
                {percentualFemeas}%
              </span>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                Fêmeas
              </span>
            </div>
          </div>
        </div>

        {/* Legenda Customizada ao lado, índices mais próximos */}
        <div className="flex-1 flex flex-col justify-center gap-2 px-4 min-w-[220px]">
          {data.map((item, index) => {
            const percent = Math.round((item.value / totalAtivos) * 100);
            return (
              <div
                key={index}
                className="flex items-center gap-3 py-2 border-b border-dashed border-gray-100 last:border-0"
              >
                <div
                  className="w-3 h-3 rounded-full shadow-sm"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-base text-gray-700 font-semibold">
                  {item.name}
                </span>
                <span className="text-base font-bold text-gray-700">
                  {item.value}
                </span>
                <span className="text-base font-bold text-gray-700 bg-gray-50 px-2 py-0.5 rounded">
                  ({percent}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardContainer>
  );
}
