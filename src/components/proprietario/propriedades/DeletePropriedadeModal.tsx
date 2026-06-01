"use client";

import { useTranslations } from "next-intl";
import { usePropriedades } from "@/hooks/usePropriedades";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import { Propriedade } from "@/services/propriedades.service";

interface DeletePropriedadeModalProps {
  isOpen: boolean;
  onClose: () => void;
  propriedade: Propriedade | null;
}

export default function DeletePropriedadeModal({ isOpen, onClose, propriedade }: DeletePropriedadeModalProps) {
  const t = useTranslations("Proprietario.propriedades");
  const { deletePropriedade, isDeletingPropriedade } = usePropriedades();

  const handleDelete = async () => {
    if (!propriedade?.idPropriedade) return;

    const toastId = toast.loading(t("form.delete.loading"));
    try {
      await deletePropriedade(propriedade.idPropriedade);
      toast.success(t("form.delete.success", { name: propriedade.nome }), { id: toastId });
      onClose();
    } catch (err) {
      const e = err as { response?: { data?: { message?: string; error?: string } }; message?: string };
      const mensagemBackend = e.response?.data?.message || e.response?.data?.error;
      toast.error(mensagemBackend || e.message || t("form.delete.errorFallback"), { id: toastId });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title={t("form.delete.title")}
      description={t("form.delete.description")}
      footer={
        <>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isDeletingPropriedade}
          >
            {t("form.buttons.cancel")}
          </Button>
          <Button
            type="button"
            className="bg-[var(--color-error)] text-[var(--color-text-light)] hover:opacity-90 border-transparent"
            onClick={handleDelete}
            disabled={isDeletingPropriedade}
            isLoading={isDeletingPropriedade}
          >
            {t("form.buttons.delete")}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="text-[var(--color-text-secondary)]">
          {t("form.delete.confirmText")} <strong className="text-[var(--color-text-primary)]">{propriedade?.nome}</strong>?
        </p>

        <p className="text-sm text-[var(--color-text-tertiary)]">
          {t("form.delete.warningText")}
        </p>
      </div>
    </Modal>
  );
}