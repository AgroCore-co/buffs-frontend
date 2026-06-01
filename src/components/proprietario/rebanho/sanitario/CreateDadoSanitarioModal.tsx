"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Stethoscope } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useDadosSanitarios, useSugestoesDoencas } from "@/hooks/useDadosSanitarios";
import { useMedicamentosByPropriedade } from "@/hooks/useMedicamentos";

const UNIDADES = ["ml", "mL", "dose", "g", "mg", "comprimido", "UI", "mL/kg"];

const inputClass =
  "w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#ce7d0a] focus:border-transparent";

interface FormState {
  idMedicao: string;
  dtAplicacao: string;
  doenca: string;
  dosagem: string;
  unidade_medida: string;
  necessita_retorno: boolean;
  dtRetorno: string;
}

const EMPTY_FORM: FormState = {
  idMedicao: "",
  dtAplicacao: "",
  doenca: "",
  dosagem: "",
  unidade_medida: "ml",
  necessita_retorno: false,
  dtRetorno: "",
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  idBufalo: string;
  idPropriedade: string;
  onCreated?: () => void;
}

export function CreateDadoSanitarioModal({ isOpen, onClose, idBufalo, idPropriedade, onCreated }: Props) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [showSugestoes, setShowSugestoes] = useState(false);

  const { createDadoSanitario, isCreatingDadoSanitario } = useDadosSanitarios();
  const { data: medicamentos = [], isLoading: isLoadingMeds } = useMedicamentosByPropriedade(idPropriedade, {
    enabled: isOpen,
  });
  const { data: sugestoes = [] } = useSugestoesDoencas(
    form.doenca.length >= 2 ? form.doenca : undefined,
    6,
    { enabled: isOpen && form.doenca.length >= 2 },
  );

  useEffect(() => {
    if (isOpen) {
      setForm(EMPTY_FORM);
      setShowSugestoes(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.doenca.trim()) {
      toast.error("Informe a doença/condição.");
      return;
    }
    try {
      await createDadoSanitario({
        idBufalo,
        ...(form.idMedicao && { idMedicao: form.idMedicao }),
        dtAplicacao: form.dtAplicacao,
        dosagem: form.dosagem ? parseFloat(form.dosagem) : 0,
        unidade_medida: form.unidade_medida,
        doenca: form.doenca.trim(),
        necessita_retorno: form.necessita_retorno,
        dtRetorno: form.necessita_retorno ? (form.dtRetorno || null) : null,
      });
      toast.success("Registro sanitário criado com sucesso.");
      onCreated?.();
      onClose();
    } catch {
      toast.error("Erro ao criar registro sanitário.");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Novo Registro Sanitário" size="lg">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-4">

          {/* Medicação (opcional) */}
          <div className="space-y-1.5 col-span-2">
            <label className="text-sm font-medium text-zinc-700">
              Medicação <span className="text-zinc-400 font-normal">(opcional)</span>
            </label>
            <select
              value={form.idMedicao}
              onChange={e => setForm(f => ({ ...f, idMedicao: e.target.value }))}
              disabled={isLoadingMeds}
              className={inputClass}
            >
              <option value="">{isLoadingMeds ? "Carregando medicações..." : "Sem medicação vinculada"}</option>
              {medicamentos.map(m => (
                <option key={m.idMedicacao} value={m.idMedicacao}>
                  {m.medicacao}{m.tipoTratamento ? ` — ${m.tipoTratamento}` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Data de aplicação */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700">Data de Aplicação</label>
            <input
              type="date"
              required
              value={form.dtAplicacao}
              onChange={e => setForm(f => ({ ...f, dtAplicacao: e.target.value }))}
              className={inputClass}
            />
          </div>

          {/* Doença com autocomplete */}
          <div className="space-y-1.5 relative">
            <label className="text-sm font-medium text-zinc-700">Doença / Condição</label>
            <input
              type="text"
              required
              autoComplete="off"
              value={form.doenca}
              onChange={e => { setForm(f => ({ ...f, doenca: e.target.value })); setShowSugestoes(true); }}
              onFocus={() => setShowSugestoes(true)}
              onBlur={() => setTimeout(() => setShowSugestoes(false), 150)}
              className={inputClass}
            />
            {showSugestoes && sugestoes.length > 0 && (
              <div className="absolute z-20 w-full bg-white border border-zinc-200 rounded-lg shadow-lg overflow-hidden top-[calc(100%+2px)]">
                {sugestoes.map(s => (
                  <button
                    key={s}
                    type="button"
                    onMouseDown={() => { setForm(f => ({ ...f, doenca: s })); setShowSugestoes(false); }}
                    className="w-full text-left px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 capitalize transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dosagem */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700">Dosagem</label>
            <input
              type="number"
              required
              step="0.01"
              min="0"
              value={form.dosagem}
              onChange={e => setForm(f => ({ ...f, dosagem: e.target.value }))}
              className={inputClass}
            />
          </div>

          {/* Unidade de medida */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700">Unidade de Medida</label>
            <select
              value={form.unidade_medida}
              onChange={e => setForm(f => ({ ...f, unidade_medida: e.target.value }))}
              className={inputClass}
            >
              {UNIDADES.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
        </div>

        {/* Toggle retorno */}
        <div className="flex items-center gap-3">
          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={form.necessita_retorno}
              onChange={e => setForm(f => ({ ...f, necessita_retorno: e.target.checked }))}
            />
            <div className="w-10 h-6 bg-zinc-200 rounded-full peer peer-checked:bg-[#ce7d0a] transition-colors duration-200 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:duration-200 peer-checked:after:translate-x-4" />
          </label>
          <span className="text-sm font-medium text-zinc-700">Necessita de retorno</span>
        </div>

        {/* Data de retorno */}
        {form.necessita_retorno && (
          <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
            <label className="text-sm font-medium text-zinc-700">Data de Retorno</label>
            <input
              type="date"
              min={form.dtAplicacao}
              value={form.dtRetorno}
              onChange={e => setForm(f => ({ ...f, dtRetorno: e.target.value }))}
              className={inputClass}
            />
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isCreatingDadoSanitario}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" isLoading={isCreatingDadoSanitario}>
            <Stethoscope className="w-3.5 h-3.5 mr-1.5" />
            Registrar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
