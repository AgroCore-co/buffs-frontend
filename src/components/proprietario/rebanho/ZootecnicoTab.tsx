"use client";

import React, { useState } from "react";
import { Scale, Activity, TrendingUp, Calendar, Ruler, Trash2 } from "lucide-react";

import {
  DataTable,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableEmptyState,
} from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { Button } from "@/components/ui/Button";
import { Bufalo } from "@/services/bufalos.service";
import { useDadosZootecnicosByBufalo } from "@/hooks/useDadosZootecnicos";
import type { DadoZootecnico } from "@/services/dados-zootecnicos.service";
import { DadoZootecnicoDetailsModal } from "./zootecnico/DadoZootecnicoDetailsModal";
import { DeletedRegistrosModal } from "./zootecnico/DeletedRegistrosModal";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Formata datas no padrão "YYYY-MM-DD HH:mm:ss+00" (ou ISO) para DD/MM/YYYY
 * sem aplicar conversão de fuso horário (evita deslocar o dia).
 */
function formatDate(value: string) {
  if (!value) return "—";
  const datePart = value.slice(0, 10); // "2025-11-01"
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);
  if (!match) {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("pt-BR");
  }
  const [, year, month, day] = match;
  return `${day}/${month}/${year}`;
}

function toNumber(value: string | number | null | undefined): number {
  const n = typeof value === "number" ? value : parseFloat(value ?? "");
  return Number.isNaN(n) ? 0 : n;
}

function getEccStyle(ecc: number): { bar: string; text: string } {
  if (ecc > 4.5) return { bar: "bg-red-500",   text: "text-red-600"   };
  if (ecc >= 2.5) return { bar: "bg-blue-500",  text: "text-blue-600"  };
  return               { bar: "bg-amber-400",   text: "text-amber-600" };
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function MetricCard({
  icon, label, value, sub,
}: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
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

function EccBar({ ecc }: { ecc: number }) {
  const pct = Math.min((ecc / 5) * 100, 100);
  const { bar, text } = getEccStyle(ecc);
  return (
    <div className="flex items-center gap-2.5">
      <span className={`text-sm font-semibold ${text} w-8 shrink-0`}>{ecc.toFixed(2)}</span>
      <div className="w-24 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${bar}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

const LIMIT = 10;

export function ZootecnicoTab({ bufalo }: { bufalo: Bufalo }) {
  const [page, setPage] = useState(1);
  const [selectedRegistro, setSelectedRegistro] = useState<DadoZootecnico | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);

  const { data, isLoading, isError } = useDadosZootecnicosByBufalo(bufalo.idBufalo, {
    page,
    limit: LIMIT,
  });

  const registros  = data?.data ?? [];
  const total      = data?.meta.total ?? 0;
  const totalPages = data?.meta.totalPages ?? 1;

  // Métrica "atual" = registro mais recente (a API ordena do mais novo para o mais antigo).
  const ultimo    = page === 1 ? registros[0] : undefined;
  const pesoAtual = ultimo ? `${toNumber(ultimo.peso).toFixed(2)} kg` : "—";
  const eccAtual  = ultimo ? `${toNumber(ultimo.condicaoCorporal).toFixed(2)}` : "—";

  return (
    <div className="animate-in fade-in duration-300 flex flex-col gap-5">

      {/* ── Métricas ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          icon={
            <div className="p-2.5 bg-indigo-50 rounded-xl">
              <Scale className="w-5 h-5 text-indigo-500" />
            </div>
          }
          label="Peso Atual"
          value={pesoAtual}
        />
        <MetricCard
          icon={
            <div className="p-2.5 bg-indigo-50 rounded-xl">
              <Activity className="w-5 h-5 text-indigo-500" />
            </div>
          }
          label="Escore Corporal (ECC)"
          value={eccAtual}
          sub="/ 5.0"
        />
        <MetricCard
          icon={
            <div className="p-2.5 bg-indigo-50 rounded-xl">
              <TrendingUp className="w-5 h-5 text-indigo-500" />
            </div>
          }
          label="Total Registros"
          value={String(total)}
        />
      </div>

      {/* ── Tabela ───────────────────────────────────────────────── */}
      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-zinc-800">Histórico Zootécnico</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDeleted(true)}
            className="text-zinc-400 hover:text-zinc-700"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            Ver removidos
          </Button>
        </div>

        <DataTable
          isEmpty={registros.length === 0}
          emptyState={
            <TableEmptyState
              icon={Scale}
              title={
                isLoading
                  ? "Carregando registros…"
                  : isError
                  ? "Erro ao carregar registros"
                  : "Nenhum registro zootécnico"
              }
              description={
                isLoading
                  ? "Buscando o histórico zootécnico do animal."
                  : isError
                  ? "Não foi possível buscar os dados zootécnicos. Tente novamente."
                  : "Pesagens e avaliações do animal aparecerão aqui."
              }
            />
          }
        >
          <TableHeader>
            <TableHead>Data Registro</TableHead>
            <TableHead>Peso (kg)</TableHead>
            <TableHead>Escore (ECC)</TableHead>
            <TableHead>Formato Chifre</TableHead>
            <TableHead>Porte</TableHead>
            <TableHead align="right">Tipo</TableHead>
          </TableHeader>
          <TableBody>
            {registros.map((reg) => (
              <TableRow key={reg.idZootec} onClick={() => setSelectedRegistro(reg)}>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm text-zinc-600">
                    <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    {formatDate(reg.dtRegistro)}
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span className="text-sm font-bold text-zinc-800">
                      {toNumber(reg.peso).toFixed(2)} kg
                    </span>
                  </div>
                </TableCell>

                <TableCell>
                  <EccBar ecc={toNumber(reg.condicaoCorporal)} />
                </TableCell>

                <TableCell>
                  <span className="text-sm text-zinc-700">{reg.formatoChifre || "—"}</span>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-1.5 text-sm text-zinc-700">
                    <Ruler className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    {reg.porteCorporal || "—"}
                  </div>
                </TableCell>

                <TableCell align="right">
                  <span className="px-2.5 py-1 rounded-lg border border-zinc-200 text-xs font-medium text-zinc-600 bg-white">
                    {reg.tipoPesagem || "—"}
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

      {/* ── Modais ───────────────────────────────────────────────── */}
      <DadoZootecnicoDetailsModal
        isOpen={!!selectedRegistro}
        onClose={() => setSelectedRegistro(null)}
        registro={selectedRegistro}
        onMutated={() => setSelectedRegistro(null)}
      />

      <DeletedRegistrosModal
        isOpen={showDeleted}
        onClose={() => setShowDeleted(false)}
        idBufalo={bufalo.idBufalo}
        onMutated={() => setShowDeleted(false)}
      />
    </div>
  );
}
