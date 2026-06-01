"use client";

import { useTranslations } from "next-intl";
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

export default function MaturidadeChart({
  data,
  isLoading = false,
  hasActivePropriedade = true,
}: MaturidadeChartProps) {
  const t = useTranslations('Charts.maturity');
  const total = data.reduce((sum, item) => sum + item.value, 0);

  const emptyState = !hasActivePropriedade
    ? {
        title: t('selectProperty'),
        description: t('selectPropertyDesc'),
      }
    : total === 0
      ? {
          title: t('emptyTitle'),
          description: t('emptyDesc'),
        }
      : null;

  return (
    <Container className="p-5 flex flex-col w-full h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <h2 className="text-sm font-semibold text-gray-800 leading-tight">
            {t('title')}
          </h2>
          {!isLoading && !emptyState && (
            <p className="text-xs text-gray-400 mt-0.5">
              {t('totalAnimals', { count: total })}
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
        <DataList data={data} total={total} t={t} />
      )}
    </Container>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col justify-center gap-5 flex-1 py-2">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex flex-col gap-2 w-full">
          <div className="flex items-center justify-between">
            <div className="h-3.5 w-16 bg-gray-100 rounded animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
            <div className="h-3.5 w-10 bg-gray-100 rounded animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
          </div>
          <div className="h-2 w-full bg-gray-100 rounded-full animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center py-4 min-h-[200px]">
      <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center mb-3">
        <Layers className="text-amber-400 w-5 h-5" />
      </div>
      <p className="text-gray-600 text-sm font-medium">{title}</p>
      <p className="text-gray-400 text-xs mt-1 max-w-[180px] leading-relaxed">{description}</p>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function DataList({ data, total, t }: { data: MaturidadeItem[]; total: number; t: any }) {
  return (
    <div className="flex flex-col justify-center gap-4 flex-1 py-1">
      {data.map((item, index) => {
        const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
        const color = item.color || "#CE7D0A";
        const label = t.has(`labels.${item.name}`) ? t(`labels.${item.name}`) : item.name;

        return (
          <div key={`${item.name}-${index}`} className="flex flex-col gap-1.5 group">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                {label}
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm font-bold text-gray-800">
                  {item.value.toLocaleString("pt-BR")}
                </span>
                <span className="text-[11px] font-medium text-gray-400 w-8 text-right">
                  ({pct}%)
                </span>
              </div>
            </div>
            
            {/* Barra de Progresso Horizontal */}
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${pct}%`, backgroundColor: color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}