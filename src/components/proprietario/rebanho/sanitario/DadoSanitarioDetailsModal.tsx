"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Syringe, Pencil, Trash2, AlertCircle, Calendar,
  Clock, ChevronLeft, Flame, Link2, FlaskConical,
  CheckCircle2, XCircle, RotateCcw,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { dadosSanitariosService } from "@/services/dados-sanitarios.service";
import { useSugestoesDoencas } from "@/hooks/useDadosSanitarios";
import type { DadoSanitario, DadoSanitarioDTO } from "@/services/dados-sanitarios.service";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type View = "details" | "edit" | "confirm-delete";

type TipoTratamento = "suplementacao" | "parasita" | "doenca" | "vacina";

interface FormState {
  dtAplicacao: string;
  doenca: string;
  dosagem: string;
  unidade_medida: string;
  necessita_retorno: boolean;
  dtRetorno: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("pt-BR");
}

function toDateInput(value?: string | null): string {
  if (!value) return "";
  return value.split("T")[0].split(" ")[0];
}

function mapTipoTratamento(tipoTratamento?: string): TipoTratamento {
  const v = tipoTratamento?.toLowerCase() ?? "";
  if (v.includes("vacinação") || v.includes("vacinacao")) return "vacina";
  if (v.includes("suplementação") || v.includes("suplementacao")) return "suplementacao";
  if (v.includes("vermifugação") || v.includes("vermifugacao") || v.includes("parasita")) return "parasita";
  return "doenca";
}

const TIPO_CONFIG: Record<TipoTratamento, { color: string; bg: string; icon: React.ElementType }> = {
  suplementacao: { color: "text-blue-700",   bg: "bg-blue-100",   icon: Link2       },
  parasita:      { color: "text-orange-700", bg: "bg-orange-100", icon: Flame       },
  doenca:        { color: "text-red-700",    bg: "bg-red-100",    icon: AlertCircle },
  vacina:        { color: "text-green-700",  bg: "bg-green-100",  icon: Syringe     },
};

const UNIDADES = ["ml", "mL", "dose", "g", "mg", "comprimido", "UI", "mL/kg"];

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function InfoField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{label}</span>
      <div className="text-sm font-medium text-zinc-800">{children ?? "—"}</div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

interface Props {
  isOpen: boolean;
  onClose: () => void;
  registro: DadoSanitario | null;
  onMutated?: () => void;
}

export function DadoSanitarioDetailsModal({ isOpen, onClose, registro, onMutated }: Props) {
  const t = useTranslations("Proprietario.rebanho.bufalo.sanitario");
  const queryClient = useQueryClient();
  const [view, setView] = useState<View>("details");
  const [form, setForm] = useState<FormState>({
    dtAplicacao: "", doenca: "", dosagem: "", unidade_medida: "ml",
    necessita_retorno: false, dtRetorno: "",
  });
  const [showSugestoes, setShowSugestoes] = useState(false);
  const [termoSugestao, setTermoSugestao] = useState("");

  const { data: sugestoes = [] } = useSugestoesDoencas(
    termoSugestao.length >= 2 ? termoSugestao : undefined,
    6,
    { enabled: termoSugestao.length >= 2 && view === "edit" },
  );

  useEffect(() => {
    if (isOpen && registro) {
      setView("details");
      setTermoSugestao("");
      setShowSugestoes(false);
      setForm({
        dtAplicacao:      toDateInput(registro.dtAplicacao),
        doenca:           registro.doenca,
        dosagem:          registro.dosagem,
        unidade_medida:   registro.unidadeMedida,
        necessita_retorno: registro.necessitaRetorno,
        dtRetorno:        toDateInput(registro.dtRetorno),
      });
    }
  }, [isOpen, registro]);

  const invalidar = () => {
    queryClient.invalidateQueries({ queryKey: ["dados-sanitarios"] });
    onMutated?.();
  };

  // ── Mutações ─────────────────────────────────────────────────────────────────

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<DadoSanitarioDTO> }) =>
      dadosSanitariosService.update(id, data),
    onSuccess: () => {
      toast.success(t("modal.toast.updated"));
      invalidar();
      setView("details");
    },
    onError: () => toast.error(t("modal.toast.errorUpdate")),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => dadosSanitariosService.delete(id),
    onSuccess: () => {
      toast.success(t("modal.toast.removed"));
      invalidar();
      onClose();
    },
    onError: () => toast.error(t("modal.toast.errorRemove")),
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) => dadosSanitariosService.restore(id),
    onSuccess: () => {
      toast.success(t("modal.toast.restored"));
      invalidar();
      onClose();
    },
    onError: () => toast.error(t("modal.toast.errorRestore")),
  });

  if (!registro) return null;

  const medicacao = registro.medicacoe ?? registro.medicacoes;
  const tipo = mapTipoTratamento(medicacao?.tipoTratamento);
  const cfg = TIPO_CONFIG[tipo];
  const TipoIcon = cfg.icon;
  const isDeleted = !!registro.deletedAt;

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      id: registro.idSanit,
      data: {
        dtAplicacao:       form.dtAplicacao,
        doenca:            form.doenca,
        dosagem:           parseFloat(form.dosagem) || 0,
        unidade_medida:    form.unidade_medida,
        necessita_retorno: form.necessita_retorno,
        dtRetorno:         form.necessita_retorno ? (form.dtRetorno || null) : null,
      },
    });
  };

  const titles: Record<View, string> = {
    details:          t("modal.detailsTitle"),
    edit:             t("modal.editTitle"),
    "confirm-delete": t("modal.removeTitle"),
  };

  // ─── View: Detalhes ──────────────────────────────────────────────────────────

  const DetailsView = (
    <div className="flex flex-col gap-6">

      {/* Badges */}
      <div className="flex items-center flex-wrap gap-2">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
          <TipoIcon className="w-3.5 h-3.5" />
          {t(`tipoConfig.${tipo}`)}
        </span>
        {isDeleted && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 text-zinc-500 rounded-full text-xs font-semibold">
            <XCircle className="w-3.5 h-3.5" />
            {t("modal.status.removed")}
          </span>
        )}
      </div>

      {/* Nome da medicação em destaque */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">{t("modal.fields.medication")}</p>
        <p className="text-2xl font-bold text-zinc-900">{medicacao?.medicacao ?? "—"}</p>
        {medicacao?.descricao && (
          <p className="text-sm text-zinc-500 mt-1">{medicacao.descricao}</p>
        )}
      </div>

      {/* Grid de informações */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        <InfoField label={t("modal.fields.disease")}>
          <span className="capitalize">{registro.doenca}</span>
        </InfoField>
        <InfoField label={t("modal.fields.applicationDate")}>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
            {formatDate(registro.dtAplicacao)}
          </span>
        </InfoField>
        <InfoField label={t("modal.fields.dosage")}>
          <span className="font-mono">{registro.dosagem} {registro.unidadeMedida}</span>
        </InfoField>
        <InfoField label={t("modal.fields.treatmentType")}>
          {medicacao?.tipoTratamento ?? "—"}
        </InfoField>
      </div>

      {/* Bloco de retorno */}
      <div className={`rounded-xl p-4 border ${registro.necessitaRetorno ? "bg-amber-50 border-amber-200" : "bg-zinc-50 border-zinc-100"}`}>
        <div className="flex items-center gap-2">
          <Clock className={`w-4 h-4 ${registro.necessitaRetorno ? "text-amber-500" : "text-zinc-400"}`} />
          <span className="text-sm font-semibold text-zinc-700">{t("modal.fields.return")}</span>
          <span className={`ml-auto text-xs font-semibold px-2.5 py-0.5 rounded-full ${registro.necessitaRetorno ? "bg-amber-100 text-amber-700" : "bg-zinc-100 text-zinc-400"}`}>
            {registro.necessitaRetorno ? t("modal.returnStatus.necessary") : t("modal.returnStatus.notNecessary")}
          </span>
        </div>
        {registro.necessitaRetorno && (
          <p className={`text-sm mt-2 font-medium ${registro.dtRetorno ? "text-amber-700" : "text-amber-500"}`}>
            {registro.dtRetorno
              ? <>{t("modal.returnStatus.scheduledFor")} <strong>{formatDate(registro.dtRetorno)}</strong></>
              : t("modal.returnStatus.dateNotDefined")}
          </p>
        )}
      </div>

      {/* Observação */}
      {registro.observacao && (
        <InfoField label={t("modal.fields.observation")}>
          <span className="text-zinc-600 font-normal">{registro.observacao}</span>
        </InfoField>
      )}

      {/* Timestamps */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-3 pt-4 border-t border-zinc-100">
        <InfoField label={t("modal.fields.createdAt")}>{formatDate(registro.createdAt)}</InfoField>
        <InfoField label={t("modal.fields.updatedAt")}>{formatDate(registro.updatedAt)}</InfoField>
        {isDeleted && (
          <InfoField label={t("modal.fields.removedAt")}>
            <span className="text-red-500">{formatDate(registro.deletedAt)}</span>
          </InfoField>
        )}
      </div>

      {/* Ações */}
      <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
        {isDeleted ? (
          <Button
            variant="outline"
            size="sm"
            isLoading={restoreMutation.isPending}
            onClick={() => restoreMutation.mutate(registro.idSanit)}
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            {t("modal.actions.restore")}
          </Button>
        ) : (
          <>
            <Button variant="danger" size="sm" onClick={() => setView("confirm-delete")}>
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              {t("modal.actions.remove")}
            </Button>
            <Button variant="primary" size="sm" onClick={() => setView("edit")}>
              <Pencil className="w-3.5 h-3.5 mr-1.5" />
              {t("modal.actions.edit")}
            </Button>
          </>
        )}
      </div>
    </div>
  );

  // ─── View: Editar ────────────────────────────────────────────────────────────

  const EditView = (
    <form onSubmit={handleEdit} className="flex flex-col gap-5">
      <button
        type="button"
        onClick={() => setView("details")}
        className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-700 transition-colors w-fit"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
        {t("modal.actions.backToDetails")}
      </button>

      <div className="grid grid-cols-2 gap-4">

        {/* Data de aplicação */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-700">{t("modal.fields.applicationDate")}</label>
          <input
            type="date"
            required
            value={form.dtAplicacao}
            onChange={e => setForm(f => ({ ...f, dtAplicacao: e.target.value }))}
            className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#ce7d0a] focus:border-transparent"
          />
        </div>

        {/* Dosagem */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-700">{t("modal.fields.dosage")}</label>
          <input
            type="number"
            required
            step="0.01"
            min="0"
            value={form.dosagem}
            onChange={e => setForm(f => ({ ...f, dosagem: e.target.value }))}
            className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#ce7d0a] focus:border-transparent"
          />
        </div>

        {/* Unidade de medida */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-700">{t("modal.fields.unit")}</label>
          <select
            value={form.unidade_medida}
            onChange={e => setForm(f => ({ ...f, unidade_medida: e.target.value }))}
            className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#ce7d0a] focus:border-transparent"
          >
            {UNIDADES.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>

        {/* Doença com autocomplete */}
        <div className="space-y-1.5 relative">
          <label className="text-sm font-medium text-zinc-700">{t("modal.fields.disease")}</label>
          <input
            type="text"
            required
            autoComplete="off"
            value={form.doenca}
            onChange={e => {
              setForm(f => ({ ...f, doenca: e.target.value }));
              setTermoSugestao(e.target.value);
              setShowSugestoes(true);
            }}
            onFocus={() => { setTermoSugestao(form.doenca); setShowSugestoes(true); }}
            onBlur={() => setTimeout(() => setShowSugestoes(false), 150)}
            className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#ce7d0a] focus:border-transparent"
          />
          {showSugestoes && sugestoes.length > 0 && (
            <div className="absolute z-20 w-full bg-white border border-zinc-200 rounded-lg shadow-lg overflow-hidden top-[calc(100%+2px)]">
              {sugestoes.map(s => (
                <button
                  key={s}
                  type="button"
                  onMouseDown={() => {
                    setForm(f => ({ ...f, doenca: s }));
                    setShowSugestoes(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 capitalize transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Toggle retorno */}
      <div className="flex items-center gap-3">
        <label className="relative inline-flex items-center cursor-pointer select-none">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={form.necessita_retorno}
            onChange={e => setForm(f => ({ ...f, necessita_retorno: e.target.checked }))}
          />
          <div className="w-10 h-6 bg-zinc-200 rounded-full peer peer-checked:bg-[#ce7d0a] transition-colors duration-200 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:duration-200 peer-checked:after:translate-x-4" />
        </label>
        <span className="text-sm font-medium text-zinc-700">{t("modal.fields.needsReturn")}</span>
      </div>

      {/* Data de retorno */}
      {form.necessita_retorno && (
        <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
          <label className="text-sm font-medium text-zinc-700">{t("modal.fields.returnDate")}</label>
          <input
            type="date"
            min={form.dtAplicacao}
            value={form.dtRetorno}
            onChange={e => setForm(f => ({ ...f, dtRetorno: e.target.value }))}
            className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#ce7d0a] focus:border-transparent"
          />
        </div>
      )}

      <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-100">
        <Button type="button" variant="outline" onClick={() => setView("details")} disabled={updateMutation.isPending}>
          {t("modal.actions.cancel")}
        </Button>
        <Button type="submit" variant="primary" isLoading={updateMutation.isPending}>
          {t("modal.actions.saveChanges")}
        </Button>
      </div>
    </form>
  );

  // ─── View: Confirmar exclusão ─────────────────────────────────────────────────

  const ConfirmDeleteView = (
    <div className="flex flex-col items-center text-center gap-5 py-2">
      <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
        <Trash2 className="w-6 h-6 text-red-600" />
      </div>
      <div className="space-y-2">
        <h3 className="text-base font-semibold text-zinc-900">{t("modal.confirmRemove.title")}</h3>
        <p className="text-sm text-zinc-500 leading-relaxed">
          {t("modal.confirmRemove.description", {
            medication: medicacao?.medicacao ?? registro.doenca,
            date: formatDate(registro.dtAplicacao),
          })}
        </p>
      </div>
      <div className="flex gap-3 w-full">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => setView("details")}
          disabled={deleteMutation.isPending}
        >
          {t("modal.actions.cancel")}
        </Button>
        <Button
          variant="danger"
          className="flex-1"
          isLoading={deleteMutation.isPending}
          onClick={() => deleteMutation.mutate(registro.idSanit)}
        >
          <Trash2 className="w-3.5 h-3.5 mr-1.5" />
          {t("modal.actions.yesRemove")}
        </Button>
      </div>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={titles[view]} size="lg">
      {view === "details"        && DetailsView}
      {view === "edit"           && EditView}
      {view === "confirm-delete" && ConfirmDeleteView}
    </Modal>
  );
}
