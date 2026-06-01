"use client";

import React, { useMemo, useState } from "react";
import { Droplets, TrendingUp, CalendarClock, Plus, AlertCircle } from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import { Button } from "@/components/ui/Button";
import { Bufalo } from "@/services/bufalos.service";
import { useResumoProducaoBufala } from "@/hooks/useOrdenhas";
import { RegistrarOrdenhaModal } from "./producao/RegistrarOrdenhaModal";
import { CiclosLactacao } from "./producao/CiclosLactacao";
import { PredicaoProducaoCard } from "./producao/PredicaoProducaoCard";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** "2025-11-23" → "23/11" para o eixo do gráfico. */
function shortDay(value: string) {
  const [, month, day] = value.slice(0, 10).split("-");
  return day && month ? `${day}/${month}` : value;
}

function toNumber(value: string | number | null | undefined): number {
  const n = typeof value === "number" ? value : parseFloat(value ?? "");
  return Number.isNaN(n) ? 0 : n;
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function MetricCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="flex items-center gap-4 bg-white border border-zinc-200 rounded-xl p-5">
      <div className="flex-shrink-0">{icon}</div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{label}</p>
        <p className="text-lg font-bold text-zinc-800 leading-tight">
          {value}
          {sub && <span className="text-sm font-normal text-zinc-400 ml-1">{sub}</span>}
        </p>
      </div>
    </div>
  );
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
          icon={<div className="p-2.5 bg-emerald-50 rounded-xl"><Droplets className="w-5 h-5 text-emerald-500" /></div>}
          label="Produção do Ciclo"
          value={isLoadingResumo ? "..." : (ciclo ? ciclo.totalProduzido.toFixed(1) : "—")}
          sub={ciclo ? "L" : undefined}
        />
        <MetricCard
          icon={<div className="p-2.5 bg-emerald-50 rounded-xl"><TrendingUp className="w-5 h-5 text-emerald-500" /></div>}
          label="Média por Ordenha"
          value={isLoadingResumo ? "..." : (ciclo ? ciclo.mediaDiaria.toFixed(1) : "—")}
          sub={ciclo ? "L" : undefined}
        />
        <MetricCard
          icon={<div className="p-2.5 bg-emerald-50 rounded-xl"><CalendarClock className="w-5 h-5 text-emerald-500" /></div>}
          label="Dias em Lactação"
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
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="prodGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
              <XAxis dataKey="dia" tick={{ fontSize: 11, fill: "#a1a1aa" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#a1a1aa" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                formatter={(value) => [`${toNumber(value as number).toFixed(1)} L`, "Produção"]}
              />
              <Area
                type="monotone"
                dataKey="litros"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#prodGradient)"
                dot={{ r: 3, fill: "#10b981" }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
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
