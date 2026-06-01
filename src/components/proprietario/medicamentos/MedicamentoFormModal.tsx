"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Pill } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useMedicamentos } from "@/hooks/useMedicamentos";
import {
  TIPO_TRATAMENTO_LABELS,
  tipoToEnum,
  type Medicacao,
  type TipoTratamentoMedicacao,
} from "@/services/medicamentos.service";

const inputClass =
  "w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#ce7d0a] focus:border-transparent";

const TIPOS = Object.keys(TIPO_TRATAMENTO_LABELS) as TipoTratamentoMedicacao[];

interface FormState {
  tipoTratamento: TipoTratamentoMedicacao;
  medicacao: string;
  descricao: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  idPropriedade: string;
  /** Quando informado, o modal opera em modo edição. */
  medicamento?: Medicacao | null;
  onSaved?: () => void;
}

export function MedicamentoFormModal({ isOpen, onClose, idPropriedade, medicamento, onSaved }: Props) {
  const isEdit = !!medicamento;
  const { createMedicamento, isCreatingMedicamento, updateMedicamento, isUpdatingMedicamento } = useMedicamentos();
  const isSaving = isCreatingMedicamento || isUpdatingMedicamento;

  const [form, setForm] = useState<FormState>({
    tipoTratamento: "VACINACAO",
    medicacao: "",
    descricao: "",
  });

  useEffect(() => {
    if (isOpen) {
      setForm({
        tipoTratamento: medicamento ? tipoToEnum(medicamento.tipoTratamento) : "VACINACAO",
        medicacao: medicamento?.medicacao ?? "",
        descricao: medicamento?.descricao ?? "",
      });
    }
  }, [isOpen, medicamento]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEdit && medicamento) {
        await updateMedicamento({
          id: medicamento.idMedicacao,
          data: {
            tipoTratamento: form.tipoTratamento,
            medicacao: form.medicacao,
            descricao: form.descricao || undefined,
          },
        });
        toast.success("Medicação atualizada com sucesso.");
      } else {
        await createMedicamento({
          idPropriedade,
          tipoTratamento: form.tipoTratamento,
          medicacao: form.medicacao,
          descricao: form.descricao || undefined,
        });
        toast.success("Medicação cadastrada com sucesso.");
      }
      onSaved?.();
      onClose();
    } catch {
      toast.error(isEdit ? "Erro ao atualizar medicação." : "Erro ao cadastrar medicação.");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? "Editar Medicação" : "Nova Medicação"} size="md">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">

        {/* Tipo de tratamento */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-700">Tipo de Tratamento</label>
          <select
            required
            value={form.tipoTratamento}
            onChange={e => setForm(f => ({ ...f, tipoTratamento: e.target.value as TipoTratamentoMedicacao }))}
            className={inputClass}
          >
            {TIPOS.map(t => (
              <option key={t} value={t}>{TIPO_TRATAMENTO_LABELS[t]}</option>
            ))}
          </select>
        </div>

        {/* Nome */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-700">Nome da Medicação</label>
          <input
            type="text"
            required
            maxLength={30}
            value={form.medicacao}
            onChange={e => setForm(f => ({ ...f, medicacao: e.target.value }))}
            placeholder="Ex: Vacina Aftosa, Ivermectina..."
            className={inputClass}
          />
          <p className="text-[11px] text-zinc-400 text-right">{form.medicacao.length}/30</p>
        </div>

        {/* Descrição */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-700">Descrição <span className="text-zinc-400 font-normal">(opcional)</span></label>
          <textarea
            rows={3}
            maxLength={100}
            value={form.descricao}
            onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
            placeholder="Detalhes sobre a medicação..."
            className={`${inputClass} resize-none`}
          />
          <p className="text-[11px] text-zinc-400 text-right">{form.descricao.length}/100</p>
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" isLoading={isSaving}>
            <Pill className="w-3.5 h-3.5 mr-1.5" />
            {isEdit ? "Salvar Alterações" : "Cadastrar"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
