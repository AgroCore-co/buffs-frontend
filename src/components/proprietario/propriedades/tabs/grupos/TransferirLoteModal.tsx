"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { GrupoMoveData } from "./types";

interface TransferirLoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  isLoading: boolean;
  moveData: GrupoMoveData;
  onMoveDataChange: (data: GrupoMoveData) => void;
  lotes: any[];
  grupoNome?: string;
  currentLoteName?: string;
}

export function TransferirLoteModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  moveData,
  onMoveDataChange,
  lotes,
  grupoNome,
  currentLoteName,
}: TransferirLoteModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Transferir Lote"
      description={`Mova o grupo "${grupoNome}" para um novo lote/piquete.`}
      size="md"
    >
      <form onSubmit={onSubmit} className="space-y-4 mt-4">
        <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-200 mb-2">
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-1">
            Localização Atual
          </span>
          <span className="text-sm font-medium text-zinc-900">
            {currentLoteName || "Sem alocação prévia"}
          </span>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-700">
            Lote de Destino
          </label>
          <select
            required
            value={moveData.idLoteAtual}
            onChange={(e) =>
              onMoveDataChange({
                ...moveData,
                idLoteAtual: e.target.value,
              })
            }
            className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#ce7d0a] focus:border-transparent transition-all"
          >
            <option value="" disabled>
              Selecione um lote
            </option>
            {lotes?.map((lote: any) => (
              <option key={lote.idLote} value={lote.idLote}>
                {lote.nomeLote}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-700">
            Data e Hora de Entrada
          </label>
          <input
            type="datetime-local"
            required
            value={moveData.dtEntrada}
            onChange={(e) =>
              onMoveDataChange({
                ...moveData,
                dtEntrada: e.target.value,
              })
            }
            className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#ce7d0a]"
          />
        </div>

        <div className="pt-5 mt-6 border-t border-zinc-100 flex items-center justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            Confirmar Transferência
          </Button>
        </div>
      </form>
    </Modal>
  );
}
