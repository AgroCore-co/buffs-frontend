"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { AlertCircle, Trash2 } from "lucide-react";
import { Grupo } from "./types";

interface DeleteGrupoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
  grupo: Grupo | null;
}

export function DeleteGrupoModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  grupo,
}: DeleteGrupoModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      {grupo && (
        <div className="text-center p-2">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-900 mb-1">
            Excluir grupo?
          </h3>
          <p className="text-sm text-zinc-500 mb-6">
            Tem certeza que deseja excluir o grupo{" "}
            <span className="font-semibold text-zinc-700">
              {grupo.nomeGrupo}
            </span>
            ? Esta ação pode afetar o histórico de lotes associados a ele.
          </p>
          <div className="flex flex-col gap-2">
            <Button
              onClick={onConfirm}
              variant="danger"
              isLoading={isLoading}
              className="w-full"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Sim, excluir grupo
            </Button>
            <Button
              onClick={onClose}
              disabled={isLoading}
              variant="outline"
              className="w-full"
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
