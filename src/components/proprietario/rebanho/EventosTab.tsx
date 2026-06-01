"use client";

import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle, Bell, CalendarDays, Check, Stethoscope,
  Syringe, HeartPulse, Tractor, Milk, Eye,
} from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";
import { Button } from "@/components/ui/Button";
import { Bufalo } from "@/services/bufalos.service";
import { useAlertasByPropriedade, useAlertasMutations } from "@/hooks/useAlertas";
import type { Alerta, NichoAlerta, PrioridadeAlerta } from "@/services/alertas.service";

// ─── Config de nicho e prioridade ───────────────────────────────────────────────

const NICHO_CONFIG: Record<NichoAlerta, { icon: React.ReactNode; label: string; dot: string }> = {
  CLINICO:    { icon: <Stethoscope className="w-4 h-4" />, label: "Clínico",    dot: "bg-red-400"     },
  SANITARIO:  { icon: <Syringe     className="w-4 h-4" />, label: "Sanitário",  dot: "bg-blue-400"    },
  REPRODUCAO: { icon: <HeartPulse  className="w-4 h-4" />, label: "Reprodução", dot: "bg-pink-400"    },
  MANEJO:     { icon: <Tractor     className="w-4 h-4" />, label: "Manejo",     dot: "bg-violet-400"  },
  PRODUCAO:   { icon: <Milk        className="w-4 h-4" />, label: "Produção",   dot: "bg-emerald-400" },
};

const PRIORIDADE_CONFIG: Record<PrioridadeAlerta, { label: string; bg: string; text: string; border: string }> = {
  ALTA:  { label: "Alta",  bg: "bg-red-50",   text: "text-red-700",   border: "border-red-200"   },
  MEDIA: { label: "Média", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  BAIXA: { label: "Baixa", bg: "bg-zinc-50",  text: "text-zinc-600",  border: "border-zinc-200"  },
};

function nichoCfg(nicho: NichoAlerta) {
  return NICHO_CONFIG[nicho] ?? { icon: <Bell className="w-4 h-4" />, label: nicho, dot: "bg-zinc-400" };
}

function prioridadeCfg(p: PrioridadeAlerta) {
  return PRIORIDADE_CONFIG[p] ?? PRIORIDADE_CONFIG.BAIXA;
}

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

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function MetricCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-4 bg-white border border-zinc-200 rounded-xl p-5">
      <div className="flex-shrink-0">{icon}</div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{label}</p>
        <p className="text-lg font-bold text-zinc-800 leading-tight">{value}</p>
      </div>
    </div>
  );
}

function AlertaCard({
  alerta, onToggleVisto, isToggling,
}: { alerta: Alerta; onToggleVisto: (a: Alerta) => void; isToggling: boolean }) {
  const cfg = nichoCfg(alerta.nicho);
  const prio = prioridadeCfg(alerta.prioridade);

  return (
    <div className="flex gap-4 group">
      {/* Linha do tempo */}
      <div className="flex flex-col items-center">
        <div className={`w-3 h-3 rounded-full mt-1.5 shrink-0 ${cfg.dot}`} />
        <div className="w-px flex-1 bg-zinc-100 mt-1.5" />
      </div>

      {/* Conteúdo */}
      <div className="pb-5 flex-1 min-w-0">
        <div className={`bg-white border rounded-xl p-4 transition-colors ${alerta.visto ? "border-zinc-200" : "border-amber-200 bg-amber-50/30"}`}>
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg border border-zinc-200 bg-zinc-50 text-[10px] font-bold uppercase tracking-wider text-zinc-600">
                {cfg.icon}
                {cfg.label}
              </span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider ${prio.bg} ${prio.text} ${prio.border}`}>
                {prio.label}
              </span>
              {!alerta.visto && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Novo
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 shrink-0">
              <CalendarDays className="w-3.5 h-3.5" />
              {formatDate(alerta.dataAlerta)}
            </div>
          </div>

          <p className="text-sm font-semibold text-zinc-800 mt-2">{alerta.motivo}</p>
          {alerta.observacao && (
            <p className="text-sm text-zinc-500 mt-1 leading-relaxed">{alerta.observacao}</p>
          )}

          <div className="flex items-center justify-between gap-2 mt-3 flex-wrap">
            <div className="flex items-center gap-3 text-xs text-zinc-400">
              {alerta.tipoEventoOrigem && (
                <span className="inline-flex items-center gap-1">
                  <Bell className="w-3 h-3" />
                  {alerta.tipoEventoOrigem.replace(/_/g, " ").toLowerCase()}
                </span>
              )}
              {alerta.localizacao && <span>· {alerta.localizacao}</span>}
            </div>

            <Button
              variant={alerta.visto ? "ghost" : "outline"}
              size="sm"
              isLoading={isToggling}
              onClick={() => onToggleVisto(alerta)}
              className={alerta.visto ? "text-zinc-400 hover:text-zinc-700" : ""}
            >
              {alerta.visto ? (
                <><Eye className="w-3.5 h-3.5 mr-1.5" /> Marcar como não visto</>
              ) : (
                <><Check className="w-3.5 h-3.5 mr-1.5" /> Marcar como visto</>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

const LIMIT = 6;
// Janela ampla o suficiente para reunir os alertas do animal (a API não filtra por animal).
const FETCH_LIMIT = 200;

export function EventosTab({ bufalo }: { bufalo: Bufalo }) {
  const [page, setPage] = useState(1);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const { data, isLoading, isError } = useAlertasByPropriedade(bufalo.idPropriedade, {
    incluirVistos: true,
    limit: FETCH_LIMIT,
  });
  const { marcarVisto } = useAlertasMutations();

  // A API não tem filtro por animal — filtramos no cliente e ordenamos por data desc.
  const alertasAnimal = useMemo(() => {
    const todos = data?.data ?? [];
    return todos
      .filter(a => a.animalId === bufalo.idBufalo)
      .sort((a, b) => (b.dataAlerta ?? "").localeCompare(a.dataAlerta ?? ""));
  }, [data, bufalo.idBufalo]);

  const total      = alertasAnimal.length;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));
  const paginated  = alertasAnimal.slice((page - 1) * LIMIT, page * LIMIT);

  const naoVistos  = alertasAnimal.filter(a => !a.visto).length;
  const ultimo     = alertasAnimal[0];

  const handleToggleVisto = async (alerta: Alerta) => {
    setTogglingId(alerta.idAlerta);
    try {
      await marcarVisto({ id: alerta.idAlerta, status: !alerta.visto });
    } catch {
      toast.error("Erro ao atualizar o alerta.");
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="animate-in fade-in duration-300 flex flex-col gap-5">

      {/* ── Métricas ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          icon={<div className="p-2.5 bg-amber-50 rounded-xl"><Bell className="w-5 h-5 text-amber-500" /></div>}
          label="Total de Alertas"
          value={isLoading ? "..." : String(total)}
        />
        <MetricCard
          icon={<div className="p-2.5 bg-amber-50 rounded-xl"><AlertTriangle className="w-5 h-5 text-amber-500" /></div>}
          label="Pendentes (não vistos)"
          value={isLoading ? "..." : String(naoVistos)}
        />
        <MetricCard
          icon={<div className="p-2.5 bg-amber-50 rounded-xl"><CalendarDays className="w-5 h-5 text-amber-500" /></div>}
          label="Último Alerta"
          value={isLoading ? "..." : (ultimo ? formatDate(ultimo.dataAlerta) : "—")}
        />
      </div>

      {/* ── Timeline ─────────────────────────────────────────────── */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-5">
        <h2 className="text-sm font-bold text-zinc-800 mb-5">Alertas do Animal</h2>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2 text-zinc-400">
            <div className="w-5 h-5 border-2 border-zinc-300 border-t-zinc-700 rounded-full animate-spin" />
            <span className="text-sm font-medium">Carregando alertas...</span>
          </div>
        ) : total === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <Bell className="w-8 h-8 text-zinc-200" />
            <p className="text-sm font-semibold text-zinc-400">
              {isError ? "Erro ao carregar alertas" : "Nenhum alerta para este animal"}
            </p>
            <p className="text-xs text-zinc-300">
              {isError
                ? "Não foi possível buscar os alertas. Tente novamente."
                : "Alertas operacionais e clínicos deste búfalo aparecerão aqui."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {paginated.map((alerta) => (
              <AlertaCard
                key={alerta.idAlerta}
                alerta={alerta}
                onToggleVisto={handleToggleVisto}
                isToggling={togglingId === alerta.idAlerta}
              />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            total={total}
            limit={LIMIT}
            className="pt-2 border-t border-zinc-100"
          />
        )}
      </div>
    </div>
  );
}
