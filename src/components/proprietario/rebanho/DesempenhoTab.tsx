"use client";

import React, { useMemo } from "react";
import { Scale, Activity, TrendingUp } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart, Area,
  LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
} from "recharts";
import { Bufalo } from "@/services/bufalos.service";
import { useDadosZootecnicosByBufalo } from "@/hooks/useDadosZootecnicos";

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

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-5 flex flex-col gap-4">
      <h2 className="text-sm font-bold text-zinc-800">{title}</h2>
      {children}
    </div>
  );
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
          icon={<div className="p-2.5 bg-indigo-50 rounded-xl"><Scale className="w-5 h-5 text-indigo-500" /></div>}
          label="Peso Atual"
          value={`${ultimo!.peso.toFixed(2)} kg`}
        />
        <MetricCard
          icon={<div className="p-2.5 bg-indigo-50 rounded-xl"><TrendingUp className="w-5 h-5 text-indigo-500" /></div>}
          label="Ganho no Período"
          value={`${ganho >= 0 ? "+" : ""}${ganho.toFixed(2)} kg`}
        />
        <MetricCard
          icon={<div className="p-2.5 bg-indigo-50 rounded-xl"><Activity className="w-5 h-5 text-indigo-500" /></div>}
          label="Média de Peso"
          value={`${mediaPeso.toFixed(2)} kg`}
        />
      </div>

      {/* ── Curva de Peso ────────────────────────────────────────── */}
      <ChartCard title="Curva de Peso (kg)">
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={historico} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="pesoGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}    />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
            <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#a1a1aa" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#a1a1aa" }} axisLine={false} tickLine={false} domain={["auto", "auto"]} />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
              formatter={(value) => [`${toNumber(value as number).toFixed(2)} kg`, "Peso"]}
            />
            <ReferenceLine y={mediaPeso} stroke="#a5b4fc" strokeDasharray="4 4" strokeWidth={1.5} />
            <Area
              type="monotone"
              dataKey="peso"
              stroke="#6366f1"
              strokeWidth={2}
              fill="url(#pesoGrad)"
              dot={{ r: 3, fill: "#6366f1" }}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
        <p className="text-[11px] text-zinc-400 text-center">— linha tracejada = média do período</p>
      </ChartCard>

      {/* ── Evolução do ECC ──────────────────────────────────────── */}
      <ChartCard title="Evolução do Escore Corporal — ECC (0–5)">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={historico} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
            <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#a1a1aa" }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} tick={{ fontSize: 11, fill: "#a1a1aa" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
              formatter={(value) => [toNumber(value as number).toFixed(2), "ECC"]}
            />
            {/* Zonas de referência */}
            <ReferenceLine y={2.5} stroke="#fbbf24" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: "Mín ideal", position: "insideTopLeft", fontSize: 10, fill: "#fbbf24" }} />
            <ReferenceLine y={4.5} stroke="#f87171" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: "Máx ideal", position: "insideTopLeft", fontSize: 10, fill: "#f87171" }} />
            <Line
              type="monotone"
              dataKey="ecc"
              stroke="#6366f1"
              strokeWidth={2}
              dot={{ r: 3, fill: "#6366f1" }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
        <p className="text-[11px] text-zinc-400 text-center">Faixa ideal: 2.5 – 4.5 | Abaixo = subnutrição · Acima = obesidade</p>
      </ChartCard>
    </div>
  );
}
