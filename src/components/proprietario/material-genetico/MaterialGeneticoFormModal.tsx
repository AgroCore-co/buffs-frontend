"use client";

import { useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { FlaskConical } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import {
  createMaterialGeneticoSchema,
  type MaterialGeneticoFormValues,
} from "@/schemas/material-genetico.schema";

const inputClass =
  "w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#ce7d0a] focus:border-transparent";
const inputErrorClass =
  "w-full px-3 py-2 bg-white border border-red-400 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent";

const DEFAULT_FORM: MaterialGeneticoFormValues = {
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
  const tErrors = useTranslations("MaterialGeneticoPage.formModal.errors");
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

  const materialGeneticoSchema = useMemo(
    () => createMaterialGeneticoSchema(tErrors),
    [tErrors],
  );

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<MaterialGeneticoFormValues>({
    resolver: zodResolver(materialGeneticoSchema),
    defaultValues: DEFAULT_FORM,
  });

  const origem = watch("origem");

  useEffect(() => {
    if (isOpen) {
      if (registro) {
        reset({
          tipo: (registro.tipo as TipoMaterial) ?? "Sêmen",
          origem: (registro.origem as OrigemMaterial) ?? "Coleta Própria",
          idBufaloOrigem: registro.idBufaloOrigem ?? "",
          fornecedor: registro.fornecedor ?? "",
          dataColeta: registro.dataColeta ? registro.dataColeta.slice(0, 10) : "",
        });
      } else {
        reset(DEFAULT_FORM);
      }
    }
  }, [isOpen, registro, reset]);

  const onSubmit = async (data: MaterialGeneticoFormValues) => {
    try {
      const payload = {
        idPropriedade,
        tipo: data.tipo,
        origem: data.origem,
        dataColeta: new Date(data.dataColeta).toISOString(),
        ...(data.origem === "Coleta Própria" && data.idBufaloOrigem
          ? { idBufaloOrigem: data.idBufaloOrigem }
          : {}),
        ...(data.origem === "Compra" && data.fornecedor
          ? { fornecedor: data.fornecedor }
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
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
        {/* Tipo */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-700">{t("fields.tipo")}</label>
          <select {...register("tipo")} className={inputClass}>
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
          <Controller
            name="origem"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                onChange={(e) => {
                  field.onChange(e.target.value as OrigemMaterial);
                  setValue("idBufaloOrigem", "");
                  setValue("fornecedor", "");
                }}
                className={inputClass}
              >
                {ORIGEM_MATERIAL_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            )}
          />
        </div>

        {/* Condicional: Coleta Própria → selecionar búfalo; Compra → fornecedor */}
        {origem === "Coleta Própria" ? (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700">{t("fields.bufaloOrigem")}</label>
            <select
              {...register("idBufaloOrigem")}
              className={errors.idBufaloOrigem ? inputErrorClass : inputClass}
            >
              <option value="">{t("fields.bufaloOrigemPlaceholder")}</option>
              {bufalos.map((b) => (
                <option key={b.idBufalo} value={b.idBufalo}>
                  {b.nome} {b.brinco ? `(${b.brinco})` : ""}
                </option>
              ))}
            </select>
            {errors.idBufaloOrigem && (
              <p className="text-[11px] text-red-500">{errors.idBufaloOrigem.message}</p>
            )}
          </div>
        ) : (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700">{t("fields.fornecedor")}</label>
            <input
              type="text"
              maxLength={100}
              placeholder={t("fields.fornecedorPlaceholder")}
              className={errors.fornecedor ? inputErrorClass : inputClass}
              {...register("fornecedor")}
            />
            {errors.fornecedor && (
              <p className="text-[11px] text-red-500">{errors.fornecedor.message}</p>
            )}
          </div>
        )}

        {/* Data de coleta */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-700">{t("fields.dataColeta")}</label>
          <input
            type="date"
            max={new Date().toISOString().slice(0, 10)}
            {...register("dataColeta")}
            className={errors.dataColeta ? inputErrorClass : inputClass}
          />
          {errors.dataColeta && (
            <p className="text-[11px] text-red-500">{errors.dataColeta.message}</p>
          )}
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
