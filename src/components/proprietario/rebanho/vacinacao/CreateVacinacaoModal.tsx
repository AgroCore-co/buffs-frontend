"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Syringe, AlertCircle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useVacinacao } from "@/hooks/useVacinacao";
import { useMedicamentosByPropriedade } from "@/hooks/useMedicamentos";
import { isVacina } from "@/services/medicamentos.service";

const UNIDADES = ["ml", "mL", "dose", "g", "mg", "comprimido", "UI"];

const inputClass =
  "w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#ce7d0a] focus:border-transparent";

interface FormState {
  idMedicacao: string;
  dtAplicacao: string;
  dosagem: string;
  unidade_medida: string;
  doenca: string;
  necessita_retorno: boolean;
  dtRetorno: string;
}

const EMPTY_FORM: FormState = {
  idMedicacao: "",
  dtAplicacao: "",
  dosagem: "",
  unidade_medida: "ml",
  doenca: "Vacinação Preventiva",
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

export function CreateVacinacaoModal({ isOpen, onClose, idBufalo, idPropriedade, onCreated }: Props) {
  const t = useTranslations("Proprietario.rebanho.bufalo.vacinacao.createModal");
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const { createVacinacao, isCreatingVacinacao } = useVacinacao();
  const { data: medicamentos = [], isLoading: isLoadingMeds } = useMedicamentosByPropriedade(
    idPropriedade,
    { enabled: isOpen },
  );

  const vacinas = useMemo(() => medicamentos.filter(isVacina), [medicamentos]);

  useEffect(() => {
    if (isOpen) setForm(EMPTY_FORM);
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.idMedicacao) {
      toast.error(t("toast.errorNoVaccine"));
      return;
    }
    try {
      await createVacinacao({
        idBufalo,
        data: {
          idMedicacao:       form.idMedicacao,
          dtAplicacao:       form.dtAplicacao,
          dosagem:           form.dosagem ? parseFloat(form.dosagem) : undefined,
          unidade_medida:    form.unidade_medida,
          doenca:            form.doenca || undefined,
          necessita_retorno: form.necessita_retorno,
          dtRetorno:         form.necessita_retorno ? (form.dtRetorno || null) : null,
        },
      });
      toast.success(t("toast.success"));
      onCreated?.();
      onClose();
    } catch {
      toast.error(t("toast.error"));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t("title")} size="lg">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">

        {/* Sem vacinas cadastradas */}
        {!isLoadingMeds && vacinas.length === 0 && (
          <div className="flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-200 p-4">
            <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-amber-700">
              {t("noVaccines")}
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {/* Vacina */}
          <div className="space-y-1.5 col-span-2">
            <label className="text-sm font-medium text-zinc-700">{t("fields.vaccine")}</label>
            <select
              required
              value={form.idMedicacao}
              onChange={e => setForm(f => ({ ...f, idMedicacao: e.target.value }))}
              disabled={isLoadingMeds || vacinas.length === 0}
              className={inputClass}
            >
              <option value="" disabled>
                {isLoadingMeds ? t("fields.loadingVaccines") : t("fields.selectVaccine")}
              </option>
              {vacinas.map(v => (
                <option key={v.idMedicacao} value={v.idMedicacao}>
                  {v.medicacao}{v.descricao ? ` — ${v.descricao}` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Data de aplicação */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700">{t("fields.applicationDate")}</label>
            <input
              type="date"
              required
              value={form.dtAplicacao}
              onChange={e => setForm(f => ({ ...f, dtAplicacao: e.target.value }))}
              className={inputClass}
            />
          </div>

          {/* Doença / prevenção */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700">{t("fields.disease")}</label>
            <input
              type="text"
              value={form.doenca}
              onChange={e => setForm(f => ({ ...f, doenca: e.target.value }))}
              className={inputClass}
            />
          </div>

          {/* Dosagem */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700">{t("fields.dosage")}</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.dosagem}
              onChange={e => setForm(f => ({ ...f, dosagem: e.target.value }))}
              className={inputClass}
            />
          </div>

          {/* Unidade de medida */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700">{t("fields.unit")}</label>
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
          <span className="text-sm font-medium text-zinc-700">{t("fields.needsBooster")}</span>
        </div>

        {/* Data de retorno */}
        {form.necessita_retorno && (
          <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
            <label className="text-sm font-medium text-zinc-700">{t("fields.returnDate")}</label>
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
          <Button type="button" variant="outline" onClick={onClose} disabled={isCreatingVacinacao}>
            {t("actions.cancel")}
          </Button>
          <Button type="submit" variant="primary" isLoading={isCreatingVacinacao} disabled={vacinas.length === 0}>
            <Syringe className="w-3.5 h-3.5 mr-1.5" />
            {t("actions.register")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
