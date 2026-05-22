"use client";

import React, { useState } from "react";
import {
  MessageSquare, AlertTriangle, Wrench, StickyNote,
  CalendarDays, User, Bell,
} from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";
import { Bufalo } from "@/services/bufalos.service";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type TipoEvento = "observacao" | "alerta" | "procedimento" | "nota";

interface Evento {
  id: string;
  data: string;
  tipo: TipoEvento;
  titulo: string;
  descricao: string;
  responsavel: string;
}

// ─── Mock ─────────────────────────────────────────────────────────────────────

const MOCK: Evento[] = [
  { id: "1",  data: "2025-11-10", tipo: "observacao",   titulo: "Comportamento alterado",      descricao: "Animal apresentou agitação durante a ordenha. Observar nos próximos dias.",                 responsavel: "João Silva"    },
  { id: "2",  data: "2025-10-22", tipo: "procedimento", titulo: "Casqueamento realizado",       descricao: "Casqueamento preventivo realizado com sucesso.",                                              responsavel: "Dr. Carlos"    },
  { id: "3",  data: "2025-09-15", tipo: "alerta",       titulo: "Queda de produção",            descricao: "Produção leiteira 20% abaixo da média do lote nos últimos 5 dias.",                         responsavel: "Sistema"       },
  { id: "4",  data: "2025-08-03", tipo: "nota",         titulo: "Transferência de lote",        descricao: "Animal transferido para lote de gestantes conforme protocolo reprodutivo.",                   responsavel: "Maria Oliveira"},
  { id: "5",  data: "2025-07-20", tipo: "observacao",   titulo: "Boa adaptação ao grupo",      descricao: "Animal demonstrou boa adaptação ao novo grupo sem sinais de estresse.",                       responsavel: "João Silva"    },
  { id: "6",  data: "2025-06-12", tipo: "alerta",       titulo: "Cio detectado",               descricao: "Cio detectado às 06:30. Inseminação programada para o dia seguinte.",                        responsavel: "Sistema"       },
  { id: "7",  data: "2025-05-08", tipo: "procedimento", titulo: "Vacinação realizada",         descricao: "Vacinação antiaftosa semestral aplicada conforme calendário sanitário.",                      responsavel: "Dr. Carlos"    },
  { id: "8",  data: "2025-04-01", tipo: "nota",         titulo: "Observação pós-parto",        descricao: "Animal em boa condição. Cria saudável. Iniciado protocolo de cuidados pós-parto.",            responsavel: "Maria Oliveira"},
  { id: "9",  data: "2025-03-15", tipo: "observacao",   titulo: "Aumento de apetite",          descricao: "Animal consumindo 15% acima do habitual. Verificar status reprodutivo.",                      responsavel: "João Silva"    },
  { id: "10", data: "2025-02-20", tipo: "alerta",       titulo: "Perda de peso acentuada",     descricao: "Perda de 18 kg em relação ao mês anterior. Investigar causa.",                               responsavel: "Sistema"       },
];

// ─── Config de tipos ──────────────────────────────────────────────────────────

const TIPO_CONFIG: Record<TipoEvento, {
  icon: React.ReactNode;
  label: string;
  dot: string;
  bg: string;
  text: string;
  border: string;
}> = {
  observacao:   { icon: <MessageSquare className="w-4 h-4" />, label: "Observação",   dot: "bg-blue-400",   bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200"   },
  alerta:       { icon: <AlertTriangle  className="w-4 h-4" />, label: "Alerta",       dot: "bg-amber-400",  bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200"  },
  procedimento: { icon: <Wrench         className="w-4 h-4" />, label: "Procedimento", dot: "bg-purple-400", bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  nota:         { icon: <StickyNote     className="w-4 h-4" />, label: "Nota",         dot: "bg-zinc-400",   bg: "bg-zinc-50",   text: "text-zinc-700",   border: "border-zinc-200"   },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(v: string) {
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("pt-BR");
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

function EventoCard({ evento }: { evento: Evento }) {
  const cfg = TIPO_CONFIG[evento.tipo];
  return (
    <div className="flex gap-4 group">
      {/* Linha do tempo */}
      <div className="flex flex-col items-center">
        <div className={`w-3 h-3 rounded-full mt-1.5 shrink-0 ${cfg.dot}`} />
        <div className="w-px flex-1 bg-zinc-100 mt-1.5" />
      </div>

      {/* Conteúdo */}
      <div className="pb-5 flex-1 min-w-0">
        <div className="bg-white border border-zinc-200 rounded-xl p-4 group-hover:border-zinc-300 transition-colors">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                {cfg.icon}
                {cfg.label}
              </span>
              <span className="text-sm font-semibold text-zinc-800">{evento.titulo}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 shrink-0">
              <CalendarDays className="w-3.5 h-3.5" />
              {formatDate(evento.data)}
            </div>
          </div>
          <p className="text-sm text-zinc-500 mt-2 leading-relaxed">{evento.descricao}</p>
          <div className="flex items-center gap-1.5 mt-2.5 text-xs text-zinc-400">
            <User className="w-3 h-3" />
            {evento.responsavel}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

const LIMIT = 6;

export function EventosTab({ bufalo: _bufalo }: { bufalo: Bufalo }) {
  const [page, setPage] = useState(1);

  const total      = MOCK.length;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));
  const paginated  = MOCK.slice((page - 1) * LIMIT, page * LIMIT);
  const ultimo     = MOCK[0];

  const alertas = MOCK.filter(e => e.tipo === "alerta").length;

  return (
    <div className="animate-in fade-in duration-300 flex flex-col gap-5">

      {/* ── Métricas ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          icon={<div className="p-2.5 bg-amber-50 rounded-xl"><Bell className="w-5 h-5 text-amber-500" /></div>}
          label="Total de Eventos"
          value={String(total)}
        />
        <MetricCard
          icon={<div className="p-2.5 bg-amber-50 rounded-xl"><CalendarDays className="w-5 h-5 text-amber-500" /></div>}
          label="Último Evento"
          value={ultimo ? formatDate(ultimo.data) : "—"}
        />
        <MetricCard
          icon={<div className="p-2.5 bg-amber-50 rounded-xl"><AlertTriangle className="w-5 h-5 text-amber-500" /></div>}
          label="Alertas Registrados"
          value={String(alertas)}
        />
      </div>

      {/* ── Timeline ─────────────────────────────────────────────── */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-5">
        <h2 className="text-sm font-bold text-zinc-800 mb-5">Linha do Tempo</h2>

        {MOCK.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <MessageSquare className="w-8 h-8 text-zinc-200" />
            <p className="text-sm font-semibold text-zinc-400">Nenhum evento registrado</p>
            <p className="text-xs text-zinc-300">Observações e ocorrências do animal aparecerão aqui</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {paginated.map((evento) => (
              <EventoCard key={evento.id} evento={evento} />
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
