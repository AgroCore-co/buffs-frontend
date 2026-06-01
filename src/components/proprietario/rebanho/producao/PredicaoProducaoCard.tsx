"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { AxiosError } from "axios";
import {
  Sparkles, TrendingUp, TrendingDown, Gauge, AlertCircle, RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { usePredicaoProducao } from "@/hooks/usePredicaoProducao";
import type { ClassificacaoPotencial } from "@/services/predicao-producao.service";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalizeClasse(value?: string): string {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .replace(/[^A-Z]+/g, "_");
}

const CLASSE_CONFIG: Record<string, { bg: string; text: string }> = {
  MUITO_ALTA:  { bg: "bg-emerald-100", text: "text-emerald-700" },
  ALTA:        { bg: "bg-emerald-100", text: "text-emerald-700" },
  MEDIA:       { bg: "bg-amber-100",   text: "text-amber-700"   },
  BAIXA:       { bg: "bg-orange-100",  text: "text-orange-700"  },
  MUITO_BAIXA: { bg: "bg-red-100",     text: "text-red-700"     },
};

function classeCfg(value: ClassificacaoPotencial) {
  return CLASSE_CONFIG[normalizeClasse(value)] ?? { bg: "bg-zinc-100", text: "text-zinc-600" };
}

function parseErroStatus(error: unknown): { status?: number; apiMsg?: string } {
  const ax = error as AxiosError<{ message?: string }>;
  return { status: ax?.response?.status, apiMsg: ax?.response?.data?.message };
}

function formatDateTime(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

// ─── Componente ────────────────────────────────────────────────────────────────

export function PredicaoProducaoCard({ idFemea }: { idFemea: string }) {
  const t = useTranslations("Proprietario.rebanho.bufalo.producao.predicao");
  const { predizer, isPredizendo, predicao, error, reset } = usePredicaoProducao();

  const handlePredizer = () => {
    reset();
    predizer(idFemea).catch(() => { /* erro tratado via `error` */ });
  };

  const classe = predicao ? classeCfg(predicao.classificacaoPotencial) : null;
  const classeKey = predicao ? normalizeClasse(predicao.classificacaoPotencial) : null;
  const positivo = (predicao?.percentualVsMedia ?? 0) >= 0;

  const erro = error ? (() => {
    const { status, apiMsg } = parseErroStatus(error);
    if (status === 503) return { titulo: t("errors.unavailable"), descricao: apiMsg || t("errors.unavailableDesc") };
    if (status === 404) return { titulo: t("errors.notFound"), descricao: t("errors.notFoundDesc") };
    if (status === 400) return { titulo: t("errors.insufficientData"), descricao: apiMsg || t("errors.insufficientDataDesc") };
    if (status !== undefined && status >= 500) return { titulo: t("errors.serviceFailed"), descricao: apiMsg || t("errors.serviceFailedDesc") };
    return { titulo: t("errors.generic"), descricao: apiMsg || t("errors.genericDesc") };
  })() : null;

  const featureLabel = (f: string): string => {
    const key = `features.${f}` as Parameters<typeof t>[0];
    try { return t(key); } catch { return f.replace(/_/g, " ").replace(/^\w/, c => c.toUpperCase()); }
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-5">
      <div className="flex items-center justify-between gap-2 mb-4">
        <h2 className="text-sm font-bold text-zinc-800 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-500" /> {t("title")}
        </h2>
        <Button variant={predicao ? "outline" : "primary"} size="sm" isLoading={isPredizendo} onClick={handlePredizer}>
          {predicao ? <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> : <Sparkles className="w-3.5 h-3.5 mr-1.5" />}
          {predicao ? t("recalculate") : t("generate")}
        </Button>
      </div>

      {/* Estado: carregando */}
      {isPredizendo && (
        <div className="flex flex-col items-center justify-center h-40 gap-2 text-zinc-400">
          <div className="w-5 h-5 border-2 border-zinc-300 border-t-indigo-500 rounded-full animate-spin" />
          <span className="text-sm font-medium">{t("loading")}</span>
        </div>
      )}

      {/* Estado: erro */}
      {!isPredizendo && erro && (
        <div className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-200 p-4">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-700">{erro.titulo}</p>
            <p className="text-sm text-red-600 mt-0.5">{erro.descricao}</p>
          </div>
        </div>
      )}

      {/* Estado: vazio (ainda não gerado) */}
      {!isPredizendo && !erro && !predicao && (
        <div className="flex flex-col items-center justify-center h-40 gap-2 text-center">
          <div className="p-2.5 bg-indigo-50 rounded-xl">
            <Sparkles className="w-6 h-6 text-indigo-400" />
          </div>
          <p className="text-sm font-semibold text-zinc-500">{t("empty")}</p>
          <p className="text-xs text-zinc-400 max-w-xs">{t("emptyDesc")}</p>
        </div>
      )}

      {/* Estado: resultado */}
      {!isPredizendo && !erro && predicao && classe && (
        <div className="flex flex-col gap-5 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Produção prevista */}
            <div className="sm:col-span-1 bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex flex-col justify-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">{t("result.predictedProduction")}</p>
              <p className="text-3xl font-extrabold text-indigo-700 leading-tight mt-1">
                {predicao.predicaoLitros.toFixed(1)}
                <span className="text-base font-bold text-indigo-400 ml-1">L</span>
              </p>
              <p className="text-xs text-indigo-400 mt-1">{t("result.nextCycle")}</p>
            </div>

            {/* Potencial + comparativo */}
            <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-4 flex items-start gap-3">
                <div className="p-2 bg-white rounded-md border border-zinc-200"><Gauge className="w-4 h-4 text-zinc-500" /></div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{t("result.potential")}</p>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold mt-1 ${classe.bg} ${classe.text}`}>
                    {classeKey ? t(`potential.${classeKey}`) : predicao.classificacaoPotencial}
                  </span>
                </div>
              </div>

              <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-4 flex items-start gap-3">
                <div className="p-2 bg-white rounded-md border border-zinc-200">
                  {positivo ? <TrendingUp className="w-4 h-4 text-emerald-500" /> : <TrendingDown className="w-4 h-4 text-red-500" />}
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{t("result.vsAverage")}</p>
                  <p className={`text-lg font-bold leading-tight mt-0.5 ${positivo ? "text-emerald-600" : "text-red-600"}`}>
                    {positivo ? "+" : ""}{predicao.percentualVsMedia.toFixed(1)}%
                  </p>
                  <p className="text-xs text-zinc-400">{t("result.average")}: {predicao.producaoMediaPropriedade.toFixed(1)} L</p>
                </div>
              </div>
            </div>
          </div>

          {/* Features utilizadas */}
          {predicao.featuresUtilizadas?.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">{t("result.variables")}</p>
              <div className="flex flex-wrap gap-1.5">
                {predicao.featuresUtilizadas.map(f => (
                  <span key={f} className="px-2.5 py-1 rounded-lg bg-zinc-100 text-xs font-medium text-zinc-600">
                    {featureLabel(f)}
                  </span>
                ))}
              </div>
            </div>
          )}

          <p className="text-[11px] text-zinc-400 text-right">
            {t("result.generatedAt")} {formatDateTime(predicao.dataPredicao)}
          </p>
        </div>
      )}
    </div>
  );
}
