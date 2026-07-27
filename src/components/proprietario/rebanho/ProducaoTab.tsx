"use client";

import React, { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Droplets, TrendingUp, CalendarClock, Plus, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import MetricCard from "@/components/ui/MetricCard";
import ChartSkeleton from "@/components/ui/ChartSkeleton";
import { Bufalo } from "@/services/bufalos.service";
import { useResumoProducaoBufala } from "@/hooks/useOrdenhas";
import { RegistrarOrdenhaModal } from "./producao/RegistrarOrdenhaModal";
import { CiclosLactacao } from "./producao/CiclosLactacao";
import { PredicaoProducaoCard } from "./producao/PredicaoProducaoCard";

const ProducaoChart = dynamic(() => import("./producao/ProducaoChart"), {
  ssr: false,
  loading: () => <ChartSkeleton height={220} />,
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** "2025-11-23" → "23/11" para o eixo do gráfico. */
function shortDay(value: string) {
  const [, month, day] = value.slice(0, 10).split("-");
  return day && month ? `${day}/${month}` : value;
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function ProducaoTab({ bufalo }: { bufalo: Bufalo }) {
  const [showRegistrar, setShowRegistrar] = useState(false);

  const { data: resumo, isLoading: isLoadingResumo } = useResumoProducaoBufala(bufalo.idBufalo);

  const ciclo = resumo?.cicloAtual ?? null;
  const temCicloAtivo = !!ciclo;

  const chartData = useMemo(
    () => (resumo?.graficoProducao ?? []).map(p => ({ dia: shortDay(p.data), litros: p.quantidade })),
    [resumo],
  );

  return (
    <div className="animate-in fade-in duration-300 flex flex-col gap-5">

      {/* ── Métricas ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          variant="plain"
          icon={<div className="p-2.5 bg-emerald-50 rounded-xl"><Droplets className="w-5 h-5 text-emerald-500" /></div>}
          title="Produção do Ciclo"
          value={isLoadingResumo ? "..." : (ciclo ? ciclo.totalProduzido.toFixed(1) : "—")}
          sub={ciclo ? "L" : undefined}
        />
        <MetricCard
          variant="plain"
          icon={<div className="p-2.5 bg-emerald-50 rounded-xl"><TrendingUp className="w-5 h-5 text-emerald-500" /></div>}
          title="Média por Ordenha"
          value={isLoadingResumo ? "..." : (ciclo ? ciclo.mediaDiaria.toFixed(1) : "—")}
          sub={ciclo ? "L" : undefined}
        />
        <MetricCard
          variant="plain"
          icon={<div className="p-2.5 bg-emerald-50 rounded-xl"><CalendarClock className="w-5 h-5 text-emerald-500" /></div>}
          title="Dias em Lactação"
          value={isLoadingResumo ? "..." : (ciclo ? String(ciclo.diasEmLactacao) : "—")}
          sub={ciclo ? `· ${ciclo.numeroCiclo}º ciclo` : undefined}
        />
      </div>

      {/* ── Aviso sem ciclo ativo ────────────────────────────────── */}
      {!isLoadingResumo && !temCicloAtivo && (
        <div className="flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-200 p-4">
          <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-amber-700">
            Esta búfala não possui um ciclo de lactação ativo. Para registrar ordenhas, é necessário
            um ciclo em andamento. O histórico abaixo mostra ordenhas anteriores.
          </p>
        </div>
      )}

      {/* ── Gráfico ──────────────────────────────────────────────── */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-5">
        <h2 className="text-sm font-bold text-zinc-800 mb-4">Produção dos Últimos 30 Dias (L)</h2>
        {chartData.length === 0 ? (
          <div className="h-[220px] flex flex-col items-center justify-center gap-2 text-zinc-300">
            <Droplets className="w-7 h-7" />
            <span className="text-sm">Sem ordenhas nos últimos 30 dias</span>
          </div>
        ) : (
          <ProducaoChart data={chartData} />
        )}
      </div>

      {/* ── Predição de produção (IA) ────────────────────────────── */}
      <PredicaoProducaoCard idFemea={bufalo.idBufalo} />

      {/* ── Ciclos de Lactação (lista + ordenhas por ciclo) ──────── */}
      {isLoadingResumo ? (
        <div className="bg-white border border-zinc-200 rounded-2xl flex flex-col items-center justify-center h-52 gap-2 text-zinc-400">
          <div className="w-5 h-5 border-2 border-zinc-300 border-t-zinc-700 rounded-full animate-spin" />
          <span className="text-sm font-medium">Carregando ciclos...</span>
        </div>
      ) : (
        <CiclosLactacao
          cicloAtual={ciclo}
          comparativoCiclos={resumo?.comparativoCiclos ?? []}
          action={
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowRegistrar(true)}
              disabled={!temCicloAtivo}
              title={temCicloAtivo ? undefined : "Búfala sem ciclo de lactação ativo"}
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Registrar ordenha
            </Button>
          }
        />
      )}

      {/* ── Modal ────────────────────────────────────────────────── */}
      {temCicloAtivo && ciclo && (
        <RegistrarOrdenhaModal
          isOpen={showRegistrar}
          onClose={() => setShowRegistrar(false)}
          idBufala={bufalo.idBufalo}
          idPropriedade={bufalo.idPropriedade}
          idCicloLactacao={ciclo.idCicloLactacao}
          onCreated={() => setShowRegistrar(false)}
        />
      )}
    </div>
  );
}
