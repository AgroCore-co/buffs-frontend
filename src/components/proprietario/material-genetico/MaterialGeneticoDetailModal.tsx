"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { FlaskConical, Calendar, Building2, Info, User } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import type { MaterialGenetico } from "@/services/material-genetico.service";

function formatDate(value?: string | null) {
  if (!value) return "—";
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.slice(0, 10));
  return m ? `${m[3]}/${m[2]}/${m[1]}` : "—";
}

function tipoBadge(tipo?: string | null): string {
  if (tipo === "Sêmen") return "bg-blue-100 text-blue-700 border-blue-200";
  if (tipo === "Embrião") return "bg-purple-100 text-purple-700 border-purple-200";
  if (tipo === "Óvulo") return "bg-pink-100 text-pink-700 border-pink-200";
  return "bg-zinc-100 text-zinc-600 border-zinc-200";
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
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

interface Props {
  isOpen: boolean;
  onClose: () => void;
  registro: MaterialGenetico | null;
}

export function MaterialGeneticoDetailModal({ isOpen, onClose, registro }: Props) {
  const t = useTranslations("MaterialGeneticoPage.modal");

  if (!registro) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("title")}
      size="lg"
      footer={
        <Button variant="primary" onClick={onClose}>
          {t("close")}
        </Button>
      }
    >
      <div className="flex flex-col gap-6">
        {/* Hero */}
        <div className="flex items-center justify-between gap-3 bg-zinc-50 p-4 rounded-xl border border-zinc-100">
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-zinc-800 flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-[#ce7d0a] flex-shrink-0" />
              {t("material", { tipo: registro.tipo ?? "—" })}
            </h3>
            <p className="text-sm text-zinc-500 mt-1">
              {t("createdAt", { date: formatDate(registro.createdAt) })}
            </p>
          </div>
          <span
            className={`px-4 py-1.5 rounded-full text-sm font-bold border flex-shrink-0 ${tipoBadge(registro.tipo)}`}
          >
            {registro.tipo ?? "—"}
          </span>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-bold text-zinc-900 border-b border-zinc-200 pb-2 mb-1">
              {t("originSection")}
            </h4>
            <DetailRow icon={Info} label={t("origem")} value={registro.origem ?? "—"} />
            {registro.origem === "Coleta Própria" ? (
              <DetailRow
                icon={User}
                label={t("bufaloOrigem")}
                value={registro.idBufaloOrigem ?? "—"}
              />
            ) : (
              <DetailRow
                icon={Building2}
                label={t("fornecedor")}
                value={registro.fornecedor ?? "—"}
              />
            )}
          </div>

          <div>
            <h4 className="text-sm font-bold text-zinc-900 border-b border-zinc-200 pb-2 mb-1">
              {t("detailsSection")}
            </h4>
            <DetailRow icon={Calendar} label={t("dataColeta")} value={formatDate(registro.dataColeta)} />
            <DetailRow
              icon={Info}
              label={t("status")}
              value={registro.deletedAt ? t("inactive") : t("active")}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}
