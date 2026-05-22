"use client";

import React, { useState } from "react";
import { ArrowRightLeft, MapPin, Clock, Calendar, ArrowRight } from "lucide-react";
import {
  DataTable, TableHeader, TableHead, TableBody, TableRow, TableCell, TableEmptyState,
} from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { Bufalo } from "@/services/bufalos.service";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Movimentacao {
  id: string;
  dataEntrada: string;
  loteAnterior: string | null;
  loteAtual: string;
  grupo: string;
  diasPermanencia: number | null;
}

// ─── Mock ─────────────────────────────────────────────────────────────────────

const MOCK: Movimentacao[] = [
  { id: "1", dataEntrada: "2025-10-01", loteAnterior: "Lote B",  loteAtual: "Lote A",  grupo: "Vacas em Lactação",  diasPermanencia: null },
  { id: "2", dataEntrada: "2025-04-15", loteAnterior: "Lote C",  loteAtual: "Lote B",  grupo: "Vacas em Lactação",  diasPermanencia: 168 },
  { id: "3", dataEntrada: "2024-11-01", loteAnterior: "Lote A",  loteAtual: "Lote C",  grupo: "Gestantes",          diasPermanencia: 165 },
  { id: "4", dataEntrada: "2024-05-20", loteAnterior: "Lote D",  loteAtual: "Lote A",  grupo: "Novilhas",           diasPermanencia: 165 },
  { id: "5", dataEntrada: "2023-12-01", loteAnterior: null,       loteAtual: "Lote D",  grupo: "Novilhas",           diasPermanencia: 170 },
];

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
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{label}</p>
        <p className="text-lg font-bold text-zinc-800 leading-tight truncate">
          {value}
          {sub && <span className="text-sm font-normal text-zinc-400 ml-1">{sub}</span>}
        </p>
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

const LIMIT = 8;

export function MovimentacoesTab({ bufalo: _bufalo }: { bufalo: Bufalo }) {
  const [page, setPage] = useState(1);

  const total      = MOCK.length;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));
  const paginated  = MOCK.slice((page - 1) * LIMIT, page * LIMIT);

  const atual      = MOCK[0];
  const diasAtual  = atual?.diasPermanencia;

  return (
    <div className="animate-in fade-in duration-300 flex flex-col gap-5">

      {/* ── Métricas ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          icon={<div className="p-2.5 bg-violet-50 rounded-xl"><ArrowRightLeft className="w-5 h-5 text-violet-500" /></div>}
          label="Total de Movimentações"
          value={String(total)}
        />
        <MetricCard
          icon={<div className="p-2.5 bg-violet-50 rounded-xl"><MapPin className="w-5 h-5 text-violet-500" /></div>}
          label="Lote Atual"
          value={atual?.loteAtual ?? "—"}
          sub={atual ? `· ${atual.grupo}` : undefined}
        />
        <MetricCard
          icon={<div className="p-2.5 bg-violet-50 rounded-xl"><Clock className="w-5 h-5 text-violet-500" /></div>}
          label="Entrada no Lote Atual"
          value={atual ? formatDate(atual.dataEntrada) : "—"}
          sub={diasAtual ? undefined : "em curso"}
        />
      </div>

      {/* ── Tabela ───────────────────────────────────────────────── */}
      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-100">
          <h2 className="text-sm font-bold text-zinc-800">Histórico de Movimentações</h2>
        </div>

        <DataTable
          isEmpty={MOCK.length === 0}
          emptyState={
            <TableEmptyState
              icon={ArrowRightLeft}
              title="Nenhuma movimentação registrada"
              description="Transferências entre lotes e grupos aparecerão aqui."
            />
          }
        >
          <TableHeader>
            <TableHead>Data Entrada</TableHead>
            <TableHead>Origem → Destino</TableHead>
            <TableHead>Grupo</TableHead>
            <TableHead align="right">Permanência</TableHead>
          </TableHeader>
          <TableBody>
            {paginated.map((mov, idx) => (
              <TableRow key={mov.id}>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm text-zinc-600">
                    <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    {formatDate(mov.dataEntrada)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-zinc-400">{mov.loteAnterior ?? "Entrada"}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-300 shrink-0" />
                    <span className="font-semibold text-zinc-800">{mov.loteAtual}</span>
                    {idx === 0 && (
                      <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-violet-100 text-violet-700">
                        Atual
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-zinc-700">{mov.grupo}</span>
                </TableCell>
                <TableCell align="right">
                  {mov.diasPermanencia != null ? (
                    <span className="text-sm text-zinc-500">{mov.diasPermanencia} dias</span>
                  ) : (
                    <span className="text-xs font-medium text-violet-600">Em curso</span>
                  )}
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
