"use client";

import React, { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Archive, Calendar, ChevronDown, ChevronUp, Droplets } from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";
import { useOrdenhasByCiclo } from "@/hooks/useOrdenhas";
import type { CicloAtualResumo, CicloComparativo } from "@/services/ordenhas.service";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(value?: string | null) {
  if (!value) return "—";
  const datePart = value.slice(0, 10);
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);
  if (!m) {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("pt-BR");
  }
  return `${m[3]}/${m[2]}/${m[1]}`;
}

function year(value?: string | null) {
  return value ? value.slice(0, 4) : "?";
}

function toNumber(value: string | number | null | undefined): number {
  const n = typeof value === "number" ? value : parseFloat(value ?? "");
  return Number.isNaN(n) ? 0 : n;
}

interface CicloItem {
  id: string;
  numero: number;
  periodo: string;
  totalProduzido: number;
  mediaDiaria: number;
  dias: number;
  atual: boolean;
}

// ─── Tabela de ordenhas do ciclo (lazy) ─────────────────────────────────────────

const ORDENHAS_LIMIT = 10;

function CicloOrdenhas({ idCiclo }: { idCiclo: string }) {
  const t = useTranslations("Proprietario.rebanho.bufalo.producao.cycles");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useOrdenhasByCiclo(idCiclo, { page, limit: ORDENHAS_LIMIT });

  const ordenhas = useMemo(
    () => [...(data?.data ?? [])].sort((a, b) => (b.dtOrdenha ?? "").localeCompare(a.dtOrdenha ?? "")),
    [data],
  );
  const meta       = data?.meta;
  const total      = meta?.total ?? 0;
  const totalPages = meta?.totalPages ?? 1;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-6 text-zinc-400">
        <div className="w-4 h-4 border-2 border-zinc-300 border-t-zinc-700 rounded-full animate-spin" />
        <span className="text-xs font-medium">{t("loading")}</span>
      </div>
    );
  }

  if (ordenhas.length === 0) {
    return <p className="text-center text-xs text-zinc-400 py-6">{t("empty")}</p>;
  }

  return (
    <div>
      <div className="bg-zinc-50/60 px-4 py-2 flex justify-between items-center border-b border-zinc-100">
        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{t("cycleRecords")}</span>
        <span className="text-xs text-zinc-400">{total} {t("records")}</span>
      </div>
      <table className="w-full">
        <thead>
          <tr className="border-b border-zinc-100">
            <th className="text-left text-[10px] font-bold uppercase tracking-widest text-zinc-400 px-4 py-2">{t("headers.date")}</th>
            <th className="text-left text-[10px] font-bold uppercase tracking-widest text-zinc-400 px-4 py-2">{t("headers.period")}</th>
            <th className="text-right text-[10px] font-bold uppercase tracking-widest text-zinc-400 px-4 py-2">{t("headers.quantity")}</th>
            <th className="text-right text-[10px] font-bold uppercase tracking-widest text-zinc-400 px-4 py-2">{t("headers.occurrence")}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-50">
          {ordenhas.map((o) => (
            <tr key={o.idLact} className="hover:bg-zinc-50/60 transition-colors">
              <td className="px-4 py-2.5 text-sm text-zinc-600 whitespace-nowrap">{formatDate(o.dtOrdenha)}</td>
              <td className="px-4 py-2.5 text-sm text-zinc-700">{o.periodo ? t(`periods.${o.periodo}`) : "—"}</td>
              <td className="px-4 py-2.5 text-right text-sm font-bold text-emerald-700 whitespace-nowrap">{toNumber(o.qtOrdenha).toFixed(2)} L</td>
              <td className="px-4 py-2.5 text-right text-sm text-zinc-500">{o.ocorrencia?.trim() || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          hasPrevPage={meta?.hasPrevPage}
          hasNextPage={meta?.hasNextPage}
          total={total}
          limit={ORDENHAS_LIMIT}
          className="px-4 py-3 border-t border-zinc-100"
        />
      )}
    </div>
  );
}

// ─── Accordion de um ciclo ──────────────────────────────────────────────────────

function CicloAccordion({ ciclo, isOpen, onToggle }: { ciclo: CicloItem; isOpen: boolean; onToggle: () => void }) {
  const t = useTranslations("Proprietario.rebanho.bufalo.producao.cycles");
  return (
    <div className="border border-zinc-200 rounded-xl overflow-hidden bg-white transition-colors hover:border-emerald-200">
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between p-4 text-left transition-colors ${isOpen ? "bg-emerald-50/60" : "bg-white hover:bg-zinc-50"}`}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${isOpen ? "bg-emerald-100 text-emerald-600" : "bg-zinc-100 text-zinc-500"}`}>
            <Archive className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h5 className="font-bold text-zinc-800 text-sm">{ciclo.numero}º Ciclo</h5>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${ciclo.atual ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-500"}`}>
                {ciclo.atual ? t("lactating") : t("closed")}
              </span>
            </div>
            <span className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
              <Calendar className="w-3 h-3" /> {ciclo.periodo} · {ciclo.dias} dias
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] text-zinc-400 block uppercase tracking-wide">{t("totalProduced")}</span>
            <span className="text-sm font-bold text-emerald-600">{ciclo.totalProduzido.toFixed(1)} L</span>
          </div>
          {isOpen ? <ChevronUp className="w-5 h-5 text-zinc-400" /> : <ChevronDown className="w-5 h-5 text-zinc-400" />}
        </div>
      </button>
      {isOpen && (
        <div className="border-t border-zinc-100 animate-in slide-in-from-top-1">
          <CicloOrdenhas idCiclo={ciclo.id} />
        </div>
      )}
    </div>
  );
}

// ─── Componente principal ────────────────────────────────────────────────────────

interface Props {
  cicloAtual: CicloAtualResumo | null;
  comparativoCiclos: CicloComparativo[];
  action?: React.ReactNode;
}

export function CiclosLactacao({ cicloAtual, comparativoCiclos, action }: Props) {
  const t = useTranslations("Proprietario.rebanho.bufalo.producao.cycles");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const ciclos = useMemo<CicloItem[]>(() => {
    const lista: CicloItem[] = [];
    if (cicloAtual) {
      lista.push({
        id: cicloAtual.idCicloLactacao,
        numero: cicloAtual.numeroCiclo,
        periodo: `${year(cicloAtual.dtParto)} – ${t("ongoing")}`,
        totalProduzido: cicloAtual.totalProduzido,
        mediaDiaria: cicloAtual.mediaDiaria,
        dias: cicloAtual.diasEmLactacao,
        atual: true,
      });
    }
    comparativoCiclos.forEach((c) => {
      lista.push({
        id: c.idCicloLactacao,
        numero: c.numeroCiclo,
        periodo: `${year(c.dtParto)} – ${year(c.dtSecagem)}`,
        totalProduzido: c.totalProduzido,
        mediaDiaria: c.mediaDiaria,
        dias: c.duracaoDias,
        atual: false,
      });
    });
    return lista.sort((a, b) => b.numero - a.numero);
  }, [cicloAtual, comparativoCiclos, t]);

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-5">
      <div className="flex items-center justify-between gap-2 mb-4">
        <h2 className="text-sm font-bold text-zinc-800 flex items-center gap-2">
          <Archive className="w-4 h-4 text-zinc-400" /> {t("title")}
        </h2>
        {action}
      </div>

      {ciclos.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-10 text-zinc-300">
          <Droplets className="w-7 h-7" />
          <span className="text-sm">{t("noCycles")}</span>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {ciclos.map((c) => (
            <CicloAccordion
              key={c.id}
              ciclo={c}
              isOpen={expandedId === c.id}
              onToggle={() => setExpandedId(prev => (prev === c.id ? null : c.id))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
