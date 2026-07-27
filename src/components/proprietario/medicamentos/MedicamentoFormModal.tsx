"use client";

import { useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Pill } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useMedicamentos } from "@/hooks/useMedicamentos";
import {
  TIPO_TRATAMENTO_LABELS,
  tipoToEnum,
  type Medicacao,
  type TipoTratamentoMedicacao,
} from "@/services/medicamentos.service";
import { createMedicamentoSchema, type MedicamentoFormValues } from "@/schemas/medicamento.schema";

const inputClass =
  "w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#ce7d0a] focus:border-transparent";
const inputErrorClass =
  "w-full px-3 py-2 bg-white border border-red-400 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent";

const TIPOS = Object.keys(TIPO_TRATAMENTO_LABELS) as TipoTratamentoMedicacao[];

const DEFAULT_FORM: MedicamentoFormValues = {
  tipoTratamento: "VACINACAO",
  medicacao: "",
  descricao: "",
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  idPropriedade: string;
  /** Quando informado, o modal opera em modo edição. */
  medicamento?: Medicacao | null;
  onSaved?: () => void;
}

export function MedicamentoFormModal({ isOpen, onClose, idPropriedade, medicamento, onSaved }: Props) {
  const t = useTranslations("Proprietario.medicamentos.formModal");
  const tErrors = useTranslations("Proprietario.medicamentos.formModal.errors");
  const isEdit = !!medicamento;
  const { createMedicamento, isCreatingMedicamento, updateMedicamento, isUpdatingMedicamento } = useMedicamentos();
  const isSaving = isCreatingMedicamento || isUpdatingMedicamento;

  const medicamentoSchema = useMemo(() => createMedicamentoSchema(tErrors), [tErrors]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<MedicamentoFormValues>({
    resolver: zodResolver(medicamentoSchema),
    defaultValues: DEFAULT_FORM,
  });

  const medicacao = watch("medicacao");
  const descricao = watch("descricao");

  useEffect(() => {
    if (isOpen) {
      reset({
        tipoTratamento: medicamento ? tipoToEnum(medicamento.tipoTratamento) : "VACINACAO",
        medicacao: medicamento?.medicacao ?? "",
        descricao: medicamento?.descricao ?? "",
      });
    }
  }, [isOpen, medicamento, reset]);

  const onSubmit = async (data: MedicamentoFormValues) => {
    try {
      if (isEdit && medicamento) {
        await updateMedicamento({
          id: medicamento.idMedicacao,
          data: {
            tipoTratamento: data.tipoTratamento,
            medicacao: data.medicacao,
            descricao: data.descricao || undefined,
          },
        });
        toast.success(t("toast.updated"));
      } else {
        await createMedicamento({
          idPropriedade,
          tipoTratamento: data.tipoTratamento,
          medicacao: data.medicacao,
          descricao: data.descricao || undefined,
        });
        toast.success(t("toast.created"));
      }
      onSaved?.();
      onClose();
    } catch {
      toast.error(isEdit ? t("toast.errorUpdate") : t("toast.errorCreate"));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? t("editTitle") : t("createTitle")} size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>

        {/* Tipo de tratamento */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-700">{t("fields.type")}</label>
          <select {...register("tipoTratamento")} className={inputClass}>
            {TIPOS.map(tipo => (
              <option key={tipo} value={tipo}>{TIPO_TRATAMENTO_LABELS[tipo]}</option>
            ))}
          </select>
        </div>

        {/* Nome */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-700">{t("fields.name")}</label>
          <input
            type="text"
            maxLength={30}
            placeholder={t("fields.namePlaceholder")}
            className={errors.medicacao ? inputErrorClass : inputClass}
            {...register("medicacao")}
          />
          {errors.medicacao && (
            <p className="text-[11px] text-red-500">{errors.medicacao.message}</p>
          )}
          <p className="text-[11px] text-zinc-400 text-right">{medicacao.length}/30</p>
        </div>

        {/* Descrição */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-700">{t("fields.description")} <span className="text-zinc-400 font-normal">{t("fields.optional")}</span></label>
          <textarea
            rows={3}
            maxLength={100}
            placeholder={t("fields.descriptionPlaceholder")}
            className={`${errors.descricao ? inputErrorClass : inputClass} resize-none`}
            {...register("descricao")}
          />
          {errors.descricao && (
            <p className="text-[11px] text-red-500">{errors.descricao.message}</p>
          )}
          <p className="text-[11px] text-zinc-400 text-right">{descricao.length}/100</p>
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
            {t("actions.cancel")}
          </Button>
          <Button type="submit" variant="primary" isLoading={isSaving}>
            <Pill className="w-3.5 h-3.5 mr-1.5" />
            {isEdit ? t("actions.save") : t("actions.create")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
