"use client";

import Container from "@/components/ui/Container";
import { BarChart2 } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  XAxis,
  YAxis,
  Bar,
  CartesianGrid,
  Cell,
  Tooltip,
} from "recharts";

export interface RacaItem {
  raca: string;
  quantidade: number;
}

interface RacaChartProps {
  data: RacaItem[];
  isLoading?: boolean;
  hasActivePropriedade?: boolean;
}

const COLORS = ["#CE7D0A", "#F2B84D", "#FFCF78", "#FCA90F"];

export default function RacaChart({
  data,
  isLoading = false,
  hasActivePropriedade = true,
}: RacaChartProps) {
  const total = data.reduce((sum, item) => sum + item.quantidade, 0);

  const emptyState = !hasActivePropriedade
    ? {
        title: "Selecione uma propriedade",
        description: "Escolha uma propriedade para visualizar a distribuição.",
      }
    : data.length === 0
      ? {
          title: "Nenhuma raça encontrada",
          description: "Cadastre animais para ver a distribuição por raça.",
        }
      : null;

  return (
    <Container className="p-5 flex flex-col w-full h-full">
      {/* Header — idêntico aos demais */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <h2 className="text-sm font-semibold text-gray-800 leading-tight">
            Distribuição por Raça
          </h2>
          {!isLoading && !emptyState && (
            <p className="text-xs text-gray-400 mt-0.5">
              {total.toLocaleString("pt-BR")} animal{total !== 1 ? "is" : ""} no
              total
            </p>
          )}
        </div>
        <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
          <BarChart2 className="w-3.5 h-3.5 text-amber-500" />
        </div>
      </div>

      {isLoading ? (
        <LoadingSkeleton />
      ) : emptyState ? (
        <EmptyState
          title={emptyState.title}
          description={emptyState.description}
        />
      ) : (
        <div className="flex-1 w-full min-h-[250px]">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={data}
              margin={{ top: 8, right: 4, bottom: 0, left: -20 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#F3F4F6"
              />
              <XAxis
                dataKey="raca"
                tick={{ fontSize: 11, fill: "#9CA3AF", fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
                interval={0}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: "#9CA3AF", fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: "#F8FCFA" }}
                contentStyle={{
                  borderRadius: "10px",
                  border: "1px solid #F3F4F6",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.07)",
                  fontSize: 12,
                  color: "#374151",
                }}
                formatter={(value) => [
                  typeof value === "number" ? value.toLocaleString("pt-BR") : "0",
                  "Animais",
                ]}
              />
              <Bar dataKey="quantidade" radius={[5, 5, 0, 0]} maxBarSize={48}>
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Container>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex-1 flex items-end gap-3 px-2 pb-1 min-h-[250px]">
      {[60, 90, 45, 75].map((h, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-lg bg-gray-100 animate-pulse"
          style={{ height: `${h}%`, animationDelay: `${i * 80}ms` }}
        />
      ))}
    </div>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center min-h-[250px]">
      <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center mb-3">
        <BarChart2 className="text-amber-400 w-5 h-5" />
      </div>
      <p className="text-gray-600 text-sm font-medium">{title}</p>
      <p className="text-gray-400 text-xs mt-1 max-w-[180px] leading-relaxed">
        {description}
      </p>
    </div>
  );
}
