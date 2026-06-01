"use client";

import React, { useState } from "react";
import { Syringe, History, Calendar, Clock, Trash2, Plus } from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";
import { Button } from "@/components/ui/Button";
import { Bufalo } from "@/services/bufalos.service";
import { useVacinacaoByBufalo } from "@/hooks/useVacinacao";
import type { Vacinacao } from "@/services/vacinacao.service";
import { VacinacaoDetailsModal } from "./vacinacao/VacinacaoDetailsModal";
import { DeletedVacinacaoModal } from "./vacinacao/DeletedVacinacaoModal";
import { CreateVacinacaoModal } from "./vacinacao/CreateVacinacaoModal";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(value?: string | null) {
  if (!value) return "—";
  const datePart = value.slice(0, 10);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);
  if (!match) {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("pt-BR");
  }
  const [, year, month, day] = match;
  return `${day}/${month}/${year}`;
}

function getMedicacao(reg: Vacinacao) {
  return reg.medicacoe ?? reg.medicacoes;
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

const LIMIT = 10;

export function VacinacaoTab({ bufalo }: { bufalo: Bufalo }) {
  const [page, setPage] = useState(1);
  const [selectedRegistro, setSelectedRegistro] = useState<Vacinacao | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const { data, isLoading } = useVacinacaoByBufalo(bufalo.idBufalo, { page, limit: LIMIT });

  const registros  = data?.data ?? [];
  const meta       = data?.meta;
  const total      = meta?.total ?? 0;
  const totalPages = meta?.totalPages ?? 1;

  const ultimaAplicacao = page === 1 ? registros[0]?.dtAplicacao ?? null : null;
  const retornosPendentes = registros.filter(r => r.necessitaRetorno).length;

  return (
    <div className="animate-in fade-in duration-300 flex flex-col gap-5">

      {/* ── Métricas ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          icon={<div className="p-2.5 bg-green-50 rounded-xl"><Syringe className="w-5 h-5 text-green-500" /></div>}
          label="Total de Vacinações"
          value={isLoading ? "..." : String(total)}
        />
        <MetricCard
          icon={<div className="p-2.5 bg-blue-50 rounded-xl"><History className="w-5 h-5 text-blue-500" /></div>}
          label="Última Aplicação"
          value={isLoading ? "..." : formatDate(ultimaAplicacao)}
        />
        <MetricCard
          icon={<div className="p-2.5 bg-amber-50 rounded-xl"><Clock className="w-5 h-5 text-amber-500" /></div>}
          label="Retornos Pendentes (página)"
          value={isLoading ? "..." : String(retornosPendentes)}
          valueClass={retornosPendentes > 0 ? "text-amber-600" : "text-zinc-800"}
        />
      </div>

      {/* ── Tabela ───────────────────────────────────────────────── */}
      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">

        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-zinc-800">Histórico de Vacinação</h2>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDeleted(true)}
              className="text-zinc-400 hover:text-zinc-700"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              Ver removidos
            </Button>
            <Button variant="primary" size="sm" onClick={() => setShowCreate(true)}>
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Registrar vacinação
            </Button>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-52 gap-2 text-zinc-400">
            <div className="w-5 h-5 border-2 border-zinc-300 border-t-zinc-700 rounded-full animate-spin" />
            <span className="text-sm font-medium">Carregando registros...</span>
          </div>
        )}

        {/* Vazio */}
        {!isLoading && registros.length === 0 && (
          <div className="flex flex-col items-center justify-center h-52 gap-2">
            <Syringe className="w-8 h-8 text-zinc-200" />
            <p className="text-sm font-semibold text-zinc-400">Nenhuma vacinação registrada</p>
            <p className="text-xs text-zinc-300">As vacinas aplicadas neste búfalo aparecerão aqui</p>
          </div>
        )}

        {/* Tabela */}
        {!isLoading && registros.length > 0 && (
          <>
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-100">
                  <th className="text-left text-[10px] font-bold uppercase tracking-widest text-zinc-400 px-6 py-3 whitespace-nowrap">
                    Data Aplicação
                  </th>
                  <th className="text-left text-[10px] font-bold uppercase tracking-widest text-zinc-400 px-4 py-3 w-full">
                    Vacina
                  </th>
                  <th className="text-left text-[10px] font-bold uppercase tracking-widest text-zinc-400 px-4 py-3 whitespace-nowrap">
                    Doença / Prevenção
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
                {registros.map((reg) => {
                  const med = getMedicacao(reg);
                  return (
                    <tr
                      key={reg.idSanit}
                      onClick={() => setSelectedRegistro(reg)}
                      className="hover:bg-zinc-50/80 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-zinc-600">
                          <Calendar className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                          {formatDate(reg.dtAplicacao)}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Syringe className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                          <p className="text-sm text-zinc-700 font-medium leading-tight">
                            {med?.medicacao ?? "—"}
                          </p>
                        </div>
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm text-zinc-500 capitalize">{reg.doenca}</span>
                      </td>

                      <td className="px-4 py-4 text-right whitespace-nowrap">
                        <span className="text-sm font-mono text-zinc-600">
                          {reg.dosagem} {reg.unidadeMedida}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        {reg.necessitaRetorno ? (
                          <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                            {reg.dtRetorno ? formatDate(reg.dtRetorno) : "A definir"}
                          </span>
                        ) : (
                          <span className="text-sm text-zinc-300">—</span>
                        )}
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
              hasPrevPage={meta?.hasPrevPage}
              hasNextPage={meta?.hasNextPage}
              total={total}
              limit={LIMIT}
              className="px-6 py-4 border-t border-zinc-100"
            />
          </>
        )}
      </div>

      {/* ── Modais ───────────────────────────────────────────────── */}
      <VacinacaoDetailsModal
        isOpen={!!selectedRegistro}
        onClose={() => setSelectedRegistro(null)}
        registro={selectedRegistro}
        idPropriedade={bufalo.idPropriedade}
        onMutated={() => setSelectedRegistro(null)}
      />

      <CreateVacinacaoModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        idBufalo={bufalo.idBufalo}
        idPropriedade={bufalo.idPropriedade}
        onCreated={() => setShowCreate(false)}
      />

      <DeletedVacinacaoModal
        isOpen={showDeleted}
        onClose={() => setShowDeleted(false)}
        idBufalo={bufalo.idBufalo}
        onMutated={() => setShowDeleted(false)}
      />
    </div>
  );
}
