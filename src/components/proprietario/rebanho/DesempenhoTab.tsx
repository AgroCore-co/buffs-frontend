"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { Scale, Activity, TrendingUp } from "lucide-react";
import MetricCard from "@/components/ui/MetricCard";
import ChartSkeleton from "@/components/ui/ChartSkeleton";
import { Bufalo } from "@/services/bufalos.service";
import { useDadosZootecnicosByBufalo } from "@/hooks/useDadosZootecnicos";

const DesempenhoCharts = dynamic(() => import("./DesempenhoCharts"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col gap-5">
      <div className="bg-white border border-zinc-200 rounded-2xl p-5">
        <ChartSkeleton height={220} />
      </div>
      <div className="bg-white border border-zinc-200 rounded-2xl p-5">
        <ChartSkeleton height={220} />
      </div>
    </div>
  ),
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

/** "2025-11-01 00:00:00+00" → "Nov/25" (sem conversão de fuso). */
function monthLabel(value?: string | null): string {
  if (!value) return "—";
  const datePart = value.slice(0, 10);
  const [year, month] = datePart.split("-");
  const idx = Number(month) - 1;
  if (Number.isNaN(idx) || idx < 0 || idx > 11) return datePart;
  return `${MESES[idx]}/${year.slice(2)}`;
}

function toNumber(value: string | number | null | undefined): number {
  const n = typeof value === "number" ? value : parseFloat(value ?? "");
  return Number.isNaN(n) ? 0 : n;
}

interface PontoHistorico {
  mes: string;
  peso: number;
  ecc: number;
}

// ─── Componente principal ─────────────────────────────────────────────────────

// Janela ampla o suficiente para montar a curva histórica do animal.
const LIMIT = 100;

export function DesempenhoTab({ bufalo }: { bufalo: Bufalo }) {
  const { data, isLoading, isError } = useDadosZootecnicosByBufalo(bufalo.idBufalo, {
    page: 1,
    limit: LIMIT,
  });

  // A API retorna do mais recente ao mais antigo; ordenamos cronologicamente.
  const historico = useMemo<PontoHistorico[]>(() => {
    const registros = data?.data ?? [];
    return [...registros]
      .sort((a, b) => a.dtRegistro.localeCompare(b.dtRegistro))
      .map((r) => ({
        mes: monthLabel(r.dtRegistro),
        peso: toNumber(r.peso),
        ecc: toNumber(r.condicaoCorporal),
      }));
  }, [data]);

  const temDados   = historico.length > 0;
  const ultimo     = temDados ? historico[historico.length - 1] : undefined;
  const primeiro   = temDados ? historico[0] : undefined;
  const ganho      = ultimo && primeiro ? ultimo.peso - primeiro.peso : 0;
  const mediaPeso  = temDados ? historico.reduce((s, h) => s + h.peso, 0) / historico.length : 0;

  if (isLoading) {
    return (
      <div className="animate-in fade-in duration-300 flex items-center justify-center h-72">
        <div className="flex flex-col items-center gap-2 text-zinc-400">
          <div className="w-6 h-6 border-2 border-zinc-300 border-t-zinc-700 rounded-full animate-spin" />
          <span className="text-sm font-medium">Carregando histórico de desempenho...</span>
        </div>
      </div>
    );
  }

  if (isError || !temDados) {
    return (
      <div className="animate-in fade-in duration-300 flex flex-col items-center justify-center h-72 gap-2 text-center">
        <Scale className="w-8 h-8 text-zinc-200" />
        <p className="text-sm font-semibold text-zinc-400">
          {isError ? "Erro ao carregar o desempenho" : "Sem dados de desempenho"}
        </p>
        <p className="text-xs text-zinc-300 max-w-xs">
          {isError
            ? "Não foi possível buscar o histórico zootécnico. Tente novamente."
            : "Registre pesagens e avaliações no histórico zootécnico para acompanhar a evolução."}
        </p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-300 flex flex-col gap-5">

      {/* ── Métricas ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          variant="plain"
          icon={<div className="p-2.5 bg-indigo-50 rounded-xl"><Scale className="w-5 h-5 text-indigo-500" /></div>}
          title="Peso Atual"
          value={`${ultimo!.peso.toFixed(2)} kg`}
        />
        <MetricCard
          variant="plain"
          icon={<div className="p-2.5 bg-indigo-50 rounded-xl"><TrendingUp className="w-5 h-5 text-indigo-500" /></div>}
          title="Ganho no Período"
          value={`${ganho >= 0 ? "+" : ""}${ganho.toFixed(2)} kg`}
        />
        <MetricCard
          variant="plain"
          icon={<div className="p-2.5 bg-indigo-50 rounded-xl"><Activity className="w-5 h-5 text-indigo-500" /></div>}
          title="Média de Peso"
          value={`${mediaPeso.toFixed(2)} kg`}
        />
      </div>

      <DesempenhoCharts historico={historico} mediaPeso={mediaPeso} />
    </div>
  );
}
