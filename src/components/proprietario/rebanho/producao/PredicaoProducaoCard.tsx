"use client";

import React from "react";
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

const CLASSE_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  MUITO_ALTA:  { label: "Muito Alta",  bg: "bg-emerald-100", text: "text-emerald-700" },
  ALTA:        { label: "Alta",        bg: "bg-emerald-100", text: "text-emerald-700" },
  MEDIA:       { label: "Média",       bg: "bg-amber-100",   text: "text-amber-700"   },
  BAIXA:       { label: "Baixa",       bg: "bg-orange-100",  text: "text-orange-700"  },
  MUITO_BAIXA: { label: "Muito Baixa", bg: "bg-red-100",     text: "text-red-700"     },
};

function classeCfg(value: ClassificacaoPotencial) {
  return CLASSE_CONFIG[normalizeClasse(value)] ?? { label: value || "—", bg: "bg-zinc-100", text: "text-zinc-600" };
}

const FEATURE_LABELS: Record<string, string> = {
  idade: "Idade",
  numero_lactacoes: "Nº de lactações",
  producao_anterior: "Produção anterior",
  escore_corporal: "Escore corporal",
  raca: "Raça",
  peso: "Peso",
};

function featureLabel(f: string): string {
  return FEATURE_LABELS[f] ?? f.replace(/_/g, " ").replace(/^\w/, c => c.toUpperCase());
}

function formatDateTime(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

interface ErroInfo {
  titulo: string;
  descricao: string;
}

function parseErro(error: unknown): ErroInfo {
  const ax = error as AxiosError<{ message?: string }>;
  const status = ax?.response?.status;
  const apiMsg = ax?.response?.data?.message;
  if (status === 503) {
    return {
      titulo: "Serviço de IA indisponível",
      descricao: apiMsg || "O serviço de predição está temporariamente indisponível. Tente novamente mais tarde.",
    };
  }
  if (status === 404) {
    return { titulo: "Fêmea não encontrada", descricao: "Não foi possível localizar esta fêmea para a predição." };
  }
  if (status === 400) {
    return { titulo: "Dados insuficientes", descricao: apiMsg || "Dados insuficientes para gerar a predição desta fêmea." };
  }
  if (status !== undefined && status >= 500) {
    return {
      titulo: "Falha no serviço de IA",
      descricao: apiMsg || "O serviço de predição encontrou um erro interno. Tente novamente em instantes.",
    };
  }
  return { titulo: "Erro na predição", descricao: apiMsg || "Não foi possível gerar a predição. Tente novamente." };
}

// ─── Componente ────────────────────────────────────────────────────────────────

export function PredicaoProducaoCard({ idFemea }: { idFemea: string }) {
  const { predizer, isPredizendo, predicao, error, reset } = usePredicaoProducao();

  const handlePredizer = () => {
    reset();
    predizer(idFemea).catch(() => { /* erro tratado via `error` */ });
  };

  const classe = predicao ? classeCfg(predicao.classificacaoPotencial) : null;
  const positivo = (predicao?.percentualVsMedia ?? 0) >= 0;
  const erro = error ? parseErro(error) : null;

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-5">
      <div className="flex items-center justify-between gap-2 mb-4">
        <h2 className="text-sm font-bold text-zinc-800 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-500" /> Predição de Produção (IA)
        </h2>
        <Button variant={predicao ? "outline" : "primary"} size="sm" isLoading={isPredizendo} onClick={handlePredizer}>
          {predicao ? <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> : <Sparkles className="w-3.5 h-3.5 mr-1.5" />}
          {predicao ? "Recalcular" : "Gerar predição"}
        </Button>
      </div>

      {/* Estado: carregando */}
      {isPredizendo && (
        <div className="flex flex-col items-center justify-center h-40 gap-2 text-zinc-400">
          <div className="w-5 h-5 border-2 border-zinc-300 border-t-indigo-500 rounded-full animate-spin" />
          <span className="text-sm font-medium">Analisando dados com IA...</span>
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
          <p className="text-sm font-semibold text-zinc-500">Sem predição gerada</p>
          <p className="text-xs text-zinc-400 max-w-xs">
            Estime a produção do próximo ciclo desta fêmea com base no histórico e características do animal.
          </p>
        </div>
      )}

      {/* Estado: resultado */}
      {!isPredizendo && !erro && predicao && classe && (
        <div className="flex flex-col gap-5 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Produção prevista */}
            <div className="sm:col-span-1 bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex flex-col justify-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Produção prevista</p>
              <p className="text-3xl font-extrabold text-indigo-700 leading-tight mt-1">
                {predicao.predicaoLitros.toFixed(1)}
                <span className="text-base font-bold text-indigo-400 ml-1">L</span>
              </p>
              <p className="text-xs text-indigo-400 mt-1">próximo ciclo de lactação</p>
            </div>

            {/* Potencial + comparativo */}
            <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-4 flex items-start gap-3">
                <div className="p-2 bg-white rounded-md border border-zinc-200"><Gauge className="w-4 h-4 text-zinc-500" /></div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Potencial</p>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold mt-1 ${classe.bg} ${classe.text}`}>
                    {classe.label}
                  </span>
                </div>
              </div>

              <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-4 flex items-start gap-3">
                <div className="p-2 bg-white rounded-md border border-zinc-200">
                  {positivo ? <TrendingUp className="w-4 h-4 text-emerald-500" /> : <TrendingDown className="w-4 h-4 text-red-500" />}
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">vs. média da propriedade</p>
                  <p className={`text-lg font-bold leading-tight mt-0.5 ${positivo ? "text-emerald-600" : "text-red-600"}`}>
                    {positivo ? "+" : ""}{predicao.percentualVsMedia.toFixed(1)}%
                  </p>
                  <p className="text-xs text-zinc-400">média: {predicao.producaoMediaPropriedade.toFixed(1)} L</p>
                </div>
              </div>
            </div>
          </div>

          {/* Features utilizadas */}
          {predicao.featuresUtilizadas?.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Variáveis consideradas</p>
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
            Predição gerada em {formatDateTime(predicao.dataPredicao)}
          </p>
        </div>
      )}
    </div>
  );
}
