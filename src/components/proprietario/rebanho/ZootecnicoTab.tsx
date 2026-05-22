"use client";

import React, { useState } from "react";
import { Scale, Activity, TrendingUp, Calendar, Ruler } from "lucide-react";

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
import { Bufalo } from "@/services/bufalos.service";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface RegistroZootecnico {
  id: string;
  dataRegistro: string;
  peso: number;
  ecc: number;
  formatoChifre: string;
  porte: string;
  tipo: string;
}

// ─── Mock ─────────────────────────────────────────────────────────────────────

const MOCK_REGISTROS: RegistroZootecnico[] = [
  { id: "1",  dataRegistro: "2025-11-01", peso: 181.16, ecc: 3.76, formatoChifre: "Em Cacho",  porte: "Médio", tipo: "Mensal" },
  { id: "2",  dataRegistro: "2025-10-01", peso: 273.19, ecc: 1.01, formatoChifre: "Curvado",   porte: "Médio", tipo: "Mensal" },
  { id: "3",  dataRegistro: "2025-09-01", peso: 157.76, ecc: 4.34, formatoChifre: "Enrolado",  porte: "Médio", tipo: "Mensal" },
  { id: "4",  dataRegistro: "2025-08-01", peso: 179.09, ecc: 3.71, formatoChifre: "Curvado",   porte: "Médio", tipo: "Mensal" },
  { id: "5",  dataRegistro: "2025-07-01", peso: 247.49, ecc: 1.86, formatoChifre: "Enrolado",  porte: "Médio", tipo: "Mensal" },
  { id: "6",  dataRegistro: "2025-06-01", peso: 301.91, ecc: 4.62, formatoChifre: "Em Cacho",  porte: "Médio", tipo: "Mensal" },
  { id: "7",  dataRegistro: "2025-05-01", peso: 221.51, ecc: 4.90, formatoChifre: "Enrolado",  porte: "Médio", tipo: "Mensal" },
  { id: "8",  dataRegistro: "2025-04-01", peso: 251.86, ecc: 1.13, formatoChifre: "Em Cacho",  porte: "Médio", tipo: "Mensal" },
  { id: "9",  dataRegistro: "2025-03-01", peso: 275.32, ecc: 1.66, formatoChifre: "Em Cacho",  porte: "Médio", tipo: "Mensal" },
  { id: "10", dataRegistro: "2025-02-01", peso: 174.67, ecc: 4.27, formatoChifre: "Curvado",   porte: "Médio", tipo: "Mensal" },
  { id: "11", dataRegistro: "2025-01-01", peso: 192.40, ecc: 3.50, formatoChifre: "Em Cacho",  porte: "Médio", tipo: "Mensal" },
  { id: "12", dataRegistro: "2024-12-01", peso: 210.88, ecc: 2.10, formatoChifre: "Enrolado",  porte: "Médio", tipo: "Mensal" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(value: string) {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("pt-BR");
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

export function ZootecnicoTab({ bufalo: _bufalo }: { bufalo: Bufalo }) {
  const [page, setPage] = useState(1);

  const registros = MOCK_REGISTROS;
  const total     = registros.length;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));
  const paginated  = registros.slice((page - 1) * LIMIT, page * LIMIT);

  const ultimo    = registros[0];
  const pesoAtual = ultimo ? `${ultimo.peso.toFixed(2)} kg` : "—";
  const eccAtual  = ultimo ? `${ultimo.ecc.toFixed(2)}` : "—";

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
        <div className="px-6 py-4 border-b border-zinc-100">
          <h2 className="text-sm font-bold text-zinc-800">Histórico Zootécnico</h2>
        </div>

        <DataTable
          isEmpty={registros.length === 0}
          emptyState={
            <TableEmptyState
              icon={Scale}
              title="Nenhum registro zootécnico"
              description="Pesagens e avaliações do animal aparecerão aqui."
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
            {paginated.map((reg) => (
              <TableRow key={reg.id}>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm text-zinc-600">
                    <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    {formatDate(reg.dataRegistro)}
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span className="text-sm font-bold text-zinc-800">{reg.peso.toFixed(2)} kg</span>
                  </div>
                </TableCell>

                <TableCell>
                  <EccBar ecc={reg.ecc} />
                </TableCell>

                <TableCell>
                  <span className="text-sm text-zinc-700">{reg.formatoChifre}</span>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-1.5 text-sm text-zinc-700">
                    <Ruler className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    {reg.porte}
                  </div>
                </TableCell>

                <TableCell align="right">
                  <span className="px-2.5 py-1 rounded-lg border border-zinc-200 text-xs font-medium text-zinc-600 bg-white">
                    {reg.tipo}
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
