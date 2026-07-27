"use client";

import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
} from "recharts";

interface ProducaoMensalChartProps {
  data: { mes: string; producao: number; variacao: number }[];
  tooltipLabel: string;
}

/** Gráfico de produção mês a mês — extraído de lactacao/page.tsx para lazy-load do Recharts. */
export default function ProducaoMensalChart({ data, tooltipLabel }: ProducaoMensalChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 20, right: 20, bottom: 0, left: -20 }} barCategoryGap="5%">
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
        <XAxis dataKey="mes" tick={{ fontSize: 13, fill: "#6B7280", fontWeight: 500 }} axisLine={false} tickLine={false} />
        <YAxis domain={[0, "auto"]} tick={{ fontSize: 13, fill: "#6B7280", fontWeight: 500 }} axisLine={false} tickLine={false} />
        <Tooltip
          cursor={{ fill: "#F3F4F6" }}
          contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
          formatter={(value, _name, item) => {
            const v = typeof value === "number" ? value : parseFloat(String(value));
            const varMes = Number(item?.payload?.variacao ?? 0);
            const sufixo = varMes !== 0 ? ` (${varMes > 0 ? "▲" : "▼"} ${Math.abs(varMes).toFixed(1)}%)` : "";
            return [`${(Number.isNaN(v) ? 0 : v).toFixed(1)} L${sufixo}`, tooltipLabel];
          }}
        />
        <Bar dataKey="producao" radius={[4, 4, 0, 0]} barSize={64}>
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.variacao > 0 ? "#FCA90F" : entry.variacao < 0 ? "#CE7D0A" : "#FFCF78"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
