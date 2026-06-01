"use client";

import React, { useMemo, useState } from "react";
import {
  Activity, Calendar, Droplet, TrendingUp, TrendingDown, AlertCircle,
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { useResumoProducaoBufala, useOrdenhasByCiclo } from "@/hooks/useOrdenhas";
import { CiclosLactacao } from "@/components/proprietario/rebanho/producao/CiclosLactacao";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PERIODO_LABEL: Record<string, string> = { M: "Manhã", T: "Tarde", N: "Noite" };

function formatDate(value?: string | null) {
  if (!value) return "—";
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.slice(0, 10));
  return m ? `${m[3]}/${m[2]}/${m[1]}` : "—";
}

function shortDay(value: string) {
  const [, mes, dia] = value.slice(0, 10).split("-");
  return dia && mes ? `${dia}/${mes}` : value;
}

function toNumber(value: string | number | null | undefined): number {
  const n = typeof value === "number" ? value : parseFloat(value ?? "");
  return Number.isNaN(n) ? 0 : n;
}

type Tab = "ciclo" | "historico" | "grafico";

const ORDENHAS_LIMIT = 7;

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function DetailMetric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-zinc-50 border border-zinc-100 rounded-lg p-3 flex items-start gap-3">
      <div className="p-2 bg-white rounded-md border border-zinc-200 text-emerald-600">{icon}</div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{label}</p>
        <p className="text-lg font-bold text-zinc-800">{value}</p>
      </div>
    </div>
  );
}

// ─── Aba: Ciclo Atual ───────────────────────────────────────────────────────────

function CicloAtualTab({ idCiclo, totalAcumulado, mediaOrdenha }: {
  idCiclo?: string; totalAcumulado: number; mediaOrdenha: number;
}) {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useOrdenhasByCiclo(idCiclo, { page: 1, limit: 100 }, { enabled: !!idCiclo });

  const ordenhas = useMemo(
    () => [...(data?.data ?? [])].sort((a, b) => (b.dtOrdenha ?? "").localeCompare(a.dtOrdenha ?? "")),
    [data],
  );
  const quantidades = ordenhas.map(o => toNumber(o.qtOrdenha));
  const totalOrdenhas = ordenhas.length;
  const maior = quantidades.length ? Math.max(...quantidades) : 0;
  const menor = quantidades.length ? Math.min(...quantidades) : 0;

  const totalPages = Math.max(1, Math.ceil(ordenhas.length / ORDENHAS_LIMIT));
  const paginated = ordenhas.slice((page - 1) * ORDENHAS_LIMIT, page * ORDENHAS_LIMIT);

  if (!idCiclo) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-2 text-center">
        <AlertCircle className="w-7 h-7 text-zinc-200" />
        <p className="text-sm font-semibold text-zinc-400">Sem ciclo de lactação ativo</p>
        <p className="text-xs text-zinc-300">Esta fêmea não possui um ciclo em andamento.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Resumo */}
      <div className="lg:col-span-1 space-y-3">
        <h4 className="text-sm font-bold text-zinc-800 mb-2 flex items-center gap-2">
          <Activity className="w-4 h-4 text-zinc-400" /> Resumo
        </h4>
        <DetailMetric icon={<Calendar className="w-4 h-4" />} label="Total de Ordenhas" value={isLoading ? "..." : String(totalOrdenhas)} />
        <DetailMetric icon={<Droplet className="w-4 h-4" />} label="Média por Ordenha" value={`${mediaOrdenha.toFixed(2)} L`} />
        <DetailMetric icon={<TrendingUp className="w-4 h-4" />} label="Maior Ordenha" value={`${maior.toFixed(2)} L`} />
        <DetailMetric icon={<TrendingDown className="w-4 h-4" />} label="Menor Ordenha" value={`${menor.toFixed(2)} L`} />
        <div className="bg-amber-50 rounded-lg p-4 border border-amber-100 text-center mt-2">
          <p className="text-[10px] text-amber-700 uppercase font-bold tracking-widest mb-1">Total Acumulado</p>
          <p className="text-3xl font-extrabold text-amber-600">{totalAcumulado.toFixed(2)} L</p>
        </div>
      </div>

      {/* Ordenhas do ciclo */}
      <div className="lg:col-span-2 flex flex-col">
        <h4 className="text-sm font-bold text-zinc-800 mb-3">Ordenhas do Ciclo Atual</h4>
        <div className="border border-zinc-200 rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-zinc-400">
              <div className="w-4 h-4 border-2 border-zinc-300 border-t-zinc-700 rounded-full animate-spin" />
              <span className="text-xs font-medium">Carregando ordenhas...</span>
            </div>
          ) : ordenhas.length === 0 ? (
            <p className="text-center text-xs text-zinc-400 py-10">Nenhuma ordenha neste ciclo.</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-100">
                  <th className="text-left text-[10px] font-bold uppercase tracking-widest text-zinc-400 px-4 py-2">Data</th>
                  <th className="text-left text-[10px] font-bold uppercase tracking-widest text-zinc-400 px-4 py-2">Período</th>
                  <th className="text-right text-[10px] font-bold uppercase tracking-widest text-zinc-400 px-4 py-2">Quantidade</th>
                  <th className="text-right text-[10px] font-bold uppercase tracking-widest text-zinc-400 px-4 py-2">Ocorrência</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {paginated.map(o => (
                  <tr key={o.idLact} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="px-4 py-2.5 text-sm text-zinc-600 whitespace-nowrap">{formatDate(o.dtOrdenha)}</td>
                    <td className="px-4 py-2.5 text-sm text-zinc-700">{o.periodo ? (PERIODO_LABEL[o.periodo] ?? o.periodo) : "—"}</td>
                    <td className="px-4 py-2.5 text-right text-sm font-bold text-emerald-700 whitespace-nowrap">{toNumber(o.qtOrdenha).toFixed(2)} L</td>
                    <td className="px-4 py-2.5 text-right text-sm text-zinc-500">{o.ocorrencia?.trim() || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {totalPages > 1 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            total={ordenhas.length}
            limit={ORDENHAS_LIMIT}
            className="pt-3"
          />
        )}
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

interface Props {
  isOpen: boolean;
  onClose: () => void;
  idFemea: string | null;
}

export function ResumoProducaoModal({ isOpen, onClose, idFemea }: Props) {
  const [tab, setTab] = useState<Tab>("ciclo");
  const { data: resumo, isLoading } = useResumoProducaoBufala(idFemea ?? undefined, { enabled: isOpen && !!idFemea });

  // Reseta para a primeira aba sempre que abrir uma nova fêmea
  React.useEffect(() => {
    if (isOpen) setTab("ciclo");
  }, [isOpen, idFemea]);

  const ciclo = resumo?.cicloAtual ?? null;
  const chartData = useMemo(
    () => (resumo?.graficoProducao ?? []).map(p => ({ dia: shortDay(p.data), litros: p.quantidade })),
    [resumo],
  );

  const titulo = resumo?.bufala?.nome ? `Resumo de Produção • ${resumo.bufala.nome}` : "Resumo de Produção";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={titulo}
      size="4xl"
      footer={<Button variant="ghost" onClick={onClose}>Fechar</Button>}
    >
      <div className="flex flex-col gap-5">
        {resumo?.bufala && (
          <p className="-mt-2 text-xs text-zinc-500">
            Brinco: <span className="font-mono text-zinc-700 font-medium">{resumo.bufala.brinco}</span>
          </p>
        )}

        {/* Abas */}
        <div className="flex border-b border-zinc-200">
          {([
            { id: "ciclo", label: "Ciclo Atual" },
            { id: "historico", label: "Histórico" },
            { id: "grafico", label: "Gráfico" },
          ] as { id: Tab; label: string }[]).map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                tab === t.id
                  ? "border-[#ce7d0a] text-[#ce7d0a]"
                  : "border-transparent text-zinc-500 hover:text-zinc-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2 text-zinc-400">
            <div className="w-5 h-5 border-2 border-zinc-300 border-t-zinc-700 rounded-full animate-spin" />
            <span className="text-sm font-medium">Carregando produção...</span>
          </div>
        ) : (
          <div className="animate-in fade-in duration-200">
            {tab === "ciclo" && (
              <CicloAtualTab
                idCiclo={ciclo?.idCicloLactacao}
                totalAcumulado={ciclo?.totalProduzido ?? 0}
                mediaOrdenha={ciclo?.mediaDiaria ?? 0}
              />
            )}

            {tab === "historico" && (
              <CiclosLactacao cicloAtual={ciclo} comparativoCiclos={resumo?.comparativoCiclos ?? []} />
            )}

            {tab === "grafico" && (
              chartData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[300px] gap-2 text-zinc-300">
                  <Droplet className="w-7 h-7" />
                  <span className="text-sm">Sem ordenhas nos últimos 30 dias</span>
                </div>
              ) : (
                <div className="h-[300px] w-full bg-zinc-50/50 rounded-xl border border-zinc-100 p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                      <XAxis dataKey="dia" tick={{ fontSize: 12, fill: "#71717a" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: "#71717a" }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                        formatter={(value) => [`${toNumber(value as number).toFixed(2)} L`, "Produção"]}
                      />
                      <Line type="monotone" dataKey="litros" stroke="#d97706" strokeWidth={3} dot={{ r: 3, fill: "#d97706" }} activeDot={{ r: 6 }} name="Litros" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
