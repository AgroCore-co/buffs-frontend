"use client";

import React, { useState } from "react";
import {
  Syringe, CheckCircle2, History, Calendar,
  Link2, Flame, AlertCircle,
} from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type TipoTratamento = "suplementacao" | "parasita" | "doenca" | "vacina";

export interface RegistroSanitario {
  id: string;
  dataAplicacao: string;
  nomeTratamento: string;
  tipo: TipoTratamento;
  dosagem: string;
  unidade: string;
  dataRetorno?: string | null;
}

interface SanitarioTabProps {
  bufaloId: string;
  // Quando o endpoint existir, receba os dados aqui ou adicione o hook internamente
  registros?: RegistroSanitario[];
  total?: number;
  isLoading?: boolean;
}

// ─── Mock ─────────────────────────────────────────────────────────────────────

const MOCK_REGISTROS: RegistroSanitario[] = [
  {
    id: "1",
    dataAplicacao: "2025-03-10",
    nomeTratamento: "Vacina Aftosa",
    tipo: "vacina",
    dosagem: "2",
    unidade: "ml",
    dataRetorno: "2025-09-10",
  },
  {
    id: "2",
    dataAplicacao: "2025-02-15",
    nomeTratamento: "Ivermectina",
    tipo: "parasita",
    dosagem: "5",
    unidade: "ml",
    dataRetorno: null,
  },
  {
    id: "3",
    dataAplicacao: "2025-01-20",
    nomeTratamento: "Complexo Vitamínico B12",
    tipo: "suplementacao",
    dosagem: "10",
    unidade: "ml",
    dataRetorno: null,
  },
  {
    id: "4",
    dataAplicacao: "2024-12-05",
    nomeTratamento: "Vacina Brucelose",
    tipo: "vacina",
    dosagem: "2",
    unidade: "ml",
    dataRetorno: null,
  },
  {
    id: "5",
    dataAplicacao: "2024-11-18",
    nomeTratamento: "Tristeza Parasitária",
    tipo: "doenca",
    dosagem: "15",
    unidade: "ml",
    dataRetorno: "2024-12-18",
  },
  {
    id: "6",
    dataAplicacao: "2024-10-02",
    nomeTratamento: "Clostridiose",
    tipo: "vacina",
    dosagem: "5",
    unidade: "ml",
    dataRetorno: null,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("pt-BR");
}

const TIPO_CONFIG: Record<TipoTratamento, { icon: React.ReactNode; label: string }> = {
  suplementacao: { icon: <Link2    className="w-3.5 h-3.5 text-blue-500"   />, label: "Suplementação" },
  parasita:      { icon: <Flame    className="w-3.5 h-3.5 text-orange-500" />, label: "Parasitas"     },
  doenca:        { icon: <AlertCircle className="w-3.5 h-3.5 text-red-500" />, label: "Doença"        },
  vacina:        { icon: <Syringe  className="w-3.5 h-3.5 text-blue-500"   />, label: "Vacina"        },
};

function getSituacao(registros: RegistroSanitario[]): string {
  if (!registros.length) return "—";
  return registros.some(r => r.tipo === "doenca") ? "Atenção" : "Regular";
}

function getSituacaoColor(situacao: string) {
  if (situacao === "Atenção") return "text-amber-600";
  if (situacao === "Regular") return "text-zinc-800";
  return "text-zinc-400";
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function MetricCard({
  icon, label, value, valueClass = "text-zinc-800",
}: { icon: React.ReactNode; label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center gap-4 bg-white border border-zinc-200 rounded-xl p-5">
      <div className="flex-shrink-0">{icon}</div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{label}</p>
        <p className={`text-lg font-bold ${valueClass}`}>{value}</p>
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function SanitarioTab({
  bufaloId: _bufaloId,
  registros = MOCK_REGISTROS,
  total,
  isLoading = false,
}: SanitarioTabProps) {
  const totalEfetivo = total ?? registros.length;
  const [page, setPage] = useState(1);
  const limit = 5;
  const totalPages = Math.max(1, Math.ceil(totalEfetivo / limit));

  const situacao = getSituacao(registros);
  const ultimaAplicacao = registros[0]?.dataAplicacao ?? null;


  return (
    <div className="animate-in fade-in duration-300 flex flex-col gap-5">

      {/* ── Métricas superiores ──────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          icon={
            <div className="p-2.5 bg-blue-50 rounded-xl">
              <Syringe className="w-5 h-5 text-blue-500" />
            </div>
          }
          label="Total de Registros"
          value={isLoading ? "..." : String(totalEfetivo)}
        />
        <MetricCard
          icon={
            <div className="p-2.5 bg-green-50 rounded-xl">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
          }
          label="Situação Sanitária"
          value={isLoading ? "..." : situacao}
          valueClass={getSituacaoColor(situacao)}
        />
        <MetricCard
          icon={
            <div className="p-2.5 bg-amber-50 rounded-xl">
              <History className="w-5 h-5 text-amber-500" />
            </div>
          }
          label="Última Aplicação"
          value={isLoading ? "..." : formatDate(ultimaAplicacao)}
        />
      </div>

      {/* ── Tabela ───────────────────────────────────────────── */}
      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-100">
          <h2 className="text-sm font-bold text-zinc-800">Histórico de Vacinas e Tratamentos</h2>
        </div>

        {/* Estado de carregamento */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-52 gap-2 text-zinc-400">
            <div className="w-5 h-5 border-2 border-zinc-300 border-t-zinc-700 rounded-full animate-spin" />
            <span className="text-sm font-medium">Carregando registros...</span>
          </div>
        )}

        {/* Estado vazio */}
        {!isLoading && registros.length === 0 && (
          <div className="flex flex-col items-center justify-center h-52 gap-2">
            <Syringe className="w-8 h-8 text-zinc-200" />
            <p className="text-sm font-semibold text-zinc-400">Nenhum registro sanitário encontrado</p>
            <p className="text-xs text-zinc-300">Vacinas e tratamentos aplicados aparecerão aqui</p>
          </div>
        )}

        {/* Tabela com dados */}
        {!isLoading && registros.length > 0 && (
          <>
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-100">
                  <th className="text-left text-[10px] font-bold uppercase tracking-widest text-zinc-400 px-6 py-3 whitespace-nowrap">
                    Data Aplicação
                  </th>
                  <th className="text-left text-[10px] font-bold uppercase tracking-widest text-zinc-400 px-4 py-3 w-full">
                    Tratamento / Vacina
                  </th>
                  <th className="text-right text-[10px] font-bold uppercase tracking-widest text-zinc-400 px-4 py-3 whitespace-nowrap">
                    Dosagem
                  </th>
                  <th className="text-right text-[10px] font-bold uppercase tracking-widest text-zinc-400 px-6 py-3 whitespace-nowrap">
                    Retorno
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-50">
                {registros.slice((page - 1) * limit, page * limit).map((reg) => {
                  const cfg = TIPO_CONFIG[reg.tipo] ?? TIPO_CONFIG.vacina;
                  return (
                    <tr key={reg.id} className="hover:bg-zinc-50/60 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-zinc-600">
                          <Calendar className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                          {formatDate(reg.dataAplicacao)}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          {cfg.icon}
                          <span className="text-sm text-zinc-700 font-medium">{reg.nomeTratamento}</span>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-right whitespace-nowrap">
                        <span className="text-sm font-mono text-zinc-600">
                          {reg.dosagem} {reg.unidade}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <span className="text-sm text-zinc-400">
                          {reg.dataRetorno ? formatDate(reg.dataRetorno) : "—"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              total={totalEfetivo}
              limit={limit}
              className="px-6 py-4 border-t border-zinc-100"
            />
          </>
        )}
      </div>
    </div>
  );
}
