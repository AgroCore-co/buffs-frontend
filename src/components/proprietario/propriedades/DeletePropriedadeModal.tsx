"use client";

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
  // Pegamos a função de deletar e o status de loading do seu hook
  const { deletePropriedade, isDeletingPropriedade } = usePropriedades();

  const handleDelete = async () => {
    // Trava de segurança caso a propriedade não tenha sido passada corretamente
    if (!propriedade?.idPropriedade) return;

    const toastId = toast.loading("Excluindo propriedade...");
    try {
      await deletePropriedade(propriedade.idPropriedade);
      toast.success(`Propriedade "${propriedade.nome}" excluída.`, { id: toastId });
      onClose();
    } catch (err) {
      const e = err as { response?: { data?: { message?: string; error?: string } }; message?: string };
      const mensagemBackend = e.response?.data?.message || e.response?.data?.error;
      toast.error(mensagemBackend || e.message || "Erro desconhecido ao tentar excluir.", { id: toastId });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md" // Modal menor, já que é só um aviso
      title="Excluir Propriedade"
      description="Esta ação é irreversível"
      footer={
        <>
          <Button 
            type="button" 
            variant="secondary" 
            onClick={onClose} 
            disabled={isDeletingPropriedade}
          >
            Cancelar
          </Button>
          <Button 
            type="button" 
            // Se o seu botão tiver a variante destructive mapeada para a cor de erro, pode usar variant="destructive". 
            // Senão, forçamos a cor de erro da sua paleta global via Tailwind
            className="bg-[var(--color-error)] text-[var(--color-text-light)] hover:opacity-90 border-transparent"
            onClick={handleDelete} 
            disabled={isDeletingPropriedade} 
            isLoading={isDeletingPropriedade}
          >
            Excluir
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="text-[var(--color-text-secondary)]">
          Tem certeza que deseja excluir a propriedade <strong className="text-[var(--color-text-primary)]">{propriedade?.nome}</strong>?
        </p>
        
        <p className="text-sm text-[var(--color-text-tertiary)]">
          Todos os dados vinculados a esta propriedade poderão ser perdidos. Esta ação não poderá ser desfeita.
        </p>
      </div>
    </Modal>
  );
}