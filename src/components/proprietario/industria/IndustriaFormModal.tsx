"use client";

import { useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Building2, User, Phone, FileText } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { usePropriedadeStore } from "@/stores/propriedade.store";
import {
  useCreateLaticinio,
  useUpdateLaticinio,
} from "@/hooks/useColeta";
import type { Laticinio } from "@/services/coleta.service";
import { createIndustriaSchema, type IndustriaFormValues } from "@/schemas/industria.schema";

const EMPTY_FORM: IndustriaFormValues = {
  nome: "",
  representante: "",
  contato: "",
  observacao: "",
};

interface IndustriaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  data?: Laticinio | null;
}

export function IndustriaFormModal({
  isOpen,
  onClose,
  data,
}: IndustriaFormModalProps) {
  const t = useTranslations("Proprietario.industria.formModal");
  const tErrors = useTranslations("Proprietario.industria.formModal.errors");
  const isEditing = !!data;
  const { activeId } = usePropriedadeStore();

  const createMutation = useCreateLaticinio(activeId ?? undefined);
  const updateMutation = useUpdateLaticinio(activeId ?? undefined);
  const isPending = createMutation.isPending || updateMutation.isPending;

  const industriaSchema = useMemo(() => createIndustriaSchema(tErrors), [tErrors]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<IndustriaFormValues>({
    resolver: zodResolver(industriaSchema),
    defaultValues: EMPTY_FORM,
  });

  useEffect(() => {
    if (isOpen) {
      if (data) {
        reset({
          nome: data.nome ?? "",
          representante: data.representante ?? "",
          contato: data.contato ?? "",
          observacao: data.observacao ?? "",
        });
      } else {
        reset(EMPTY_FORM);
      }
    }
  }, [isOpen, data, reset]);

  const onSubmit = (formData: IndustriaFormValues) => {
    if (isEditing) {
      const id = data!.id_industria ?? data!.id!;
      updateMutation.mutate(
        { id, data: formData },
        {
          onSuccess: () => {
            toast.success(t("toast.updateSuccess"));
            onClose();
          },
          onError: () => toast.error(t("toast.updateError")),
        },
      );
    } else {
      if (!activeId) {
        toast.error(t("toast.noProperty"));
        return;
      }
      createMutation.mutate(
        { ...formData, idPropriedade: activeId },
        {
          onSuccess: () => {
            toast.success(t("toast.createSuccess"));
            onClose();
          },
          onError: () => toast.error(t("toast.createError")),
        },
      );
    }
  };

  const inputClass =
    "w-full p-3 rounded-lg border border-slate-200 focus:border-[#ffcf78] focus:ring-2 focus:ring-[#ffcf78]/30 outline-none transition-all text-sm bg-white";
  const inputErrorClass =
    "w-full p-3 rounded-lg border border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-400/30 outline-none transition-all text-sm bg-white";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? t("editTitle") : t("createTitle")}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-2" noValidate>
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#ce7d0a]" /> {t("fields.name")}
          </label>
          <input
            type="text"
            placeholder={t("fields.namePlaceholder")}
            className={errors.nome ? inputErrorClass : inputClass}
            {...register("nome")}
          />
          {errors.nome && (
            <p className="text-[11px] text-red-500">{errors.nome.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <User className="w-4 h-4 text-[#ce7d0a]" /> {t("fields.representative")}
            </label>
            <input
              type="text"
              placeholder={t("fields.representativePlaceholder")}
              className={inputClass}
              {...register("representante")}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#ce7d0a]" /> {t("fields.contact")}
            </label>
            <input
              type="text"
              placeholder={t("fields.contactPlaceholder")}
              className={inputClass}
              {...register("contato")}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#ce7d0a]" /> {t("fields.observations")}
          </label>
          <textarea
            placeholder={t("fields.observationsPlaceholder")}
            rows={3}
            className={`${inputClass} resize-none`}
            {...register("observacao")}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isPending}
          >
            {t("actions.cancel")}
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isPending}
            className="min-w-[120px] font-bold"
          >
            {isEditing ? t("actions.save") : t("actions.create")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
