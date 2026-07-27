"use client";

import React from "react";
import { Baby, Heart, Syringe, Stethoscope, AlertCircle, Calendar } from "lucide-react";
import {
  DataTable, TableHeader, TableHead, TableBody, TableRow, TableCell, TableEmptyState,
} from "@/components/ui/DataTable";
import { Bufalo } from "@/services/bufalos.service";
import { useResumoReprodutivo } from "@/hooks/useReproducao";
import Badge from "@/components/ui/Badge";
import type {
  HistoricoReprodutivoFemea,
  HistoricoReprodutivoMacho,
  ResumoReprodutivoFemea,
  ResumoReprodutivoMacho,
} from "@/services/reproducao.service";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type TipoEvento = "cobertura" | "inseminacao" | "diagnostico" | "parto" | "aborto";
type EventoHistorico = HistoricoReprodutivoFemea | HistoricoReprodutivoMacho;

const HISTORICO_LIMIT = 10;

function classificarEvento(ev: EventoHistorico): TipoEvento {
  if (ev.tipoParto) return ev.tipoParto === "Aborto" ? "aborto" : "parto";
  if (ev.status === "Falha") return "aborto";
  if (ev.status === "Confirmada" || ev.status === "Concluída") return "diagnostico";
  if (ev.tipoInseminacao && ev.tipoInseminacao !== "Monta Natural") return "inseminacao";
  return "cobertura";
}

function resultadoEvento(ev: EventoHistorico): string {
  if (ev.tipoParto) return ev.tipoParto;
  return ev.status || "—";
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TIPO_CONFIG: Record<TipoEvento, { icon: React.ReactNode; label: string; bg: string; text: string; border: string }> = {
  parto:       { icon: <Baby       className="w-3 h-3" />, label: "Parto",        bg: "bg-green-50",  text: "text-green-700",  border: "border-green-200"  },
  inseminacao: { icon: <Syringe    className="w-3 h-3" />, label: "Inseminação",  bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200"   },
  diagnostico: { icon: <Stethoscope className="w-3 h-3"/>, label: "Diagnóstico",  bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  cobertura:   { icon: <Heart      className="w-3 h-3" />, label: "Cobertura",    bg: "bg-rose-50",   text: "text-rose-700",   border: "border-rose-200"   },
  aborto:      { icon: <AlertCircle className="w-3 h-3"/>, label: "Abortamento",  bg: "bg-red-50",    text: "text-red-700",    border: "border-red-200"    },
};

function formatDate(v?: string | null) {
  if (!v) return "—";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("pt-BR");
}

const SITUACAO_BADGE: Record<ResumoReprodutivoFemea["situacaoAtual"], "active" | "inactive" | "info"> = {
  "Prenha": "active",
  "Em Lactação": "active",
  "Coberta": "info",
  "Aguardando Diagnóstico": "info",
  "Período Pós-Parto": "info",
  "Vazia": "inactive",
};

const CONFIABILIDADE_BADGE: Record<NonNullable<ResumoReprodutivoMacho["confiabilidade"]>, "active" | "inactive" | "info"> = {
  "Alta": "active",
  "Média": "info",
  "Baixa": "inactive",
};

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function MetricCard({ icon, label, value, badge }: { icon: React.ReactNode; label: string; value: string; badge?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 bg-white border border-zinc-200 rounded-xl p-5">
      <div className="flex-shrink-0">{icon}</div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{label}</p>
        <div className="flex items-center gap-2">
          <p className="text-lg font-bold text-zinc-800 leading-tight">{value}</p>
          {badge}
        </div>
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function ReproducaoTab({ bufalo }: { bufalo: Bufalo }) {
  const { data: resumo, isLoading, isError } = useResumoReprodutivo(bufalo.idBufalo, {
    historicoLimit: HISTORICO_LIMIT,
  });

  const historico = resumo?.historico ?? [];

  // Métricas adaptadas ao sexo: fêmea e macho têm indicadores reprodutivos distintos.
  const metrics = resumo?.sexo === "M"
    ? [
        { icon: <Heart className="w-5 h-5 text-rose-500" />, label: "Coberturas Realizadas", value: String(resumo.totalCoberturasRealizadas) },
        { icon: <Calendar className="w-5 h-5 text-rose-500" />, label: "Última Cobertura", value: formatDate(resumo.ultimaCobertura) },
        {
          icon: <Baby className="w-5 h-5 text-rose-500" />,
          label: "Taxa de Concepção (TCA)",
          value: resumo.taxaConcepçãoAjustada != null ? `${resumo.taxaConcepçãoAjustada.toFixed(1)}%` : "—",
          badge: resumo.confiabilidade ? (
            <Badge type={CONFIABILIDADE_BADGE[resumo.confiabilidade]}>{resumo.confiabilidade}</Badge>
          ) : undefined,
        },
      ]
    : [
        { icon: <Baby className="w-5 h-5 text-rose-500" />, label: "Total de Partos", value: String(resumo?.totalCiclos ?? 0) },
        { icon: <Calendar className="w-5 h-5 text-rose-500" />, label: "Último Parto", value: formatDate(resumo?.ultimoParto) },
        { icon: <Heart className="w-5 h-5 text-rose-500" />, label: "Crias Registradas", value: String(resumo?.totalCiclos ?? 0) },
      ];

  return (
    <div className="animate-in fade-in duration-300 flex flex-col gap-5">

      {/* ── Status reprodutivo (fêmea) ─────────────────────────────── */}
      {resumo?.sexo === "F" && (
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Situação Atual</span>
          <Badge type={SITUACAO_BADGE[resumo.situacaoAtual]}>{resumo.situacaoAtual}</Badge>
        </div>
      )}

      {/* ── Métricas ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {metrics.map((m, i) => (
          <MetricCard
            key={i}
            icon={<div className="p-2.5 bg-rose-50 rounded-xl">{m.icon}</div>}
            label={m.label}
            value={isLoading ? "..." : m.value}
            badge={isLoading ? undefined : "badge" in m ? m.badge : undefined}
          />
        ))}
      </div>

      {/* ── Tabela ───────────────────────────────────────────────── */}
      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-100">
          <h2 className="text-sm font-bold text-zinc-800">Histórico Reprodutivo</h2>
        </div>

        <DataTable
          isEmpty={!isLoading && historico.length === 0}
          emptyState={
            <TableEmptyState
              icon={Baby}
              title={isError ? "Erro ao carregar histórico" : "Nenhum evento reprodutivo"}
              description={
                isError
                  ? "Não foi possível buscar os registros. Tente novamente."
                  : "Coberturas, inseminações e partos aparecerão aqui."
              }
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
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 4 }).map((__, j) => (
                    <TableCell key={j}>
                      <div className="h-4 bg-zinc-100 rounded animate-pulse w-24" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              historico.map((ev) => {
                const tipo = classificarEvento(ev);
                const cfg = TIPO_CONFIG[tipo];
                const observacao = "nomeBufala" in ev ? (ev.nomeBufala ?? "—") : formatDate(ev.dtParto);
                return (
                  <TableRow key={ev.idReproducao}>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-zinc-600">
                        <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        {formatDate(ev.dtEvento)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                        {cfg.icon}{cfg.label}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-zinc-700">{resultadoEvento(ev)}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-zinc-400">{observacao}</span>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </DataTable>
      </div>
    </div>
  );
}
