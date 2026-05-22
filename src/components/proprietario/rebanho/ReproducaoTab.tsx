"use client";

import React, { useState } from "react";
import { Baby, Heart, Syringe, Stethoscope, AlertCircle, Calendar } from "lucide-react";
import {
  DataTable, TableHeader, TableHead, TableBody, TableRow, TableCell, TableEmptyState,
} from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { Bufalo } from "@/services/bufalos.service";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type TipoEvento = "cobertura" | "inseminacao" | "diagnostico" | "parto" | "aborto";

interface EventoReproducao {
  id: string;
  data: string;
  tipo: TipoEvento;
  resultado: string;
  observacao?: string;
}

// ─── Mock ─────────────────────────────────────────────────────────────────────

const MOCK: EventoReproducao[] = [
  { id: "1", data: "2025-10-15", tipo: "parto",       resultado: "Bezerro Macho — Saudável",    observacao: "Parto normal, sem complicações"      },
  { id: "2", data: "2025-06-20", tipo: "diagnostico", resultado: "Positivo",                     observacao: "Gestação confirmada — 60 dias"       },
  { id: "3", data: "2025-05-10", tipo: "inseminacao", resultado: "Realizada",                    observacao: "Sêmen touro Brahma BM-230"           },
  { id: "4", data: "2024-11-08", tipo: "parto",       resultado: "Bezerra Fêmea — Saudável",     observacao: "Parto normal"                       },
  { id: "5", data: "2024-07-14", tipo: "diagnostico", resultado: "Positivo",                     observacao: "Gestação 45 dias"                   },
  { id: "6", data: "2024-06-01", tipo: "cobertura",   resultado: "Realizada",                    observacao: "Touro BM-001"                       },
  { id: "7", data: "2024-01-20", tipo: "aborto",      resultado: "Abortamento espontâneo",       observacao: "3º mês de gestação"                 },
  { id: "8", data: "2023-10-05", tipo: "parto",       resultado: "Bezerro Macho — Saudável",     observacao: "Parto normal"                       },
  { id: "9", data: "2023-06-10", tipo: "inseminacao", resultado: "Realizada",                    observacao: "Protocolo IATF"                     },
  { id: "10",data: "2023-05-28", tipo: "diagnostico", resultado: "Negativo",                     observacao: "Repetição de protocolo necessária"  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TIPO_CONFIG: Record<TipoEvento, { icon: React.ReactNode; label: string; bg: string; text: string; border: string }> = {
  parto:       { icon: <Baby       className="w-3 h-3" />, label: "Parto",        bg: "bg-green-50",  text: "text-green-700",  border: "border-green-200"  },
  inseminacao: { icon: <Syringe    className="w-3 h-3" />, label: "Inseminação",  bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200"   },
  diagnostico: { icon: <Stethoscope className="w-3 h-3"/>, label: "Diagnóstico",  bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  cobertura:   { icon: <Heart      className="w-3 h-3" />, label: "Cobertura",    bg: "bg-rose-50",   text: "text-rose-700",   border: "border-rose-200"   },
  aborto:      { icon: <AlertCircle className="w-3 h-3"/>, label: "Abortamento",  bg: "bg-red-50",    text: "text-red-700",    border: "border-red-200"    },
};

function formatDate(v: string) {
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("pt-BR");
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function MetricCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-4 bg-white border border-zinc-200 rounded-xl p-5">
      <div className="flex-shrink-0">{icon}</div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{label}</p>
        <p className="text-lg font-bold text-zinc-800 leading-tight">{value}</p>
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

const LIMIT = 8;

export function ReproducaoTab({ bufalo: _bufalo }: { bufalo: Bufalo }) {
  const [page, setPage] = useState(1);

  const total      = MOCK.length;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));
  const paginated  = MOCK.slice((page - 1) * LIMIT, page * LIMIT);

  const partos       = MOCK.filter(e => e.tipo === "parto");
  const ultimoParto  = partos[0];
  const totalCrias   = partos.length;

  return (
    <div className="animate-in fade-in duration-300 flex flex-col gap-5">

      {/* ── Métricas ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          icon={<div className="p-2.5 bg-rose-50 rounded-xl"><Baby className="w-5 h-5 text-rose-500" /></div>}
          label="Total de Partos"
          value={String(partos.length)}
        />
        <MetricCard
          icon={<div className="p-2.5 bg-rose-50 rounded-xl"><Calendar className="w-5 h-5 text-rose-500" /></div>}
          label="Último Parto"
          value={ultimoParto ? formatDate(ultimoParto.data) : "—"}
        />
        <MetricCard
          icon={<div className="p-2.5 bg-rose-50 rounded-xl"><Heart className="w-5 h-5 text-rose-500" /></div>}
          label="Crias Registradas"
          value={String(totalCrias)}
        />
      </div>

      {/* ── Tabela ───────────────────────────────────────────────── */}
      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-100">
          <h2 className="text-sm font-bold text-zinc-800">Histórico Reprodutivo</h2>
        </div>

        <DataTable
          isEmpty={MOCK.length === 0}
          emptyState={
            <TableEmptyState
              icon={Baby}
              title="Nenhum evento reprodutivo"
              description="Coberturas, inseminações e partos aparecerão aqui."
            />
          }
        >
          <TableHeader>
            <TableHead>Data</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Resultado</TableHead>
            <TableHead>Observação</TableHead>
          </TableHeader>
          <TableBody>
            {paginated.map((ev) => {
              const cfg = TIPO_CONFIG[ev.tipo];
              return (
                <TableRow key={ev.id}>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-zinc-600">
                      <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      {formatDate(ev.data)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                      {cfg.icon}{cfg.label}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-zinc-700">{ev.resultado}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-zinc-400">{ev.observacao ?? "—"}</span>
                  </TableCell>
                </TableRow>
              );
            })}
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
