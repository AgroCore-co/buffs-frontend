"use client";

import Container from "@/components/ui/Container";
import { Venus } from "lucide-react";

export interface SexoData {
  femeas: number;
  machos: number;
}

interface SexoChartProps {
  data: SexoData;
  isLoading?: boolean;
  hasActivePropriedade?: boolean;
}

const COLOR_FEMEA = "#CE7D0A";
const COLOR_MACHO = "#FFCF78";
const COLOR_EMPTY = "#F3F4F6";

function DonutChart({ femeas, machos }: { femeas: number; machos: number }) {
  const total = femeas + machos;
  const size = 130;
  const strokeWidth = 15;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const pctFemea = total > 0 ? femeas / total : 0;
  const pctMacho = total > 0 ? machos / total : 0;
  const gapFraction = total > 0 ? 3 / 360 : 0;

  const feaDash = Math.max(0, pctFemea - gapFraction) * circumference;
  const feaGap = circumference - feaDash;
  const feaOffset = -circumference * 0.25;

  const macDash = Math.max(0, pctMacho - gapFraction) * circumference;
  const macGap = circumference - macDash;
  const macOffset = feaOffset - pctFemea * circumference;

  const displayPct = total > 0 ? Math.round((femeas / total) * 100) : 0;

  return (
    <div
      className="relative flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={COLOR_EMPTY}
          strokeWidth={strokeWidth}
        />
        {total > 0 && pctMacho > 3 / 360 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={COLOR_MACHO}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${macDash} ${macGap}`}
            strokeDashoffset={macOffset}
            style={{ transition: "stroke-dasharray 0.6s ease" }}
          />
        )}
        {total > 0 && pctFemea > 3 / 360 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={COLOR_FEMEA}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${feaDash} ${feaGap}`}
            strokeDashoffset={feaOffset}
            style={{ transition: "stroke-dasharray 0.6s ease" }}
          />
        )}
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-extrabold text-gray-800 leading-none">
          {displayPct}%
        </span>
        <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest mt-0.5">
          Fêmeas
        </span>
      </div>
    </div>
  );
}

function Legend({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div className="flex items-center gap-2 w-full">
      <span
        className="w-2.5 h-2.5 rounded-full shrink-0"
        style={{ backgroundColor: color }}
      />
      <span className="text-sm text-gray-600 w-14">{label}</span>
      {/* Alterado para flex-1 para preencher o espaço e não quebrar o layout */}
      <span className="text-sm font-bold text-gray-800 flex-1 text-right min-w-[30px]">
        {value.toLocaleString("pt-BR")}
      </span>
      <span className="text-xs text-gray-400 ml-1 w-[40px] text-right shrink-0">({pct}%)</span>
    </div>
  );
}

export default function SexoChart({
  data,
  isLoading = false,
  hasActivePropriedade = true,
}: SexoChartProps) {
  const { femeas, machos } = data;
  const total = femeas + machos;

  const emptyState = !hasActivePropriedade
    ? {
        title: "Selecione uma propriedade",
        description: "Escolha uma propriedade para visualizar a distribuição.",
      }
    : null;

  return (
    <Container className="p-5 flex flex-col w-full h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <h2 className="text-sm font-semibold text-gray-800 leading-tight">
            Distribuição por Sexo
          </h2>
          {!isLoading && !emptyState && (
            <p className="text-xs text-gray-400 mt-0.5">
              {total.toLocaleString("pt-BR")} animal{total !== 1 ? "is" : ""} no total
            </p>
          )}
        </div>
        <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
          <Venus className="w-3.5 h-3.5 text-amber-500" />
        </div>
      </div>

      {isLoading ? (
        // Adicionado flex-wrap e justify-center
        <div className="flex-1 flex flex-wrap items-center justify-center gap-6">
          <div className="w-[130px] h-[130px] rounded-full bg-gray-100 animate-pulse shrink-0" />
          <div className="flex flex-col gap-3 flex-1 min-w-[140px]">
            <div className="h-4 w-full max-w-[128px] rounded bg-gray-100 animate-pulse" />
            <div
              className="h-4 w-full max-w-[112px] rounded bg-gray-100 animate-pulse"
              style={{ animationDelay: "80ms" }}
            />
          </div>
        </div>
      ) : emptyState ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center mb-3">
            <Venus className="text-amber-400 w-5 h-5" />
          </div>
          <p className="text-gray-600 text-sm font-medium">{emptyState.title}</p>
          <p className="text-gray-400 text-xs mt-1 max-w-[180px] leading-relaxed">
            {emptyState.description}
          </p>
        </div>
      ) : (
        // Adicionado flex-wrap e justify-center
        <div className="flex-1 flex flex-wrap items-center justify-center gap-x-8 gap-y-6">
          <DonutChart femeas={femeas} machos={machos} />
          <div className="flex flex-col gap-3 flex-1 min-w-[160px]">
            <Legend label="Fêmeas" value={femeas} total={total} color={COLOR_FEMEA} />
            <div className="h-px bg-gray-100 w-full" />
            <Legend label="Machos" value={machos} total={total} color={COLOR_MACHO} />
          </div>
        </div>
      )}
    </Container>
  );
}
