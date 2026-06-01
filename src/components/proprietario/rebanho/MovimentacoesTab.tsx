"use client";

import React, { useMemo, useState } from "react";
import { ArrowRightLeft, MapPin, Clock, Calendar, ArrowRight } from "lucide-react";
import {
  DataTable, TableHeader, TableHead, TableBody, TableRow, TableCell, TableEmptyState,
} from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { Button } from "@/components/ui/Button";
import { Bufalo } from "@/services/bufalos.service";
import { useMovLoteHistoricoByGrupo } from "@/hooks/useMovLote";
import { useLotesByPropriedade } from "@/hooks/useLotes";
import { useGruposById } from "@/hooks/useGrupos";
import { MoverGrupoModal } from "./movimentacoes/MoverGrupoModal";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Formata datas (date-only ou timestamp) para DD/MM/YYYY sem deslocar o dia por fuso. */
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

function isAtual(status?: string, dtSaida?: string | null) {
  return status === "Atual" || (!dtSaida && status !== "Finalizado");
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function MetricCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="flex items-center gap-4 bg-white border border-zinc-200 rounded-xl p-5">
      <div className="flex-shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{label}</p>
        <p className="text-lg font-bold text-zinc-800 leading-tight truncate">
          {value}
          {sub && <span className="text-sm font-normal text-zinc-400 ml-1">{sub}</span>}
        </p>
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

const LIMIT = 8;

export function MovimentacoesTab({ bufalo }: { bufalo: Bufalo }) {
  const [page, setPage] = useState(1);
  const [showMover, setShowMover] = useState(false);
  const idGrupo = bufalo.idGrupo ?? undefined;

  const { data: historicoResp, isLoading: isLoadingHistorico, isError } = useMovLoteHistoricoByGrupo(idGrupo);
  const { data: lotes = [] } = useLotesByPropriedade(bufalo.idPropriedade, { enabled: !!idGrupo });
  const { data: grupo } = useGruposById(idGrupo, { enabled: !!idGrupo });

  const grupoNome = grupo?.nomeGrupo ?? "—";

  // Mapa idLote → nomeLote para resolver os IDs do histórico.
  const loteNomeById = useMemo(() => {
    const map: Record<string, string> = {};
    for (const l of lotes) map[l.idLote] = l.nomeLote;
    return map;
  }, [lotes]);

  const loteNome = (id?: string | null) => (id ? loteNomeById[id] ?? "Lote" : null);

  // Histórico ordenado do mais recente para o mais antigo.
  const movimentacoes = useMemo(() => {
    const registros = historicoResp?.historico ?? [];
    return [...registros].sort((a, b) => (b.dtEntrada ?? "").localeCompare(a.dtEntrada ?? ""));
  }, [historicoResp]);

  const total      = historicoResp?.totalMovimentacoes ?? movimentacoes.length;
  const totalPages = Math.max(1, Math.ceil(movimentacoes.length / LIMIT));
  const paginated  = movimentacoes.slice((page - 1) * LIMIT, page * LIMIT);

  const atual = movimentacoes.find(m => isAtual(m.status, m.dtSaida)) ?? movimentacoes[0];

  // ── Animal sem grupo ─────────────────────────────────────────
  if (!idGrupo) {
    return (
      <>
        <div className="animate-in fade-in duration-300 bg-white border border-zinc-200 rounded-2xl">
          <TableEmptyState
            icon={ArrowRightLeft}
            title="Animal sem grupo de manejo"
            description="As movimentações entre lotes são registradas por grupo. Associe este búfalo a um grupo para acompanhar o histórico."
            action={
              <Button variant="primary" size="sm" onClick={() => setShowMover(true)}>
                <ArrowRightLeft className="w-3.5 h-3.5 mr-1.5" />
                Associar a um grupo
              </Button>
            }
          />
        </div>

        <MoverGrupoModal
          isOpen={showMover}
          onClose={() => setShowMover(false)}
          bufalo={bufalo}
          grupoAtualNome={grupoNome}
          onMoved={() => setShowMover(false)}
        />
      </>
    );
  }

  return (
    <div className="animate-in fade-in duration-300 flex flex-col gap-5">

      {/* ── Métricas ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          icon={<div className="p-2.5 bg-violet-50 rounded-xl"><ArrowRightLeft className="w-5 h-5 text-violet-500" /></div>}
          label="Total de Movimentações"
          value={isLoadingHistorico ? "..." : String(total)}
        />
        <MetricCard
          icon={<div className="p-2.5 bg-violet-50 rounded-xl"><MapPin className="w-5 h-5 text-violet-500" /></div>}
          label="Lote Atual"
          value={isLoadingHistorico ? "..." : (loteNome(atual?.idLoteAtual) ?? "—")}
          sub={atual ? `· ${grupoNome}` : undefined}
        />
        <MetricCard
          icon={<div className="p-2.5 bg-violet-50 rounded-xl"><Clock className="w-5 h-5 text-violet-500" /></div>}
          label="Entrada no Lote Atual"
          value={isLoadingHistorico ? "..." : (atual ? formatDate(atual.dtEntrada) : "—")}
          sub={atual && isAtual(atual.status, atual.dtSaida) ? "em curso" : undefined}
        />
      </div>

      {/* ── Tabela ───────────────────────────────────────────────── */}
      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-zinc-800">
            Histórico de Movimentações{grupo?.nomeGrupo ? ` · ${grupo.nomeGrupo}` : ""}
          </h2>
          <Button variant="primary" size="sm" onClick={() => setShowMover(true)}>
            <ArrowRightLeft className="w-3.5 h-3.5 mr-1.5" />
            Mover de grupo
          </Button>
        </div>

        {isLoadingHistorico ? (
          <div className="flex flex-col items-center justify-center h-52 gap-2 text-zinc-400">
            <div className="w-5 h-5 border-2 border-zinc-300 border-t-zinc-700 rounded-full animate-spin" />
            <span className="text-sm font-medium">Carregando movimentações...</span>
          </div>
        ) : (
          <DataTable
            isEmpty={movimentacoes.length === 0}
            emptyState={
              <TableEmptyState
                icon={ArrowRightLeft}
                title={isError ? "Erro ao carregar movimentações" : "Nenhuma movimentação registrada"}
                description={
                  isError
                    ? "Não foi possível buscar o histórico de movimentações. Tente novamente."
                    : "Transferências entre lotes e grupos aparecerão aqui."
                }
              />
            }
          >
            <TableHeader>
              <TableHead>Data Entrada</TableHead>
              <TableHead>Origem → Destino</TableHead>
              <TableHead>Grupo</TableHead>
              <TableHead align="right">Permanência</TableHead>
            </TableHeader>
            <TableBody>
              {paginated.map((mov) => {
                const atualRow = isAtual(mov.status, mov.dtSaida);
                return (
                  <TableRow key={mov.idMovimento}>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-zinc-600">
                        <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        {formatDate(mov.dtEntrada)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-zinc-400">{loteNome(mov.idLoteAnterior) ?? "Entrada"}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-zinc-300 shrink-0" />
                        <span className="font-semibold text-zinc-800">{loteNome(mov.idLoteAtual) ?? "—"}</span>
                        {atualRow && (
                          <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-violet-100 text-violet-700">
                            Atual
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-zinc-700">{grupoNome}</span>
                    </TableCell>
                    <TableCell align="right">
                      {atualRow ? (
                        <span className="text-xs font-medium text-violet-600">Em curso</span>
                      ) : (
                        <span className="text-sm text-zinc-500">{mov.diasPermanencia} dias</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </DataTable>
        )}

        {totalPages > 1 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            total={movimentacoes.length}
            limit={LIMIT}
            className="px-6 py-4 border-t border-zinc-100"
          />
        )}
      </div>

      {/* ── Modal de movimentação de grupo ───────────────────────── */}
      <MoverGrupoModal
        isOpen={showMover}
        onClose={() => setShowMover(false)}
        bufalo={bufalo}
        grupoAtualNome={grupoNome}
        onMoved={() => setShowMover(false)}
      />
    </div>
  );
}
