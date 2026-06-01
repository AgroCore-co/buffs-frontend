"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { FlaskConical } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useMaterialGenetico } from "@/hooks/useMaterialGenetico";
import { useBufalosbyPropriedade } from "@/hooks/useBufalos";
import {
  TIPO_MATERIAL_OPTIONS,
  ORIGEM_MATERIAL_OPTIONS,
  type MaterialGenetico,
  type TipoMaterial,
  type OrigemMaterial,
} from "@/services/material-genetico.service";

const inputClass =
  "w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#ce7d0a] focus:border-transparent";

interface FormState {
  tipo: TipoMaterial;
  origem: OrigemMaterial;
  idBufaloOrigem: string;
  fornecedor: string;
  dataColeta: string;
}

const DEFAULT_FORM: FormState = {
  tipo: "Sêmen",
  origem: "Coleta Própria",
  idBufaloOrigem: "",
  fornecedor: "",
  dataColeta: "",
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  idPropriedade: string;
  registro?: MaterialGenetico | null;
  onSaved?: () => void;
}

export function MaterialGeneticoFormModal({
  isOpen,
  onClose,
  idPropriedade,
  registro,
  onSaved,
}: Props) {
  const t = useTranslations("MaterialGeneticoPage.formModal");
  const isEdit = !!registro;

  const { createMaterialGenetico, isCreating, updateMaterialGenetico, isUpdating } =
    useMaterialGenetico();
  const isSaving = isCreating || isUpdating;

  const { data: bufalosData } = useBufalosbyPropriedade(
    idPropriedade,
    1,
    100,
  );
  const bufalos = bufalosData?.data ?? [];

  const [form, setForm] = useState<FormState>(DEFAULT_FORM);

  useEffect(() => {
    if (isOpen) {
      if (registro) {
        setForm({
          tipo: (registro.tipo as TipoMaterial) ?? "Sêmen",
          origem: (registro.origem as OrigemMaterial) ?? "Coleta Própria",
          idBufaloOrigem: registro.idBufaloOrigem ?? "",
          fornecedor: registro.fornecedor ?? "",
          dataColeta: registro.dataColeta ? registro.dataColeta.slice(0, 10) : "",
        });
      } else {
        setForm(DEFAULT_FORM);
      }
    }
  }, [isOpen, registro]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        idPropriedade,
        tipo: form.tipo,
        origem: form.origem,
        dataColeta: new Date(form.dataColeta).toISOString(),
        ...(form.origem === "Coleta Própria" && form.idBufaloOrigem
          ? { idBufaloOrigem: form.idBufaloOrigem }
          : {}),
        ...(form.origem === "Compra" && form.fornecedor
          ? { fornecedor: form.fornecedor }
          : {}),
      };

      if (isEdit && registro) {
        await updateMaterialGenetico({ id: registro.idMaterial, data: payload });
        toast.success(t("toast.updated"));
      } else {
        await createMaterialGenetico(payload);
        toast.success(t("toast.created"));
      }

      onSaved?.();
      onClose();
    } catch {
      toast.error(isEdit ? t("toast.errorUpdate") : t("toast.errorCreate"));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? t("editTitle") : t("createTitle")}
      size="md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Tipo */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-700">{t("fields.tipo")}</label>
          <select
            required
            value={form.tipo}
            onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value as TipoMaterial }))}
            className={inputClass}
          >
            {TIPO_MATERIAL_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>

        {/* Origem */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-700">{t("fields.origem")}</label>
          <select
            required
            value={form.origem}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                origem: e.target.value as OrigemMaterial,
                idBufaloOrigem: "",
                fornecedor: "",
              }))
            }
            className={inputClass}
          >
            {ORIGEM_MATERIAL_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>

        {/* Condicional: Coleta Própria → selecionar búfalo; Compra → fornecedor */}
        {form.origem === "Coleta Própria" ? (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700">{t("fields.bufaloOrigem")}</label>
            <select
              required
              value={form.idBufaloOrigem}
              onChange={(e) => setForm((f) => ({ ...f, idBufaloOrigem: e.target.value }))}
              className={inputClass}
            >
              <option value="">{t("fields.bufaloOrigemPlaceholder")}</option>
              {bufalos.map((b) => (
                <option key={b.idBufalo} value={b.idBufalo}>
                  {b.nome} {b.brinco ? `(${b.brinco})` : ""}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700">{t("fields.fornecedor")}</label>
            <input
              type="text"
              required
              maxLength={100}
              value={form.fornecedor}
              onChange={(e) => setForm((f) => ({ ...f, fornecedor: e.target.value }))}
              placeholder={t("fields.fornecedorPlaceholder")}
              className={inputClass}
            />
          </div>
        )}

        {/* Data de coleta */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-700">{t("fields.dataColeta")}</label>
          <input
            type="date"
            required
            max={new Date().toISOString().slice(0, 10)}
            value={form.dataColeta}
            onChange={(e) => setForm((f) => ({ ...f, dataColeta: e.target.value }))}
            className={inputClass}
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
            {t("actions.cancel")}
          </Button>
          <Button type="submit" variant="primary" isLoading={isSaving}>
            <FlaskConical className="w-3.5 h-3.5 mr-1.5" />
            {isEdit ? t("actions.save") : t("actions.create")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
