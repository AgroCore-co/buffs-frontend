"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { AlertCircle, Check, Eye, EyeOff, Filter } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { useAlertasByPropriedade, useAlertasMutations } from "@/hooks/useAlertas";
import type { Alerta, NichoAlerta, PrioridadeAlerta } from "@/services/alertas.service";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const NICHO_LABEL: Record<string, string> = {
  CLINICO: "Clínico", PRODUCAO: "Produção", REPRODUCAO: "Reprodução", SANITARIO: "Sanitário", MANEJO: "Manejo",
};

function formatDate(value?: string | null) {
  if (!value) return "—";
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.slice(0, 10));
  return m ? `${m[3]}/${m[2]}/${m[1]}` : "—";
}

function prioridadeStyle(p: string): { border: string; bg: string; badge: string } {
  if (p === "ALTA") return { border: "border-l-red-500", bg: "bg-red-50", badge: "bg-red-100 text-red-700" };
  if (p === "MEDIA") return { border: "border-l-amber-500", bg: "bg-amber-50", badge: "bg-amber-100 text-amber-700" };
  return { border: "border-l-blue-500", bg: "bg-blue-50", badge: "bg-blue-100 text-blue-700" };
}

const inputClass =
  "text-sm border border-zinc-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#ce7d0a]";

const LIMIT = 10;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  idPropriedade: string;
  nichos?: NichoAlerta[];
}

export function AlertasProducaoModal({ isOpen, onClose, idPropriedade, nichos = ["CLINICO", "PRODUCAO"] }: Props) {
  const [page, setPage] = useState(1);
  const [prioridade, setPrioridade] = useState<PrioridadeAlerta | "">("");
  const [incluirVistos, setIncluirVistos] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const { data, isLoading, isError } = useAlertasByPropriedade(
    idPropriedade,
    { nichos, incluirVistos, prioridade: prioridade || undefined, page, limit: LIMIT },
    { enabled: isOpen },
  );
  const { marcarVisto } = useAlertasMutations();

  const alertas = data?.data ?? [];
  const meta = data?.meta;
  const total = meta?.total ?? 0;
  const totalPages = meta?.totalPages ?? 1;

  const handleToggle = async (a: Alerta) => {
    setTogglingId(a.idAlerta);
    try {
      await marcarVisto({ id: a.idAlerta, status: !a.visto });
    } catch {
      toast.error("Erro ao atualizar o alerta.");
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Todos os Alertas"
      size="3xl"
      footer={
        <div className="flex justify-between items-center w-full">
          <span className="text-sm text-zinc-500">{total} alerta{total !== 1 ? "s" : ""}</span>
          <Button variant="ghost" onClick={onClose}>Fechar</Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-3 p-3 bg-zinc-50 rounded-lg border border-zinc-100">
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <Filter className="w-4 h-4 text-zinc-400" />
            <span className="font-medium">Filtros:</span>
          </div>
          <select
            value={prioridade}
            onChange={(e) => { setPrioridade(e.target.value as PrioridadeAlerta | ""); setPage(1); }}
            className={inputClass}
          >
            <option value="">Todas prioridades</option>
            <option value="ALTA">Alta</option>
            <option value="MEDIA">Média</option>
            <option value="BAIXA">Baixa</option>
          </select>
          <button
            onClick={() => { setIncluirVistos(v => !v); setPage(1); }}
            className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg border transition-colors ${
              incluirVistos ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50"
            }`}
          >
            {incluirVistos ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            {incluirVistos ? "Incluindo vistos" : "Apenas pendentes"}
          </button>
        </div>

        {/* Lista */}
        <div className="min-h-[360px] max-h-[460px] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-[300px] gap-2 text-zinc-400">
              <div className="w-5 h-5 border-2 border-zinc-300 border-t-zinc-700 rounded-full animate-spin" />
              <span className="text-sm font-medium">Carregando alertas...</span>
            </div>
          ) : alertas.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] gap-2 text-center">
              <AlertCircle className="w-8 h-8 text-zinc-200" />
              <p className="text-sm font-semibold text-zinc-400">
                {isError ? "Erro ao carregar alertas" : "Nenhum alerta encontrado"}
              </p>
              <p className="text-xs text-zinc-300">
                {isError ? "Tente novamente." : "Não há alertas com os filtros selecionados."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {alertas.map((a) => {
                const st = prioridadeStyle(a.prioridade);
                return (
                  <div key={a.idAlerta} className={`p-4 rounded-lg border-l-4 ${st.border} ${st.bg} ${a.visto ? "opacity-70" : ""}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          {!a.visto && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-500 text-white">Pendente</span>
                          )}
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${st.badge}`}>{a.prioridade}</span>
                          <span className="text-[10px] font-medium text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded">
                            {NICHO_LABEL[a.nicho] ?? a.nicho}
                          </span>
                          <span className="text-xs text-zinc-400">{formatDate(a.dataAlerta)}</span>
                          {a.visto && (
                            <span className="text-xs text-green-600 flex items-center gap-1"><Check className="w-3 h-3" /> Visto</span>
                          )}
                        </div>

                        {a.bufalo && (
                          <div className="flex items-center gap-2 mb-2 py-1.5 px-2 bg-white/70 rounded border border-zinc-100 w-fit">
                            <span className="text-xs font-bold text-zinc-800">{a.bufalo.nome}</span>
                            {a.bufalo.brinco && <span className="text-[10px] text-zinc-500">· {a.bufalo.brinco}</span>}
                          </div>
                        )}

                        <p className="text-sm font-medium text-zinc-800">{a.motivo}</p>
                        {a.observacao && <p className="text-xs text-zinc-500 italic mt-1">{a.observacao}</p>}
                        {a.tipoEventoOrigem && (
                          <p className="text-[11px] text-zinc-400 mt-1">Origem: {a.tipoEventoOrigem.replace(/_/g, " ").toLowerCase()}</p>
                        )}
                      </div>

                      <Button
                        variant={a.visto ? "ghost" : "outline"}
                        size="sm"
                        isLoading={togglingId === a.idAlerta}
                        onClick={() => handleToggle(a)}
                        className="flex-shrink-0"
                      >
                        {a.visto ? <EyeOff className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            hasPrevPage={meta?.hasPrevPage}
            hasNextPage={meta?.hasNextPage}
            total={total}
            limit={LIMIT}
            className="pt-3 border-t border-zinc-100"
          />
        )}
      </div>
    </Modal>
  );
}
