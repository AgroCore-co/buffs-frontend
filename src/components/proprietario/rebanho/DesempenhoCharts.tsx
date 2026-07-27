"use client";

import React from "react";
import {
  ResponsiveContainer,
  AreaChart, Area,
  LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
} from "recharts";

function toNumber(value: string | number | null | undefined): number {
  const n = typeof value === "number" ? value : parseFloat(value ?? "");
  return Number.isNaN(n) ? 0 : n;
}

interface PontoHistorico {
  mes: string;
  peso: number;
  ecc: number;
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-5 flex flex-col gap-4">
      <h2 className="text-sm font-bold text-zinc-800">{title}</h2>
      {children}
    </div>
  );
}

interface DesempenhoChartsProps {
  historico: PontoHistorico[];
  mediaPeso: number;
}

/** Curva de peso + evolução do ECC — extraído de DesempenhoTab para lazy-load do Recharts. */
export default function DesempenhoCharts({ historico, mediaPeso }: DesempenhoChartsProps) {
  return (
    <>
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
    </>
  );
}
