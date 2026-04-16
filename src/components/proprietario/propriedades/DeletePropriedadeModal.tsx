"use client";

import { useState } from "react";
import { usePropriedades } from "@/hooks/usePropriedades";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

export default function DeletePropriedadeModal({ isOpen, onClose, propriedade }) {
  const [error, setError] = useState(null);
  
  // Pegamos a função de deletar e o status de loading do seu hook
  const { deletePropriedade, isDeletingPropriedade } = usePropriedades();

  const handleDelete = async () => {
    // Trava de segurança caso a propriedade não tenha sido passada corretamente
    if (!propriedade?.idPropriedade) return;

    setError(null);
    try {
      // Chama a mutation passando o UUID da propriedade
      await deletePropriedade(propriedade.idPropriedade);
      
      // Fecha o modal após o sucesso (o hook já invalida a query e atualiza a lista na tela)
      onClose();
    } catch (err) {
      // Mesmo tratamento de erro robusto do modal de criação
      const mensagemBackend = err.response?.data?.message || err.response?.data?.error;
      setError(mensagemBackend || err.message || "Erro desconhecido ao tentar excluir.");
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
        {error && (
          <div className="p-3 bg-[var(--table-row-even)] border border-[var(--color-error)] text-[var(--color-error)] rounded-md text-sm">
            {error}
          </div>
        )}
        
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