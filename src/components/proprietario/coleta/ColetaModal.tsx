"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Calendar,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Landmark,
  User,
  Phone,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { coletaService, laticinioService } from "@/services/coleta.service";
import type { Coleta, Laticinio } from "@/services/coleta.service";

// ── DetailRow ──────────────────────────────────────────────────────────────────

function DetailRow({
  icon: Icon,
  label,
  value,
  colorClass = "text-slate-500",
}: {
  icon: React.ElementType;
  label: string;
  value?: string | null;
  colorClass?: string;
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
      <div className={`p-2 bg-slate-50 rounded-full ${colorClass} shrink-0`}>
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

// ── ColetaModal ────────────────────────────────────────────────────────────────

interface ColetaModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: Coleta | null;
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return "-";
  const datePart = dateStr.split(" ")[0].split("T")[0];
  const [y, m, d] = datePart.split("-");
  return `${d}/${m}/${y}`;
}

function formatVolume(val?: string | number | null) {
  if (val === undefined || val === null) return "-";
  return `${parseFloat(String(val)).toLocaleString("pt-BR")} L`;
}

export function ColetaModal({ isOpen, onClose, data: initialData }: ColetaModalProps) {
  const t = useTranslations("Proprietario.coleta.modal");
  const [data, setData] = useState<Coleta | null>(null);
  const [laticinio, setLaticinio] = useState<Laticinio | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && initialData) {
      const fetchDetail = async () => {
        setLoading(true);
        try {
          const id = initialData.id_coleta ?? initialData.id;
          let detailed: Coleta = initialData;
          if (id) {
            detailed = await coletaService.getById(id);
          }
          setData(detailed);

          const idInd = detailed?.id_industria;
          if (idInd) {
            const latData = await laticinioService.getById(idInd);
            setLaticinio(latData);
          } else {
            setLaticinio(null);
          }
        } catch {
          setData(initialData);
        } finally {
          setLoading(false);
        }
      };
      fetchDetail();
    } else if (!isOpen) {
      setData(null);
      setLaticinio(null);
    }
  }, [isOpen, initialData]);

  const isApproved = data?.resultado_teste;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t("title")} size="md">
      {loading || !data ? (
        <div className="flex items-center justify-center gap-3 py-12">
          <div className="w-6 h-6 border-2 border-[#ffcf78] border-t-[#ce7d0a] rounded-full animate-spin" />
          <span className="text-sm text-gray-500">{t("loading")}</span>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Status banner */}
          <div
            className={`flex items-center justify-between p-4 rounded-xl border ${
              isApproved
                ? "bg-green-50 border-green-100 text-green-800"
                : "bg-red-50 border-red-100 text-red-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-full ${
                  isApproved ? "bg-green-100" : "bg-red-100"
                }`}
              >
                {isApproved ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <XCircle className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-sm">
                  {isApproved ? t("approved") : t("rejected")}
                </h3>
                <p className="text-[10px] opacity-80 uppercase font-semibold tracking-wider">
                  {t("testResult")}
                </p>
              </div>
            </div>
            <span className="text-2xl font-black">
              {formatVolume(data.quantidade)}
            </span>
          </div>

          {/* Informações */}
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="p-1">
              <DetailRow
                icon={Landmark}
                label={t("fields.industry")}
                value={laticinio?.nome ?? data.nome_empresa ?? t("fields.notInformed")}
                colorClass="text-blue-500"
              />
              {laticinio && (
                <>
                  <DetailRow
                    icon={User}
                    label={t("fields.representative")}
                    value={laticinio.representante}
                    colorClass="text-indigo-500"
                  />
                  <DetailRow
                    icon={Phone}
                    label={t("fields.contact")}
                    value={laticinio.contato}
                    colorClass="text-green-500"
                  />
                </>
              )}
              <DetailRow
                icon={Calendar}
                label={t("fields.date")}
                value={formatDate(data.dt_coleta)}
                colorClass="text-[#ce7d0a]"
              />
            </div>
          </div>

          {/* Observações */}
          <div className="bg-slate-50 border border-slate-100 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  {t("observations")}
                </h5>
                <p className="text-sm text-slate-700 leading-relaxed font-medium">
                  {data.observacao || t("noObservations")}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <Button variant="secondary" onClick={onClose}>
              {t("close")}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
