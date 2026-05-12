"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Pencil } from "lucide-react";
import { GrupoFormData } from "./types";

interface CreateEditGrupoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  isLoading: boolean;
  formData: GrupoFormData;
  onFormChange: (data: GrupoFormData) => void;
  isEdit?: boolean;
}

export function CreateEditGrupoModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  formData,
  onFormChange,
  isEdit = false,
}: CreateEditGrupoModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Editar Grupo" : "Novo Grupo"}
      description={
        isEdit
          ? "Altere o nome e a cor de identificação do grupo."
          : "Crie uma nova divisão para o seu rebanho."
      }
      size="md"
    >
      <form onSubmit={onSubmit} className="space-y-4 mt-2">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-700">
            Nome do Grupo
          </label>
          <input
            type="text"
            required
            placeholder="Ex: Recria, Secagem, etc."
            value={formData.nomeGrupo}
            onChange={(e) =>
              onFormChange({ ...formData, nomeGrupo: e.target.value })
            }
            className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#ce7d0a] focus:border-transparent transition-all"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-700">
            Cor de Identificação
          </label>
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-zinc-300 shadow-sm shrink-0 cursor-pointer focus-within:ring-2 focus-within:ring-[#ce7d0a]">
              <input
                type="color"
                required
                value={formData.color}
                onChange={(e) =>
                  onFormChange({ ...formData, color: e.target.value })
                }
                className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer"
              />
            </div>
            <input
              type="text"
              value={formData.color.toUpperCase()}
              onChange={(e) =>
                onFormChange({ ...formData, color: e.target.value })
              }
              pattern="^#[0-9A-Fa-f]{6}$"
              placeholder="#000000"
              className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-sm font-mono text-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#ce7d0a] focus:border-transparent transition-all"
            />
          </div>
        </div>
        <div className="pt-5 mt-6 flex items-center justify-end gap-2 border-t border-zinc-100">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {isEdit ? (
              <>
                <Pencil className="w-4 h-4 mr-2" />
                Salvar Alterações
              </>
            ) : (
              "Criar grupo"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
