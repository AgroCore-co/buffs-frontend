"use client";

import React, { useState } from "react";
import { Droplets, TrendingUp, Layers, Calendar } from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import {
  DataTable, TableHeader, TableHead, TableBody, TableRow, TableCell, TableEmptyState,
} from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { Bufalo } from "@/services/bufalos.service";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface RegistroProducao {
  id: string;
  data: string;
  producaoLitros: number;
  gordura: number;
  proteina: number;
  lactacaoNum: number;
}

// ─── Mock ─────────────────────────────────────────────────────────────────────

const MOCK: RegistroProducao[] = [
  { id: "1",  data: "2025-11-01", producaoLitros: 14.2, gordura: 7.8, proteina: 4.1, lactacaoNum: 3 },
  { id: "2",  data: "2025-10-01", producaoLitros: 15.6, gordura: 8.1, proteina: 4.3, lactacaoNum: 3 },
  { id: "3",  data: "2025-09-01", producaoLitros: 16.8, gordura: 7.9, proteina: 4.2, lactacaoNum: 3 },
  { id: "4",  data: "2025-08-01", producaoLitros: 17.3, gordura: 8.3, proteina: 4.4, lactacaoNum: 3 },
  { id: "5",  data: "2025-07-01", producaoLitros: 18.1, gordura: 7.6, proteina: 4.0, lactacaoNum: 3 },
  { id: "6",  data: "2025-06-01", producaoLitros: 19.5, gordura: 8.0, proteina: 4.2, lactacaoNum: 3 },
  { id: "7",  data: "2025-05-01", producaoLitros: 20.2, gordura: 7.7, proteina: 4.1, lactacaoNum: 3 },
  { id: "8",  data: "2025-04-01", producaoLitros: 18.9, gordura: 7.5, proteina: 3.9, lactacaoNum: 3 },
  { id: "9",  data: "2025-03-01", producaoLitros: 17.4, gordura: 7.8, proteina: 4.0, lactacaoNum: 3 },
  { id: "10", data: "2025-02-01", producaoLitros: 15.1, gordura: 8.2, proteina: 4.3, lactacaoNum: 3 },
  { id: "11", data: "2025-01-01", producaoLitros: 13.8, gordura: 8.5, proteina: 4.5, lactacaoNum: 3 },
  { id: "12", data: "2024-12-01", producaoLitros: 11.2, gordura: 8.8, proteina: 4.6, lactacaoNum: 2 },
];

const CHART_DATA = [...MOCK].reverse().map((r) => ({
  mes: new Date(r.data).toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }),
  producao: r.producaoLitros,
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(v: string) {
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("pt-BR");
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

const LIMIT = 8;

export function ProducaoTab({ bufalo: _bufalo }: { bufalo: Bufalo }) {
  const [page, setPage] = useState(1);

  const total        = MOCK.length;
  const totalPages   = Math.max(1, Math.ceil(total / LIMIT));
  const paginated    = MOCK.slice((page - 1) * LIMIT, page * LIMIT);
  const totalLitros  = MOCK.reduce((s, r) => s + r.producaoLitros, 0);
  const mediaLitros  = totalLitros / MOCK.length;
  const lactacoes    = new Set(MOCK.map(r => r.lactacaoNum)).size;

  return (
    <div className="animate-in fade-in duration-300 flex flex-col gap-5">

      {/* ── Métricas ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          icon={<div className="p-2.5 bg-emerald-50 rounded-xl"><Droplets className="w-5 h-5 text-emerald-500" /></div>}
          label="Produção Total"
          value={totalLitros.toFixed(1)}
          sub="L"
        />
        <MetricCard
          icon={<div className="p-2.5 bg-emerald-50 rounded-xl"><TrendingUp className="w-5 h-5 text-emerald-500" /></div>}
          label="Média Mensal"
          value={mediaLitros.toFixed(1)}
          sub="L"
        />
        <MetricCard
          icon={<div className="p-2.5 bg-emerald-50 rounded-xl"><Layers className="w-5 h-5 text-emerald-500" /></div>}
          label="Lactações"
          value={String(lactacoes)}
        />
      </div>

      {/* ── Gráfico ──────────────────────────────────────────────── */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-5">
        <h2 className="text-sm font-bold text-zinc-800 mb-4">Produção Mensal (L)</h2>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={CHART_DATA} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="prodGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#10b981" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}    />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
            <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#a1a1aa" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#a1a1aa" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
              formatter={(v: number) => [`${v.toFixed(1)} L`, "Produção"]}
            />
            <Area
              type="monotone"
              dataKey="producao"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#prodGradient)"
              dot={{ r: 3, fill: "#10b981" }}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ── Tabela ───────────────────────────────────────────────── */}
      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-100">
          <h2 className="text-sm font-bold text-zinc-800">Controle Leiteiro</h2>
        </div>

        <DataTable
          isEmpty={MOCK.length === 0}
          emptyState={
            <TableEmptyState
              icon={Droplets}
              title="Nenhum registro de produção"
              description="Os controles leiteiros do animal aparecerão aqui."
            />
          }
        >
          <TableHeader>
            <TableHead>Data</TableHead>
            <TableHead>Produção</TableHead>
            <TableHead>Gordura</TableHead>
            <TableHead>Proteína</TableHead>
            <TableHead align="right">Lactação Nº</TableHead>
          </TableHeader>
          <TableBody>
            {paginated.map((reg) => (
              <TableRow key={reg.id}>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm text-zinc-600">
                    <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    {formatDate(reg.data)}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-bold text-emerald-700">{reg.producaoLitros.toFixed(1)} L</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-zinc-700">{reg.gordura.toFixed(1)}%</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-zinc-700">{reg.proteina.toFixed(1)}%</span>
                </TableCell>
                <TableCell align="right">
                  <span className="px-2.5 py-1 rounded-lg border border-zinc-200 text-xs font-medium text-zinc-600 bg-white">
                    {reg.lactacaoNum}ª
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </DataTable>

        {totalPages > 1 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            total={total}
            limit={LIMIT}
            className="px-6 py-4 border-t border-zinc-100"
          />
        )}
      </div>
    </div>
  );
}
