"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Activity, Calendar, CheckCircle2, Info, AlertCircle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import type { Reproducao } from "@/services/reproducao.service";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(value?: string | null) {
  if (!value) return "—";
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.slice(0, 10));
  return m ? `${m[3]}/${m[2]}/${m[1]}` : "—";
}

function statusPill(status?: string): string {
  if (status === "Confirmada") return "bg-green-100 text-green-700 border-green-200";
  if (status === "Concluída") return "bg-blue-100 text-blue-700 border-blue-200";
  if (status === "Falha") return "bg-red-100 text-red-700 border-red-200";
  return "bg-zinc-100 text-zinc-600 border-zinc-200";
}

function animalLabel(a?: { nome: string; brinco: string } | null): string {
  if (!a?.nome) return "—";
  return a.brinco ? `${a.nome} (${a.brinco})` : a.nome;
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function DetailRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-zinc-100 last:border-0">
      <div className="p-2 bg-zinc-50 rounded-full text-zinc-500 flex-shrink-0">
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">{label}</p>
        <p className="text-sm text-zinc-800 font-semibold mt-0.5">{value || "—"}</p>
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

interface Props {
  isOpen: boolean;
  onClose: () => void;
  registro: Reproducao | null;
}

export function ReproducaoDetailModal({ isOpen, onClose, registro }: Props) {
  const t = useTranslations('ReproducaoPage.modal');

  if (!registro) return null;

  const touroValue = registro.idSemen
    ? t('artificialInsemination')
    : animalLabel(registro.bufalo_idBufalo);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('title')}
      size="lg"
      footer={<Button variant="primary" onClick={onClose}>{t('close')}</Button>}
    >
      <div className="flex flex-col gap-6">
        {/* Hero */}
        <div className="flex items-center justify-between gap-3 bg-zinc-50 p-4 rounded-xl border border-zinc-100">
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-zinc-800 flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#ce7d0a] flex-shrink-0" />
              {t('reproduction', { type: registro.tipoInseminacao })}
            </h3>
            <p className="text-sm text-zinc-500 mt-1">{t('createdAt', { date: formatDate(registro.createdAt) })}</p>
          </div>
          <span className={`px-4 py-1.5 rounded-full text-sm font-bold border flex-shrink-0 ${statusPill(registro.status)}`}>
            {registro.status}
          </span>
        </div>

        {/* Grid de informações */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-bold text-zinc-900 border-b border-zinc-200 pb-2 mb-1">{t('involved')}</h4>
            <DetailRow icon={Info} label={t('matrix')} value={animalLabel(registro.bufalo_idBufala)} />
            <DetailRow icon={Info} label={registro.idSemen ? t('semen') : t('bull')} value={touroValue} />
          </div>

          <div>
            <h4 className="text-sm font-bold text-zinc-900 border-b border-zinc-200 pb-2 mb-1">{t('eventDetails')}</h4>
            <DetailRow icon={Calendar} label={t('eventDate')} value={formatDate(registro.dtEvento)} />
            <DetailRow icon={CheckCircle2} label={t('birthType')} value={registro.tipoParto ?? "—"} />
          </div>
        </div>

        {/* Ocorrência */}
        <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <h5 className="text-sm font-bold text-amber-800 mb-1">{t('occurrence')}</h5>
              <p className="text-sm text-amber-900/80 leading-relaxed">
                {registro.ocorrencia?.trim() || t('noOccurrence')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
