"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Droplets } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useOrdenhas } from "@/hooks/useOrdenhas";
import type { PeriodoOrdenha } from "@/services/ordenhas.service";

const inputClass =
  "w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#ce7d0a] focus:border-transparent";

const PERIODOS: { value: PeriodoOrdenha; label: string }[] = [
  { value: "M", label: "Manhã" },
  { value: "T", label: "Tarde" },
  { value: "N", label: "Noite" },
];

/** Valor para <input type="datetime-local"> com a data/hora atual (sem segundos). */
function nowLocalInput(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

interface FormState {
  qtOrdenha: string;
  periodo: PeriodoOrdenha;
  dtOrdenha: string;
  ocorrencia: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  idBufala: string;
  idPropriedade: string;
  idCicloLactacao: string;
  onCreated?: () => void;
}

export function RegistrarOrdenhaModal({
  isOpen, onClose, idBufala, idPropriedade, idCicloLactacao, onCreated,
}: Props) {
  const { createOrdenha, isCreatingOrdenha } = useOrdenhas();
  const [form, setForm] = useState<FormState>({
    qtOrdenha: "", periodo: "M", dtOrdenha: nowLocalInput(), ocorrencia: "",
  });

  useEffect(() => {
    if (isOpen) {
      setForm({ qtOrdenha: "", periodo: "M", dtOrdenha: nowLocalInput(), ocorrencia: "" });
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const qt = parseFloat(form.qtOrdenha);
    if (!qt || qt <= 0) {
      toast.error("Informe uma quantidade válida (litros).");
      return;
    }
    try {
      await createOrdenha({
        idBufala,
        idPropriedade,
        idCicloLactacao,
        qtOrdenha: qt,
        periodo: form.periodo,
        dtOrdenha: new Date(form.dtOrdenha).toISOString(),
        ...(form.ocorrencia.trim() && { ocorrencia: form.ocorrencia.trim() }),
      });
      toast.success("Ordenha registrada com sucesso.");
      onCreated?.();
      onClose();
    } catch {
      toast.error("Erro ao registrar ordenha.");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Registrar Ordenha" size="md">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-4">
          {/* Quantidade */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700">Quantidade (L)</label>
            <input
              type="number"
              required
              step="0.01"
              min="0"
              value={form.qtOrdenha}
              onChange={e => setForm(f => ({ ...f, qtOrdenha: e.target.value }))}
              className={inputClass}
            />
          </div>

          {/* Período */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700">Período</label>
            <select
              value={form.periodo}
              onChange={e => setForm(f => ({ ...f, periodo: e.target.value as PeriodoOrdenha }))}
              className={inputClass}
            >
              {PERIODOS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>

          {/* Data/hora */}
          <div className="space-y-1.5 col-span-2">
            <label className="text-sm font-medium text-zinc-700">Data e hora da ordenha</label>
            <input
              type="datetime-local"
              required
              max={nowLocalInput()}
              value={form.dtOrdenha}
              onChange={e => setForm(f => ({ ...f, dtOrdenha: e.target.value }))}
              className={inputClass}
            />
          </div>

          {/* Ocorrência */}
          <div className="space-y-1.5 col-span-2">
            <label className="text-sm font-medium text-zinc-700">
              Ocorrência <span className="text-zinc-400 font-normal">(opcional)</span>
            </label>
            <input
              type="text"
              maxLength={255}
              value={form.ocorrencia}
              onChange={e => setForm(f => ({ ...f, ocorrencia: e.target.value }))}
              placeholder="Ex: Mastite leve..."
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isCreatingOrdenha}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" isLoading={isCreatingOrdenha}>
            <Droplets className="w-3.5 h-3.5 mr-1.5" />
            Registrar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
