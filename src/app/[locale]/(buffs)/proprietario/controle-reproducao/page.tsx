"use client";

import { useState } from "react";
import { Activity, CheckCircle2, XCircle, CalendarDays } from "lucide-react";

import Container from "@/components/ui/Container";
import MetricCard from "@/components/ui/MetricCard";
import {
  DataTable, TableBody, TableCell, TableEmptyState, TableHead, TableHeader, TableRow,
} from "@/components/ui/DataTable";
import { usePropriedadeStore } from "@/stores/propriedade.store";
import { useDashboardReproducao } from "@/hooks/useDashboard";
import { useReproducoesByPropriedade } from "@/hooks/useReproducao";
import type { Reproducao } from "@/services/reproducao.service";
import { ReproducaoDetailModal } from "@/components/proprietario/reproducao/ReproducaoDetailModal";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(value?: string | null) {
  if (!value) return "—";
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.slice(0, 10));
  return m ? `${m[3]}/${m[2]}/${m[1]}` : "—";
}

function statusBadge(status?: string): string {
  if (status === "Confirmada") return "bg-green-100 text-green-800";
  if (status === "Concluída") return "bg-blue-100 text-blue-800";
  if (status === "Falha") return "bg-red-100 text-red-800";
  return "bg-amber-100 text-amber-800";
}

const TABLE_LIMIT = 10;

export default function ControleReproducaoPage() {
  const { activeId, activePropriedade } = usePropriedadeStore();
  const hasActive = !!activeId;

  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Reproducao | null>(null);

  const { data: metrics, isLoading: isLoadingMetrics } = useDashboardReproducao(activeId ?? "", { enabled: hasActive });
  const { data, isLoading: isLoadingList } = useReproducoesByPropriedade(
    activeId ?? "", { page, limit: TABLE_LIMIT }, { enabled: hasActive },
  );

  const registros = data?.data ?? [];
  const meta = data?.meta;
  const total = meta?.total ?? 0;
  const totalPages = meta?.totalPages ?? 1;

  const fmtMetric = (v?: number) => (!hasActive ? "0" : isLoadingMetrics ? "..." : String(v ?? 0));

  return (
    <div className="flex flex-col gap-6 pb-10">
      {/* ── Header + métricas ─────────────────────────────────────── */}
      <Container className="p-5">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#404040]">
              Controle de Reprodução{activePropriedade?.nome ? ` - ${activePropriedade.nome}` : ""}
            </h1>
            <p className="text-sm text-[#404040]/60 mt-1">
              Gerencie o ciclo reprodutivo do rebanho, registre inseminações e acompanhe prenhezes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
            <MetricCard
              title="Reproduções em Andamento"
              value={fmtMetric(metrics?.totalEmAndamento)}
              subtitle="Reproduções não concluídas"
              icon={<Activity className="w-4 h-4 text-[#ce7d0a]" />}
            />
            <MetricCard
              title="Reproduções Confirmadas"
              value={fmtMetric(metrics?.totalConfirmada)}
              subtitle="Gestação confirmada"
              icon={<CheckCircle2 className="w-4 h-4 text-green-600" />}
            />
            <MetricCard
              title="Reproduções com Falha"
              value={fmtMetric(metrics?.totalFalha)}
              subtitle="Falha na reprodução"
              icon={<XCircle className="w-4 h-4 text-red-500" />}
            />
            <MetricCard
              title="Última Reprodução"
              value={!hasActive ? "—" : isLoadingMetrics ? "..." : formatDate(metrics?.ultimaDataReproducao)}
              subtitle="Data da última reprodução"
              icon={<CalendarDays className="w-4 h-4 text-[#ce7d0a]" />}
            />
          </div>
        </div>
      </Container>

      {/* ── Tabela de registros ───────────────────────────────────── */}
      <Container className="p-5">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-[#404040]">Registros de Reprodução</h2>
          <p className="text-sm text-[#404040]/60 mt-1">Visualização dos registros de coberturas e inseminações.</p>
        </div>

        {isLoadingList && hasActive ? (
          <div className="w-full min-h-[240px] flex items-center justify-center border border-zinc-200 rounded-xl bg-zinc-50/50">
            <div className="flex flex-col items-center gap-2 text-zinc-400">
              <div className="w-6 h-6 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin" />
              <span className="text-sm font-medium">Carregando registros...</span>
            </div>
          </div>
        ) : (
          <DataTable
            isEmpty={registros.length === 0}
            pagination={
              total > 0
                ? {
                    page,
                    totalPages,
                    onPageChange: setPage,
                    hasPrevPage: meta?.hasPrevPage,
                    hasNextPage: meta?.hasNextPage,
                    total,
                    limit: TABLE_LIMIT,
                  }
                : undefined
            }
            emptyState={
              <TableEmptyState
                icon={Activity}
                title={hasActive ? "Nenhum registro de reprodução" : "Selecione uma propriedade"}
                description={
                  hasActive
                    ? "Coberturas e inseminações registradas aparecerão aqui."
                    : "Escolha uma propriedade para visualizar os registros de reprodução."
                }
              />
            }
          >
            <TableHeader>
              <TableHead>Data do Evento</TableHead>
              <TableHead>Matriz</TableHead>
              <TableHead>Touro / Semen</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Parto</TableHead>
              <TableHead align="right">Ocorrência</TableHead>
            </TableHeader>
            <TableBody>
              {registros.map((r: Reproducao) => (
                <TableRow key={r.idReproducao} onClick={() => setSelected(r)}>
                  <TableCell>
                    <span className="text-sm font-medium text-zinc-700">{formatDate(r.dtEvento)}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-zinc-900">{r.bufalo_idBufala?.nome ?? "—"}</span>
                      <span className="text-xs text-zinc-500">{r.bufalo_idBufala?.brinco ?? "—"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {r.idSemen ? (
                      <span className="text-sm italic text-zinc-700">Inseminação Artificial</span>
                    ) : (
                      <div className="flex flex-col">
                        <span className="text-sm text-zinc-800">{r.bufalo_idBufalo?.nome ?? "—"}</span>
                        <span className="text-xs text-zinc-500">{r.bufalo_idBufalo?.brinco ?? "—"}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-zinc-700">{r.tipoInseminacao || "—"}</span>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${statusBadge(r.status)}`}>
                      {r.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-zinc-600">{r.tipoParto || "—"}</span>
                  </TableCell>
                  <TableCell align="right">
                    <span className="text-sm text-zinc-500 max-w-[200px] inline-block truncate align-middle" title={r.ocorrencia ?? ""}>
                      {r.ocorrencia?.trim() || "—"}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </DataTable>
        )}

        {hasActive && !isLoadingList && total > 0 && (
          <p className="text-sm text-zinc-500 mt-4">
            Mostrando {(page - 1) * TABLE_LIMIT + 1} a {Math.min(page * TABLE_LIMIT, total)} de {total} registros
          </p>
        )}
      </Container>

      {/* ── Modal ────────────────────────────────────────────────── */}
      <ReproducaoDetailModal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        registro={selected}
      />
    </div>
  );
}
