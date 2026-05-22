"use client";

import React from "react";
import { Scale, Activity, TrendingUp } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart, Area,
  LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
} from "recharts";
import { Bufalo } from "@/services/bufalos.service";

// ─── Mock (cronológico: do mais antigo ao mais recente) ───────────────────────

const HISTORICO = [
  { mes: "Dez/24", peso: 210.88, ecc: 2.10 },
  { mes: "Jan/25", peso: 192.40, ecc: 3.50 },
  { mes: "Fev/25", peso: 174.67, ecc: 4.27 },
  { mes: "Mar/25", peso: 275.32, ecc: 1.66 },
  { mes: "Abr/25", peso: 251.86, ecc: 1.13 },
  { mes: "Mai/25", peso: 221.51, ecc: 4.90 },
  { mes: "Jun/25", peso: 301.91, ecc: 4.62 },
  { mes: "Jul/25", peso: 247.49, ecc: 1.86 },
  { mes: "Ago/25", peso: 179.09, ecc: 3.71 },
  { mes: "Set/25", peso: 157.76, ecc: 4.34 },
  { mes: "Out/25", peso: 273.19, ecc: 1.01 },
  { mes: "Nov/25", peso: 181.16, ecc: 3.76 },
];

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

export function DesempenhoTab({ bufalo: _bufalo }: { bufalo: Bufalo }) {
  const ultimo   = HISTORICO[HISTORICO.length - 1];
  const primeiro = HISTORICO[0];
  const ganho    = ultimo.peso - primeiro.peso;
  const mediaPeso = HISTORICO.reduce((s, h) => s + h.peso, 0) / HISTORICO.length;

  return (
    <div className="animate-in fade-in duration-300 flex flex-col gap-5">

      {/* ── Métricas ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          icon={<div className="p-2.5 bg-indigo-50 rounded-xl"><Scale className="w-5 h-5 text-indigo-500" /></div>}
          label="Peso Atual"
          value={`${ultimo.peso.toFixed(2)} kg`}
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
          <AreaChart data={HISTORICO} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
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
              formatter={(v: number) => [`${v.toFixed(2)} kg`, "Peso"]}
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
          <LineChart data={HISTORICO} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
            <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#a1a1aa" }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} tick={{ fontSize: 11, fill: "#a1a1aa" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
              formatter={(v: number) => [v.toFixed(2), "ECC"]}
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
