"use client";

import { useState, useEffect } from "react";
import { Building2, User, Phone, FileText } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { usePropriedadeStore } from "@/stores/propriedade.store";
import {
  useCreateLaticinio,
  useUpdateLaticinio,
} from "@/hooks/useColeta";
import type { Laticinio } from "@/services/coleta.service";

interface FormData {
  nome: string;
  representante: string;
  contato: string;
  observacao: string;
}

const EMPTY_FORM: FormData = {
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
  const isEditing = !!data;
  const { activeId } = usePropriedadeStore();

  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);

  const createMutation = useCreateLaticinio(activeId ?? undefined);
  const updateMutation = useUpdateLaticinio(activeId ?? undefined);
  const isPending = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (isOpen) {
      if (data) {
        setFormData({
          nome: data.nome ?? "",
          representante: data.representante ?? "",
          contato: data.contato ?? "",
          observacao: data.observacao ?? "",
        });
      } else {
        setFormData(EMPTY_FORM);
      }
    }
  }, [isOpen, data]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome.trim()) {
      toast.error("O nome da indústria é obrigatório.");
      return;
    }

    if (isEditing) {
      const id = data!.id_industria ?? data!.id!;
      updateMutation.mutate(
        { id, data: { ...formData, id_propriedade: activeId ?? undefined } },
        {
          onSuccess: () => {
            toast.success("Indústria atualizada com sucesso!");
            onClose();
          },
          onError: () => toast.error("Erro ao atualizar os dados."),
        },
      );
    } else {
      if (!activeId) {
        toast.error("Nenhuma propriedade selecionada.");
        return;
      }
      createMutation.mutate(
        { ...formData, id_propriedade: activeId },
        {
          onSuccess: () => {
            toast.success("Indústria cadastrada com sucesso!");
            onClose();
          },
          onError: () => toast.error("Erro ao cadastrar a indústria."),
        },
      );
    }
  };

  const inputClass =
    "w-full p-3 rounded-lg border border-slate-200 focus:border-[#ffcf78] focus:ring-2 focus:ring-[#ffcf78]/30 outline-none transition-all text-sm bg-white";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Editar Indústria" : "Nova Indústria"}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5 py-2">
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#ce7d0a]" /> Nome da Indústria *
          </label>
          <input
            type="text"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            placeholder="Ex: Laticínio Valle"
            className={inputClass}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <User className="w-4 h-4 text-[#ce7d0a]" /> Representante
            </label>
            <input
              type="text"
              name="representante"
              value={formData.representante}
              onChange={handleChange}
              placeholder="Nome do contato"
              className={inputClass}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#ce7d0a]" /> Contato
            </label>
            <input
              type="text"
              name="contato"
              value={formData.contato}
              onChange={handleChange}
              placeholder="(00) 00000-0000"
              className={inputClass}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#ce7d0a]" /> Observações
          </label>
          <textarea
            name="observacao"
            value={formData.observacao}
            onChange={handleChange}
            placeholder="Informações adicionais..."
            rows={3}
            className={`${inputClass} resize-none`}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isPending}
            className="min-w-[120px] font-bold"
          >
            {isEditing ? "Salvar Alterações" : "Cadastrar"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
