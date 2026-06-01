"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Syringe, CheckCircle2, History, Calendar,
  Link2, Flame, AlertCircle, Trash2, Plus,
} from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";
import { Button } from "@/components/ui/Button";
import { useDadosSanitariosByBufalo } from "@/hooks/useDadosSanitarios";
import { DadoSanitarioDetailsModal } from "./sanitario/DadoSanitarioDetailsModal";
import { DeletedRegistrosModal } from "./sanitario/DeletedRegistrosModal";
import { CreateDadoSanitarioModal } from "./sanitario/CreateDadoSanitarioModal";
import type { DadoSanitario } from "@/services/dados-sanitarios.service";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type TipoTratamento = "suplementacao" | "parasita" | "doenca" | "vacina";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("pt-BR");
}

function mapTipoTratamento(tipoTratamento?: string): TipoTratamento {
  const v = tipoTratamento?.toLowerCase() ?? "";
  if (v.includes("vacinação") || v.includes("vacinacao")) return "vacina";
  if (v.includes("suplementação") || v.includes("suplementacao")) return "suplementacao";
  if (v.includes("vermifugação") || v.includes("vermifugacao") || v.includes("parasita")) return "parasita";
  return "doenca";
}

function getMedicacao(reg: DadoSanitario) {
  return reg.medicacoe ?? reg.medicacoes;
}

function getTipo(reg: DadoSanitario): TipoTratamento {
  return mapTipoTratamento(getMedicacao(reg)?.tipoTratamento);
}

function getSituacaoKey(registros: DadoSanitario[]): "attention" | "regular" | null {
  if (!registros.length) return null;
  return registros.some(r => getTipo(r) === "doenca") ? "attention" : "regular";
}

const TIPO_ICONS: Record<TipoTratamento, React.ReactNode> = {
  suplementacao: <Link2       className="w-3.5 h-3.5 text-blue-500"   />,
  parasita:      <Flame       className="w-3.5 h-3.5 text-orange-500" />,
  doenca:        <AlertCircle className="w-3.5 h-3.5 text-red-500"    />,
  vacina:        <Syringe     className="w-3.5 h-3.5 text-green-500"  />,
};

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

interface SanitarioTabProps {
  bufaloId: string;
  idPropriedade: string;
}

export function SanitarioTab({ bufaloId, idPropriedade }: SanitarioTabProps) {
  const t = useTranslations("Proprietario.rebanho.bufalo.sanitario");
  const [page, setPage] = useState(1);
  const [selectedRegistro, setSelectedRegistro] = useState<DadoSanitario | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const { data, isLoading } = useDadosSanitariosByBufalo(bufaloId, { page, limit: LIMIT });

  const registros = data?.data ?? [];
  const meta      = data?.meta;
  const total     = meta?.total ?? 0;
  const totalPages = meta?.totalPages ?? 1;

  const situacaoKey      = getSituacaoKey(registros);
  const situacaoDisplay  = situacaoKey ? t(`situation.${situacaoKey}`) : "—";
  const situacaoColor    = situacaoKey === "attention" ? "text-amber-600" : situacaoKey === "regular" ? "text-zinc-800" : "text-zinc-400";
  const ultimaAplicacao  = registros[0]?.dtAplicacao ?? null;

  return (
    <div className="animate-in fade-in duration-300 flex flex-col gap-5">

      {/* ── Métricas superiores ──────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          icon={<div className="p-2.5 bg-blue-50 rounded-xl"><Syringe className="w-5 h-5 text-blue-500" /></div>}
          label={t("metrics.total")}
          value={isLoading ? "..." : String(total)}
        />
        <MetricCard
          icon={<div className="p-2.5 bg-green-50 rounded-xl"><CheckCircle2 className="w-5 h-5 text-green-500" /></div>}
          label={t("metrics.situation")}
          value={isLoading ? "..." : situacaoDisplay}
          valueClass={situacaoColor}
        />
        <MetricCard
          icon={<div className="p-2.5 bg-amber-50 rounded-xl"><History className="w-5 h-5 text-amber-500" /></div>}
          label={t("metrics.lastApplication")}
          value={isLoading ? "..." : formatDate(ultimaAplicacao)}
        />
      </div>

      {/* ── Tabela ───────────────────────────────────────────── */}
      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">

        {/* Header da tabela com botão de removidos */}
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-zinc-800">{t("title")}</h2>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDeleted(true)}
              className="text-zinc-400 hover:text-zinc-700"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              {t("viewDeleted")}
            </Button>
            <Button variant="primary" size="sm" onClick={() => setShowCreate(true)}>
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              {t("register")}
            </Button>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-52 gap-2 text-zinc-400">
            <div className="w-5 h-5 border-2 border-zinc-300 border-t-zinc-700 rounded-full animate-spin" />
            <span className="text-sm font-medium">{t("loading")}</span>
          </div>
        )}

        {/* Vazio */}
        {!isLoading && registros.length === 0 && (
          <div className="flex flex-col items-center justify-center h-52 gap-2">
            <Syringe className="w-8 h-8 text-zinc-200" />
            <p className="text-sm font-semibold text-zinc-400">{t("empty")}</p>
            <p className="text-xs text-zinc-300">{t("emptyDesc")}</p>
          </div>
        )}

        {/* Tabela */}
        {!isLoading && registros.length > 0 && (
          <>
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-100">
                  <th className="text-left text-[10px] font-bold uppercase tracking-widest text-zinc-400 px-6 py-3 whitespace-nowrap">
                    {t("headers.applicationDate")}
                  </th>
                  <th className="text-left text-[10px] font-bold uppercase tracking-widest text-zinc-400 px-4 py-3 w-full">
                    {t("headers.treatment")}
                  </th>
                  <th className="text-left text-[10px] font-bold uppercase tracking-widest text-zinc-400 px-4 py-3 whitespace-nowrap">
                    {t("headers.disease")}
                  </th>
                  <th className="text-right text-[10px] font-bold uppercase tracking-widest text-zinc-400 px-4 py-3 whitespace-nowrap">
                    {t("headers.dosage")}
                  </th>
                  <th className="text-right text-[10px] font-bold uppercase tracking-widest text-zinc-400 px-6 py-3 whitespace-nowrap">
                    {t("headers.return")}
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-50">
                {registros.map((reg) => {
                  const tipo = getTipo(reg);
                  const icon = TIPO_ICONS[tipo];
                  const med  = getMedicacao(reg);
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
                          {icon}
                          <div>
                            <p className="text-sm text-zinc-700 font-medium leading-tight">
                              {med?.medicacao ?? "—"}
                            </p>
                            <p className="text-[11px] text-zinc-400">{t(`tipoConfig.${tipo}`)}</p>
                          </div>
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
                          <div className="text-right">
                            <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                              {reg.dtRetorno ? formatDate(reg.dtRetorno) : t("undefined")}
                            </span>
                          </div>
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

      {/* ── Modais ───────────────────────────────────────────── */}
      <DadoSanitarioDetailsModal
        isOpen={!!selectedRegistro}
        onClose={() => setSelectedRegistro(null)}
        registro={selectedRegistro}
        onMutated={() => setSelectedRegistro(null)}
      />

      <DeletedRegistrosModal
        isOpen={showDeleted}
        onClose={() => setShowDeleted(false)}
        idBufalo={bufaloId}
        onMutated={() => setShowDeleted(false)}
      />

      <CreateDadoSanitarioModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        idBufalo={bufaloId}
        idPropriedade={idPropriedade}
        onCreated={() => setShowCreate(false)}
      />
    </div>
  );
}
