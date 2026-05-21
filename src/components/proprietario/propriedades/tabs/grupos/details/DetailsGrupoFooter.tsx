"use client";

import { Button } from "@/components/ui/Button";
import { Trash2, Pencil } from "lucide-react";

interface DetailsGrupoFooterProps {
  onDelete: () => void;
  onEdit: () => void;
}

export function DetailsGrupoFooter({ onDelete, onEdit }: DetailsGrupoFooterProps) {
  return (
    <div className="pt-5 mt-8 border-t border-zinc-100 flex items-center justify-between">
      <Button
        type="button"
        variant="ghost"
        onClick={onDelete}
        className="text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2"
      >
        <Trash2 className="w-4 h-4 mr-2" />
        Excluir Grupo
      </Button>
      <Button
        type="button"
        variant="primary"
        onClick={onEdit}
        className="px-6"
      >
        <Pencil className="w-4 h-4 mr-2" />
        Editar Grupo
      </Button>
    </div>
  );
}
