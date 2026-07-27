"use client";

import React, { useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { Activity } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { createCoberturaSchema, type CoberturaFormValues } from "@/schemas/cobertura.schema";

const inputClass =
  "w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#ce7d0a] focus:border-transparent";
const inputErrorClass =
  "w-full px-3 py-2 bg-white border border-red-400 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent";

const DEFAULT_FORM: CoberturaFormValues = {
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
  const tErrors = useTranslations("ReproducaoPage.formModal.errors");
  const isEdit = !!registro;

  const { createReproducao, isCreating, updateReproducao, isUpdating } = useReproducaoMutations();
  const isSaving = isCreating || isUpdating;

  // Dados pré-carregados ao montar o componente (não depende de isOpen)
  const { data: bufalosData } = useBufalosbyPropriedade(idPropriedade, 1, 100);
  const { data: materialData } = useMaterialGeneticoByPropriedade(
    idPropriedade,
    { page: 1, limit: 100 },
  );

  const coberturaSchema = useMemo(() => createCoberturaSchema(tErrors), [tErrors]);

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CoberturaFormValues>({
    resolver: zodResolver(coberturaSchema),
    defaultValues: DEFAULT_FORM,
  });

  const tipoInseminacao = watch("tipoInseminacao");

  const allBufalos = bufalosData?.data ?? [];
  const femeas = allBufalos.filter((b) => b.sexo === "F");
  const machos = allBufalos.filter((b) => b.sexo === "M");
  const materiais = materialData?.data ?? [];

  const materiaisFiltrados = materiais.filter(
    (m) => m.tipo === (tipoInseminacao === "TE" ? "Embrião" : "Sêmen"),
  );

  // Redefine form quando abre ou troca de registro
  useEffect(() => {
    if (isOpen) {
      if (registro) {
        reset({
          idBufala: registro.idBufala ?? "",
          tipoInseminacao: (registro.tipoInseminacao as TipoInseminacao) ?? "IA",
          idSemen: registro.idSemen ?? "",
          idBufalo: registro.idBufalo ?? "",
          dtEvento: registro.dtEvento ? registro.dtEvento.slice(0, 10) : "",
          status: (registro.status as StatusReproducao) ?? "Em andamento",
        });
      } else {
        reset(DEFAULT_FORM);
      }
    }
  }, [isOpen, registro, reset]);

  const onSubmit = async (data: CoberturaFormValues) => {
    try {
      const payload = {
        idPropriedade,
        idBufala: data.idBufala,
        tipoInseminacao: data.tipoInseminacao,
        dtEvento: new Date(data.dtEvento).toISOString(),
        status: data.status,
        ...(showMaterial && data.idSemen ? { idSemen: data.idSemen } : {}),
        ...(data.tipoInseminacao === "Monta Natural" && data.idBufalo
          ? { idBufalo: data.idBufalo }
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

  const showMaterial = tipoInseminacao === "IA" || tipoInseminacao === "IATF" || tipoInseminacao === "TE";
  const showMacho = tipoInseminacao === "Monta Natural";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? t("editTitle") : t("createTitle")}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
        {/* Fêmea receptora */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-700">{t("fields.femea")}</label>
          <select
            {...register("idBufala")}
            className={errors.idBufala ? inputErrorClass : inputClass}
          >
            <option value="">{t("fields.femeaPlaceholder")}</option>
            {femeas.map((b) => (
              <option key={b.idBufalo} value={b.idBufalo}>
                {b.nome} {b.brinco ? `(${b.brinco})` : ""}
              </option>
            ))}
          </select>
          {errors.idBufala && (
            <p className="text-[11px] text-red-500">{errors.idBufala.message}</p>
          )}
        </div>

        {/* Tipo de inseminação */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-700">{t("fields.tipo")}</label>
          <Controller
            name="tipoInseminacao"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                onChange={(e) => {
                  field.onChange(e.target.value as TipoInseminacao);
                  setValue("idSemen", "");
                  setValue("idBufalo", "");
                }}
                className={errors.tipoInseminacao ? inputErrorClass : inputClass}
              >
                {TIPO_INSEMINACAO_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            )}
          />
          <p className="text-[11px] text-zinc-400">
            {t(`fields.tipoDesc.${tipoInseminacao.replace(" ", "_")}`)}
          </p>
        </div>

        {/* Material genético (IA, IATF, TE) */}
        {showMaterial && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700">
              {tipoInseminacao === "TE" ? t("fields.embriao") : t("fields.semen")}
            </label>
            <select
              {...register("idSemen")}
              className={errors.idSemen ? inputErrorClass : inputClass}
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
            {errors.idSemen && (
              <p className="text-[11px] text-red-500">{errors.idSemen.message}</p>
            )}
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
              {...register("idBufalo")}
              className={errors.idBufalo ? inputErrorClass : inputClass}
            >
              <option value="">{t("fields.machoPlaceholder")}</option>
              {machos.map((b) => (
                <option key={b.idBufalo} value={b.idBufalo}>
                  {b.nome} {b.brinco ? `(${b.brinco})` : ""}
                </option>
              ))}
            </select>
            {errors.idBufalo && (
              <p className="text-[11px] text-red-500">{errors.idBufalo.message}</p>
            )}
          </div>
        )}

        {/* Data do evento */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-700">{t("fields.dtEvento")}</label>
          <input
            type="date"
            max={new Date().toISOString().slice(0, 10)}
            {...register("dtEvento")}
            className={errors.dtEvento ? inputErrorClass : inputClass}
          />
          {errors.dtEvento && (
            <p className="text-[11px] text-red-500">{errors.dtEvento.message}</p>
          )}
        </div>

        {/* Status */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-700">
            {t("fields.status")}{" "}
            <span className="text-zinc-400 font-normal">{t("fields.optional")}</span>
          </label>
          <select {...register("status")} className={inputClass}>
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
