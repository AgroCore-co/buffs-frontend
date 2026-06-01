"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Building2,
  User,
  Phone,
  FileText,
  Calendar,
  Info,
  Edit2,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useDeleteLaticinio } from "@/hooks/useColeta";
import type { Laticinio } from "@/services/coleta.service";

// ── DetailRow ──────────────────────────────────────────────────────────────────

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value?: string | null;
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
      <div className="p-2 bg-slate-50 rounded-full text-slate-500 shrink-0">
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">
          {label}
        </p>
        <p className="text-sm text-slate-800 font-semibold mt-0.5">
          {value || "-"}
        </p>
      </div>
    </div>
  );
}

// ── IndustriaDetalheModal ──────────────────────────────────────────────────────

interface IndustriaDetalheModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: Laticinio | null;
  onEdit: (industria: Laticinio) => void;
  idPropriedade?: string;
}

export function IndustriaDetalheModal({
  isOpen,
  onClose,
  data,
  onEdit,
  idPropriedade,
}: IndustriaDetalheModalProps) {
  const t = useTranslations("Proprietario.industria.detalheModal");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const deleteMutation = useDeleteLaticinio(idPropriedade);

  if (!data) return null;

  const formatDate = (d?: string) => {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("pt-BR");
  };

  const handleDelete = () => {
    const id = data.id_industria ?? data.id!;
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success(t("toast.deleteSuccess"));
        setConfirmDelete(false);
        onClose();
      },
      onError: () => toast.error(t("toast.deleteError")),
    });
  };

  // ── confirmação de exclusão ──
  if (confirmDelete) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={() => setConfirmDelete(false)}
        title={t("confirmDelete.title")}
        size="md"
      >
        <div className="flex flex-col gap-6 pt-2">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
              <AlertTriangle className="text-red-500" size={32} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">
                {t("confirmDelete.heading")}
              </h3>
              <p className="text-sm text-gray-500 max-w-xs mx-auto">
                {t("confirmDelete.description")}
              </p>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-400 rounded-l-xl" />
            <div className="flex items-start gap-4 ml-2">
              <div className="p-2.5 bg-white rounded-lg shadow-sm text-gray-600">
                <Building2 size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-gray-800 text-sm truncate">
                  {data.nome}
                </h4>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <User size={12} className="shrink-0" />
                    <span>{data.representante || t("noRepresentative")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Phone size={12} className="shrink-0" />
                    <span>{data.contato || t("noContact")}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="secondary"
              onClick={() => setConfirmDelete(false)}
              disabled={deleteMutation.isPending}
            >
              {t("confirmDelete.cancel")}
            </Button>
            <Button
              variant="danger"
              isLoading={deleteMutation.isPending}
              onClick={handleDelete}
              className="flex items-center justify-center gap-2"
            >
              <Trash2 size={15} /> {t("confirmDelete.confirm")}
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("title")}
      size="lg"
    >
      <div className="space-y-5">
        {/* Hero */}
        <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div className="p-2.5 bg-[#ffcf78]/20 rounded-full">
            <Building2 className="w-5 h-5 text-[#ce7d0a]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">{data.nome}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{t("tagline")}</p>
          </div>
        </div>

        {/* Grid de infos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <h4 className="text-xs font-bold text-slate-900 border-b border-slate-200 pb-2 mb-2 uppercase tracking-wide">
              {t("contactInfo")}
            </h4>
            <DetailRow icon={User} label={t("fields.representative")} value={data.representante} />
            <DetailRow icon={Phone} label={t("fields.contact")} value={data.contato} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 border-b border-slate-200 pb-2 mb-2 uppercase tracking-wide">
              {t("administrative")}
            </h4>
            <DetailRow
              icon={Calendar}
              label={t("fields.registeredAt")}
              value={formatDate(data.created_at ?? data.createdAt)}
            />
            <DetailRow
              icon={Info}
              label={t("fields.id")}
              value={data.id_industria ?? data.id}
            />
          </div>
        </div>

        {/* Observações */}
        <div className="bg-[#ffcf78]/10 border border-[#ffcf78]/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <FileText className="w-4 h-4 text-[#ce7d0a] mt-0.5 shrink-0" />
            <div>
              <h5 className="text-[10px] font-bold text-[#ce7d0a] mb-1 uppercase tracking-wider">
                {t("observations")}
              </h5>
              <p className="text-sm text-[#43310b]/80 leading-relaxed font-medium">
                {data.observacao || t("noObservations")}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row justify-between gap-3 pt-2 border-t border-slate-100">
          <Button
            variant="ghost"
            onClick={() => setConfirmDelete(true)}
            className="text-red-500 hover:text-red-600 hover:bg-red-50 flex items-center gap-2"
          >
            <Trash2 size={15} /> {t("actions.remove")}
          </Button>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={onClose}>
              {t("actions.close")}
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                onEdit(data);
                onClose();
              }}
              className="flex items-center gap-2 font-bold"
            >
              <Edit2 size={15} /> {t("actions.edit")}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
