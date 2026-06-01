"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { Activity } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useReproducaoMutations } from "@/hooks/useReproducao";
import { useBufalosbyPropriedade } from "@/hooks/useBufalos";
import { useMaterialGeneticoByPropriedade } from "@/hooks/useMaterialGenetico";
import {
  TIPO_INSEMINACAO_OPTIONS,
  STATUS_REPRODUCAO_OPTIONS,
  type Reproducao,
  type TipoInseminacao,
  type StatusReproducao,
} from "@/services/reproducao.service";

const inputClass =
  "w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#ce7d0a] focus:border-transparent";

interface FormState {
  idBufala: string;
  tipoInseminacao: TipoInseminacao;
  idSemen: string;
  idBufalo: string;
  dtEvento: string;
  status: StatusReproducao;
}

const DEFAULT_FORM: FormState = {
  idBufala: "",
  tipoInseminacao: "IA",
  idSemen: "",
  idBufalo: "",
  dtEvento: "",
  status: "Em andamento",
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  idPropriedade: string;
  registro?: Reproducao | null;
  onSaved?: () => void;
}

export function CoberturaFormModal({
  isOpen,
  onClose,
  idPropriedade,
  registro,
  onSaved,
}: Props) {
  const t = useTranslations("ReproducaoPage.formModal");
  const isEdit = !!registro;

  const { createReproducao, isCreating, updateReproducao, isUpdating } = useReproducaoMutations();
  const isSaving = isCreating || isUpdating;

  // Dados pré-carregados ao montar o componente (não depende de isOpen)
  const { data: bufalosData } = useBufalosbyPropriedade(idPropriedade, 1, 100);
  const { data: materialData } = useMaterialGeneticoByPropriedade(
    idPropriedade,
    { page: 1, limit: 100 },
  );

  const [form, setForm] = useState<FormState>(DEFAULT_FORM);

  const allBufalos = bufalosData?.data ?? [];
  const femeas = allBufalos.filter((b) => b.sexo === "F");
  const machos = allBufalos.filter((b) => b.sexo === "M");
  const materiais = materialData?.data ?? [];

  const materiaisFiltrados = materiais.filter(
    (m) => m.tipo === (form.tipoInseminacao === "TE" ? "Embrião" : "Sêmen"),
  );

  // Redefine form quando abre ou troca de registro
  useEffect(() => {
    if (isOpen) {
      if (registro) {
        setForm({
          idBufala: registro.idBufala ?? "",
          tipoInseminacao: (registro.tipoInseminacao as TipoInseminacao) ?? "IA",
          idSemen: registro.idSemen ?? "",
          idBufalo: registro.idBufalo ?? "",
          dtEvento: registro.dtEvento ? registro.dtEvento.slice(0, 10) : "",
          status: (registro.status as StatusReproducao) ?? "Em andamento",
        });
      } else {
        setForm(DEFAULT_FORM);
      }
    }
  }, [isOpen, registro]);

  const handleTipoChange = (tipo: TipoInseminacao) => {
    setForm((f) => ({ ...f, tipoInseminacao: tipo, idSemen: "", idBufalo: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        idPropriedade,
        idBufala: form.idBufala,
        tipoInseminacao: form.tipoInseminacao,
        dtEvento: new Date(form.dtEvento).toISOString(),
        status: form.status,
        ...(showMaterial && form.idSemen
          ? { idSemen: form.idSemen }
          : {}),
        ...(form.tipoInseminacao === "Monta Natural" && form.idBufalo
          ? { idBufalo: form.idBufalo }
          : {}),
      };

      if (isEdit && registro) {
        await updateReproducao({ id: registro.idReproducao, data: payload });
        toast.success(t("toast.updated"));
      } else {
        await createReproducao(payload);
        toast.success(t("toast.created"));
      }

      onSaved?.();
      onClose();
    } catch (err) {
      const apiMessage =
        isAxiosError(err) && typeof err.response?.data?.message === "string"
          ? err.response.data.message
          : null;
      toast.error(apiMessage ?? (isEdit ? t("toast.errorUpdate") : t("toast.errorCreate")));
    }
  };

  const showMaterial = form.tipoInseminacao === "IA" || form.tipoInseminacao === "IATF" || form.tipoInseminacao === "TE";
  const showMacho = form.tipoInseminacao === "Monta Natural";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? t("editTitle") : t("createTitle")}
      size="md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Fêmea receptora */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-700">{t("fields.femea")}</label>
          <select
            required
            value={form.idBufala}
            onChange={(e) => setForm((f) => ({ ...f, idBufala: e.target.value }))}
            className={inputClass}
          >
            <option value="">{t("fields.femeaPlaceholder")}</option>
            {femeas.map((b) => (
              <option key={b.idBufalo} value={b.idBufalo}>
                {b.nome} {b.brinco ? `(${b.brinco})` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Tipo de inseminação */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-700">{t("fields.tipo")}</label>
          <select
            required
            value={form.tipoInseminacao}
            onChange={(e) => handleTipoChange(e.target.value as TipoInseminacao)}
            className={inputClass}
          >
            {TIPO_INSEMINACAO_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-zinc-400">{t(`fields.tipoDesc.${form.tipoInseminacao.replace(" ", "_")}`)}</p>
        </div>

        {/* Material genético (IA, IATF, TE) */}
        {showMaterial && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700">
              {form.tipoInseminacao === "TE" ? t("fields.embriao") : t("fields.semen")}
            </label>
            <select
              required
              value={form.idSemen}
              onChange={(e) => setForm((f) => ({ ...f, idSemen: e.target.value }))}
              className={inputClass}
            >
              <option value="">{t("fields.semenPlaceholder")}</option>
              {materiaisFiltrados.map((m) => (
                <option key={m.idMaterial} value={m.idMaterial}>
                  {m.tipo} —{" "}
                  {m.dataColeta
                    ? new Date(m.dataColeta).toLocaleDateString("pt-BR")
                    : "sem data"}
                  {m.fornecedor ? ` (${m.fornecedor})` : ""}
                </option>
              ))}
            </select>
            {materiaisFiltrados.length === 0 && (
              <p className="text-[11px] text-amber-600">{t("fields.semenEmpty")}</p>
            )}
          </div>
        )}

        {/* Touro reprodutor (Monta Natural) */}
        {showMacho && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700">{t("fields.macho")}</label>
            <select
              required
              value={form.idBufalo}
              onChange={(e) => setForm((f) => ({ ...f, idBufalo: e.target.value }))}
              className={inputClass}
            >
              <option value="">{t("fields.machoPlaceholder")}</option>
              {machos.map((b) => (
                <option key={b.idBufalo} value={b.idBufalo}>
                  {b.nome} {b.brinco ? `(${b.brinco})` : ""}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Data do evento */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-700">{t("fields.dtEvento")}</label>
          <input
            type="date"
            required
            max={new Date().toISOString().slice(0, 10)}
            value={form.dtEvento}
            onChange={(e) => setForm((f) => ({ ...f, dtEvento: e.target.value }))}
            className={inputClass}
          />
        </div>

        {/* Status */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-700">
            {t("fields.status")}{" "}
            <span className="text-zinc-400 font-normal">{t("fields.optional")}</span>
          </label>
          <select
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as StatusReproducao }))}
            className={inputClass}
          >
            {STATUS_REPRODUCAO_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
            {t("actions.cancel")}
          </Button>
          <Button type="submit" variant="primary" isLoading={isSaving}>
            <Activity className="w-3.5 h-3.5 mr-1.5" />
            {isEdit ? t("actions.save") : t("actions.create")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
