"use client";

import React, { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import {
  Syringe, Pencil, Trash2, Calendar, Clock,
  ChevronLeft, XCircle, RotateCcw,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useVacinacao } from "@/hooks/useVacinacao";
import { useMedicamentosByPropriedade } from "@/hooks/useMedicamentos";
import { isVacina } from "@/services/medicamentos.service";
import type { Vacinacao } from "@/services/vacinacao.service";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type View = "details" | "edit" | "confirm-delete";

interface FormState {
  idMedicacao: string;
  dtAplicacao: string;
  dosagem: string;
  unidade_medida: string;
  doenca: string;
  necessita_retorno: boolean;
  dtRetorno: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(value?: string | null) {
  if (!value) return "—";
  const datePart = value.slice(0, 10);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);
  if (!match) {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("pt-BR");
  }
  const [, year, month, day] = match;
  return `${day}/${month}/${year}`;
}

function toDateInput(value?: string | null): string {
  if (!value) return "";
  return value.split("T")[0].split(" ")[0];
}

function getMedicacao(reg: Vacinacao) {
  return reg.medicacoe ?? reg.medicacoes;
}

const UNIDADES = ["ml", "mL", "dose", "g", "mg", "comprimido", "UI"];

const inputClass =
  "w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#ce7d0a] focus:border-transparent";

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function InfoField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{label}</span>
      <div className="text-sm font-medium text-zinc-800">{children ?? "—"}</div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

interface Props {
  isOpen: boolean;
  onClose: () => void;
  registro: Vacinacao | null;
  idPropriedade: string;
  onMutated?: () => void;
}

export function VacinacaoDetailsModal({ isOpen, onClose, registro, idPropriedade, onMutated }: Props) {
  const [view, setView] = useState<View>("details");
  const [form, setForm] = useState<FormState>({
    idMedicacao: "", dtAplicacao: "", dosagem: "", unidade_medida: "ml",
    doenca: "", necessita_retorno: false, dtRetorno: "",
  });

  const { updateVacinacao, isUpdatingVacinacao, deleteVacinacao, isDeletingVacinacao, restoreVacinacao, isRestoringVacinacao } = useVacinacao();
  const { data: medicamentos = [] } = useMedicamentosByPropriedade(idPropriedade, {
    enabled: isOpen && view === "edit",
  });

  const vacinas = useMemo(() => medicamentos.filter(isVacina), [medicamentos]);

  useEffect(() => {
    if (isOpen && registro) {
      setView("details");
      setForm({
        idMedicacao:       registro.idMedicao ?? "",
        dtAplicacao:       toDateInput(registro.dtAplicacao),
        dosagem:           registro.dosagem ?? "",
        unidade_medida:    registro.unidadeMedida ?? "ml",
        doenca:            registro.doenca ?? "",
        necessita_retorno: registro.necessitaRetorno,
        dtRetorno:         toDateInput(registro.dtRetorno),
      });
    }
  }, [isOpen, registro]);

  if (!registro) return null;

  const medicacao = getMedicacao(registro);
  const isDeleted = !!registro.deletedAt;

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateVacinacao({
        id: registro.idSanit,
        data: {
          idMedicacao:       form.idMedicacao || undefined,
          dtAplicacao:       form.dtAplicacao,
          dosagem:           form.dosagem ? parseFloat(form.dosagem) : undefined,
          unidade_medida:    form.unidade_medida,
          doenca:            form.doenca || undefined,
          necessita_retorno: form.necessita_retorno,
          dtRetorno:         form.necessita_retorno ? (form.dtRetorno || null) : null,
        },
      });
      toast.success("Registro atualizado com sucesso.");
      onMutated?.();
      setView("details");
    } catch {
      toast.error("Erro ao atualizar registro.");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteVacinacao(registro.idSanit);
      toast.success("Registro removido com sucesso.");
      onMutated?.();
      onClose();
    } catch {
      toast.error("Erro ao remover registro.");
    }
  };

  const handleRestore = async () => {
    try {
      await restoreVacinacao(registro.idSanit);
      toast.success("Registro restaurado com sucesso.");
      onMutated?.();
      onClose();
    } catch {
      toast.error("Erro ao restaurar registro.");
    }
  };

  const titles: Record<View, string> = {
    details:          "Registro de Vacinação",
    edit:             "Editar Vacinação",
    "confirm-delete": "Remover Vacinação",
  };

  // ─── View: Detalhes ──────────────────────────────────────────────────────────

  const DetailsView = (
    <div className="flex flex-col gap-6">

      {/* Badges */}
      <div className="flex items-center flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
          <Syringe className="w-3.5 h-3.5" />
          Vacinação
        </span>
        {isDeleted && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 text-zinc-500 rounded-full text-xs font-semibold">
            <XCircle className="w-3.5 h-3.5" />
            Removido
          </span>
        )}
      </div>

      {/* Nome da vacina em destaque */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Vacina</p>
        <p className="text-2xl font-bold text-zinc-900">{medicacao?.medicacao ?? "—"}</p>
        {medicacao?.descricao && (
          <p className="text-sm text-zinc-500 mt-1">{medicacao.descricao}</p>
        )}
      </div>

      {/* Grid de informações */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        <InfoField label="Doença / Prevenção">
          <span className="capitalize">{registro.doenca}</span>
        </InfoField>
        <InfoField label="Data de Aplicação">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
            {formatDate(registro.dtAplicacao)}
          </span>
        </InfoField>
        <InfoField label="Dosagem">
          <span className="font-mono">{registro.dosagem} {registro.unidadeMedida}</span>
        </InfoField>
        <InfoField label="Tipo de Tratamento">
          {medicacao?.tipoTratamento ?? "—"}
        </InfoField>
      </div>

      {/* Bloco de retorno */}
      <div className={`rounded-xl p-4 border ${registro.necessitaRetorno ? "bg-amber-50 border-amber-200" : "bg-zinc-50 border-zinc-100"}`}>
        <div className="flex items-center gap-2">
          <Clock className={`w-4 h-4 ${registro.necessitaRetorno ? "text-amber-500" : "text-zinc-400"}`} />
          <span className="text-sm font-semibold text-zinc-700">Reforço / Retorno</span>
          <span className={`ml-auto text-xs font-semibold px-2.5 py-0.5 rounded-full ${registro.necessitaRetorno ? "bg-amber-100 text-amber-700" : "bg-zinc-100 text-zinc-400"}`}>
            {registro.necessitaRetorno ? "Necessário" : "Não necessário"}
          </span>
        </div>
        {registro.necessitaRetorno && (
          <p className={`text-sm mt-2 font-medium ${registro.dtRetorno ? "text-amber-700" : "text-amber-500"}`}>
            {registro.dtRetorno
              ? <>Previsto para <strong>{formatDate(registro.dtRetorno)}</strong></>
              : "Data de retorno não definida"}
          </p>
        )}
      </div>

      {/* Observação */}
      {registro.observacao && (
        <InfoField label="Observação">
          <span className="text-zinc-600 font-normal">{registro.observacao}</span>
        </InfoField>
      )}

      {/* Timestamps */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-3 pt-4 border-t border-zinc-100">
        <InfoField label="Criado em">{formatDate(registro.createdAt)}</InfoField>
        <InfoField label="Atualizado em">{formatDate(registro.updatedAt)}</InfoField>
        {isDeleted && (
          <InfoField label="Removido em">
            <span className="text-red-500">{formatDate(registro.deletedAt)}</span>
          </InfoField>
        )}
      </div>

      {/* Ações */}
      <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
        {isDeleted ? (
          <Button variant="outline" size="sm" isLoading={isRestoringVacinacao} onClick={handleRestore}>
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Restaurar registro
          </Button>
        ) : (
          <>
            <Button variant="danger" size="sm" onClick={() => setView("confirm-delete")}>
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              Remover
            </Button>
            <Button variant="primary" size="sm" onClick={() => setView("edit")}>
              <Pencil className="w-3.5 h-3.5 mr-1.5" />
              Editar
            </Button>
          </>
        )}
      </div>
    </div>
  );

  // ─── View: Editar ────────────────────────────────────────────────────────────

  const EditView = (
    <form onSubmit={handleEdit} className="flex flex-col gap-5">
      <button
        type="button"
        onClick={() => setView("details")}
        className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-700 transition-colors w-fit"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
        Voltar aos detalhes
      </button>

      <div className="grid grid-cols-2 gap-4">

        {/* Vacina */}
        <div className="space-y-1.5 col-span-2">
          <label className="text-sm font-medium text-zinc-700">Vacina</label>
          <select
            value={form.idMedicacao}
            onChange={e => setForm(f => ({ ...f, idMedicacao: e.target.value }))}
            className={inputClass}
          >
            {/* Garante a opção atual mesmo que a lista ainda não tenha carregado */}
            {form.idMedicacao && !vacinas.some(v => v.idMedicacao === form.idMedicacao) && (
              <option value={form.idMedicacao}>{medicacao?.medicacao ?? "Vacina atual"}</option>
            )}
            <option value="">Selecione a vacina</option>
            {vacinas.map(v => (
              <option key={v.idMedicacao} value={v.idMedicacao}>
                {v.medicacao}{v.descricao ? ` — ${v.descricao}` : ""}
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

        {/* Doença */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-700">Doença / Prevenção</label>
          <input
            type="text"
            value={form.doenca}
            onChange={e => setForm(f => ({ ...f, doenca: e.target.value }))}
            className={inputClass}
          />
        </div>

        {/* Dosagem */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-700">Dosagem</label>
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
        <span className="text-sm font-medium text-zinc-700">Necessita de reforço/retorno</span>
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
        <Button type="button" variant="outline" onClick={() => setView("details")} disabled={isUpdatingVacinacao}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" isLoading={isUpdatingVacinacao}>
          Salvar Alterações
        </Button>
      </div>
    </form>
  );

  // ─── View: Confirmar exclusão ─────────────────────────────────────────────────

  const ConfirmDeleteView = (
    <div className="flex flex-col items-center text-center gap-5 py-2">
      <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
        <Trash2 className="w-6 h-6 text-red-600" />
      </div>
      <div className="space-y-2">
        <h3 className="text-base font-semibold text-zinc-900">Remover este registro?</h3>
        <p className="text-sm text-zinc-500 leading-relaxed">
          A vacinação de{" "}
          <span className="font-semibold text-zinc-700">{medicacao?.medicacao ?? registro.doenca}</span>{" "}
          aplicada em{" "}
          <span className="font-semibold text-zinc-700">{formatDate(registro.dtAplicacao)}</span>{" "}
          será removida. Você pode restaurá-la depois em registros removidos.
        </p>
      </div>
      <div className="flex gap-3 w-full">
        <Button variant="outline" className="flex-1" onClick={() => setView("details")} disabled={isDeletingVacinacao}>
          Cancelar
        </Button>
        <Button variant="danger" className="flex-1" isLoading={isDeletingVacinacao} onClick={handleDelete}>
          <Trash2 className="w-3.5 h-3.5 mr-1.5" />
          Sim, remover
        </Button>
      </div>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={titles[view]} size="lg">
      {view === "details"        && DetailsView}
      {view === "edit"           && EditView}
      {view === "confirm-delete" && ConfirmDeleteView}
    </Modal>
  );
}
