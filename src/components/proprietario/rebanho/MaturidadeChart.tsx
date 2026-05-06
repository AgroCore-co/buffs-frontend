"use client";

import Container from "@/components/ui/Container";
import { Layers } from "lucide-react";

export interface MaturidadeItem {
  name: string;
  value: number;
  color?: string;
}

interface MaturidadeChartProps {
  data: MaturidadeItem[];
  isLoading?: boolean;
  hasActivePropriedade?: boolean;
}

const SHORT_LABELS: Record<string, string> = {
  Bezerro: "Bezerros",
  Novilha: "Novilhas",
  Novilho: "Novilhos",
  Vaca: "Vacas",
  Touro: "Touros",
};

export default function MaturidadeChart({
  data,
  isLoading = false,
  hasActivePropriedade = true,
}: MaturidadeChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  const emptyState = !hasActivePropriedade
    ? {
        title: "Selecione uma propriedade",
        description: "Escolha uma propriedade para visualizar a distribuição.",
      }
    : total === 0
      ? {
          title: "Nenhum animal encontrado",
          description: "Cadastre animais para ver a distribuição de maturidade.",
        }
      : null;

  return (
    <Container className="p-5 flex flex-col w-full max-w-[360px] mr-auto min-h-[200px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <h2 className="text-sm font-semibold text-gray-800 leading-tight">
            Distribuição por Maturidade
          </h2>
          {!isLoading && !emptyState && (
            <p className="text-xs text-gray-400 mt-0.5">
              {total.toLocaleString("pt-BR")} animal{total !== 1 ? "is" : ""} no total
            </p>
          )}
        </div>
        <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
          <Layers className="w-3.5 h-3.5 text-amber-500" />
        </div>
      </div>

      {isLoading ? (
        <LoadingSkeleton />
      ) : emptyState ? (
        <EmptyState title={emptyState.title} description={emptyState.description} />
      ) : (
        <DataGrid data={data} total={total} />
      )}
    </Container>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-2 flex-1">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="rounded-xl bg-gray-100 animate-pulse"
          style={{ animationDelay: `${i * 80}ms`, aspectRatio: "1 / 1" }}
        />
      ))}
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
      <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center mb-3">
        <Layers className="text-amber-400 w-5 h-5" />
      </div>
      <p className="text-gray-600 text-sm font-medium">{title}</p>
      <p className="text-gray-400 text-xs mt-1 max-w-[180px] leading-relaxed">{description}</p>
    </div>
  );
}

function DataGrid({ data, total }: { data: MaturidadeItem[]; total: number }) {
  return (
    <div className="grid grid-cols-2 gap-2 flex-1">
      {data.map((item, index) => {
        const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
        const color = item.color || "#CE7D0A";
        const label = SHORT_LABELS[item.name] ?? item.name;

        return (
          <div
            key={`${item.name}-${index}`}
            className="relative flex flex-col items-center justify-center p-3 rounded-xl border border-gray-100 bg-[#f8fcfa] hover:border-amber-200 hover:shadow-sm transition-all duration-200 overflow-hidden"
            style={{ aspectRatio: "1 / 1" }}
          >
            {/* Barra de progresso no rodapé */}
            <div className="absolute bottom-0 left-0 h-[3px] w-full bg-gray-100">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, backgroundColor: color }}
              />
            </div>

            {/* Número grande centralizado */}
            <span
              className="text-3xl font-extrabold leading-none"
              style={{ color }}
            >
              {item.value.toLocaleString("pt-BR")}
            </span>

            {/* Label e percentual */}
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mt-1.5">
              {label}
            </span>
            <span className="text-[10px] text-gray-400 mt-0.5">
              {pct}%
            </span>
          </div>
        );
      })}
    </div>
  );
}