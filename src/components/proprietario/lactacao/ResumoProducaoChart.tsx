"use client";

import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";

function toNumber(value: string | number | null | undefined): number {
  const n = typeof value === "number" ? value : parseFloat(value ?? "");
  return Number.isNaN(n) ? 0 : n;
}

interface ResumoProducaoChartProps {
  data: { dia: string; litros: number }[];
  tooltipLabel: string;
}

/** Gráfico de linha da aba "grafico" — extraído de ResumoProducaoModal para lazy-load do Recharts. */
export default function ResumoProducaoChart({ data, tooltipLabel }: ResumoProducaoChartProps) {
  return (
    <div className="h-[300px] w-full bg-zinc-50/50 rounded-xl border border-zinc-100 p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
          <XAxis dataKey="dia" tick={{ fontSize: 12, fill: "#71717a" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: "#71717a" }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
            formatter={(value) => [`${toNumber(value as number).toFixed(2)} L`, tooltipLabel]}
          />
          <Line type="monotone" dataKey="litros" stroke="#d97706" strokeWidth={3} dot={{ r: 3, fill: "#d97706" }} activeDot={{ r: 6 }} name="Litros" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
