"use client";

import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Scale, Pencil, Trash2, Calendar, Ruler,
  ChevronLeft, XCircle, RotateCcw,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { dadosZootecnicosService } from "@/services/dados-zootecnicos.service";
import type {
  DadoZootecnico,
  UpdateDadoZootecnicoDTO,
} from "@/services/dados-zootecnicos.service";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type View = "details" | "edit" | "confirm-delete";

interface FormState {
  peso: string;
  condicaoCorporal: string;
  corPelagem: string;
  formatoChifre: string;
  porteCorporal: string;
  dtRegistro: string;
  tipoPesagem: string;
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

function toNumber(value: string | number | null | undefined): number {
  const n = typeof value === "number" ? value : parseFloat(value ?? "");
  return Number.isNaN(n) ? 0 : n;
}

function getEccStyle(ecc: number): { bar: string; text: string } {
  if (ecc > 4.5) return { bar: "bg-red-500",  text: "text-red-600"  };
  if (ecc >= 2.5) return { bar: "bg-blue-500", text: "text-blue-600" };
  return            { bar: "bg-amber-400",     text: "text-amber-600" };
}

const FORMATOS_CHIFRE = ["Curvado", "Enrolado", "Em Cacho", "Reto", "Ausente"];
const PORTES = ["Pequeno", "Médio", "Grande"];
const TIPOS_PESAGEM = ["Mensal", "Semanal", "Quinzenal", "Anual", "Avulsa"];

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function InfoField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{label}</span>
      <div className="text-sm font-medium text-zinc-800">{children ?? "—"}</div>
    </div>
  );
}

/** Input com sugestões livres (datalist) — aceita texto fora da lista. */
function SuggestField({
  label, value, onChange, options, listId,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  listId: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-zinc-700">{label}</label>
      <input
        type="text"
        autoComplete="off"
        list={listId}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#ce7d0a] focus:border-transparent"
      />
      <datalist id={listId}>
        {options.map(o => <option key={o} value={o} />)}
      </datalist>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

interface Props {
  isOpen: boolean;
  onClose: () => void;
  registro: DadoZootecnico | null;
  onMutated?: () => void;
}

export function DadoZootecnicoDetailsModal({ isOpen, onClose, registro, onMutated }: Props) {
  const queryClient = useQueryClient();
  const [view, setView] = useState<View>("details");
  const [form, setForm] = useState<FormState>({
    peso: "", condicaoCorporal: "", corPelagem: "", formatoChifre: "",
    porteCorporal: "", dtRegistro: "", tipoPesagem: "",
  });

  useEffect(() => {
    if (isOpen && registro) {
      setView("details");
      setForm({
        peso:             registro.peso ?? "",
        condicaoCorporal: registro.condicaoCorporal ?? "",
        corPelagem:       registro.corPelagem ?? "",
        formatoChifre:    registro.formatoChifre ?? "",
        porteCorporal:    registro.porteCorporal ?? "",
        dtRegistro:       toDateInput(registro.dtRegistro),
        tipoPesagem:      registro.tipoPesagem ?? "",
      });
    }
  }, [isOpen, registro]);

  const invalidar = () => {
    queryClient.invalidateQueries({ queryKey: ["dados-zootecnicos"] });
    onMutated?.();
  };

  // ── Mutações ─────────────────────────────────────────────────────────────────

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDadoZootecnicoDTO }) =>
      dadosZootecnicosService.update(id, data),
    onSuccess: () => {
      toast.success("Registro atualizado com sucesso.");
      invalidar();
      setView("details");
    },
    onError: () => toast.error("Erro ao atualizar registro."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => dadosZootecnicosService.delete(id),
    onSuccess: () => {
      toast.success("Registro removido com sucesso.");
      invalidar();
      onClose();
    },
    onError: () => toast.error("Erro ao remover registro."),
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) => dadosZootecnicosService.restore(id),
    onSuccess: () => {
      toast.success("Registro restaurado com sucesso.");
      invalidar();
      onClose();
    },
    onError: () => toast.error("Erro ao restaurar registro."),
  });

  if (!registro) return null;

  const isDeleted = !!registro.deletedAt;
  const ecc = toNumber(registro.condicaoCorporal);
  const eccStyle = getEccStyle(ecc);

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      id: registro.idZootec,
      data: {
        peso:             toNumber(form.peso),
        condicaoCorporal: toNumber(form.condicaoCorporal),
        corPelagem:       form.corPelagem || undefined,
        formatoChifre:    form.formatoChifre || undefined,
        porteCorporal:    form.porteCorporal || undefined,
        dtRegistro:       form.dtRegistro,
        tipoPesagem:      form.tipoPesagem || undefined,
      },
    });
  };

  const titles: Record<View, string> = {
    details:          "Registro Zootécnico",
    edit:             "Editar Registro",
    "confirm-delete": "Remover Registro",
  };

  // ─── View: Detalhes ──────────────────────────────────────────────────────────

  const DetailsView = (
    <div className="flex flex-col gap-6">

      {/* Badges */}
      <div className="flex items-center flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
          <Scale className="w-3.5 h-3.5" />
          {registro.tipoPesagem || "Pesagem"}
        </span>
        {isDeleted && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 text-zinc-500 rounded-full text-xs font-semibold">
            <XCircle className="w-3.5 h-3.5" />
            Removido
          </span>
        )}
      </div>

      {/* Peso em destaque */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Peso</p>
        <p className="text-2xl font-bold text-zinc-900">{toNumber(registro.peso).toFixed(2)} kg</p>
      </div>

      {/* Grid de informações */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        <InfoField label="Escore Corporal (ECC)">
          <span className={`font-semibold ${eccStyle.text}`}>{ecc.toFixed(2)}</span>
          <span className="text-zinc-400 font-normal"> / 5.0</span>
        </InfoField>
        <InfoField label="Data de Registro">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
            {formatDate(registro.dtRegistro)}
          </span>
        </InfoField>
        <InfoField label="Formato do Chifre">{registro.formatoChifre || "—"}</InfoField>
        <InfoField label="Porte Corporal">
          <span className="flex items-center gap-1.5">
            <Ruler className="w-3.5 h-3.5 text-zinc-400" />
            {registro.porteCorporal || "—"}
          </span>
        </InfoField>
        <InfoField label="Cor da Pelagem">{registro.corPelagem || "—"}</InfoField>
        <InfoField label="Tipo de Pesagem">{registro.tipoPesagem || "—"}</InfoField>
      </div>

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
          <Button
            variant="outline"
            size="sm"
            isLoading={restoreMutation.isPending}
            onClick={() => restoreMutation.mutate(registro.idZootec)}
          >
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

        {/* Data de registro */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-700">Data de Registro</label>
          <input
            type="date"
            required
            value={form.dtRegistro}
            onChange={e => setForm(f => ({ ...f, dtRegistro: e.target.value }))}
            className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#ce7d0a] focus:border-transparent"
          />
        </div>

        {/* Peso */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-700">Peso (kg)</label>
          <input
            type="number"
            required
            step="0.01"
            min="0"
            value={form.peso}
            onChange={e => setForm(f => ({ ...f, peso: e.target.value }))}
            className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#ce7d0a] focus:border-transparent"
          />
        </div>

        {/* Escore corporal */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-700">Escore Corporal (ECC)</label>
          <input
            type="number"
            required
            step="0.01"
            min="0"
            max="5"
            value={form.condicaoCorporal}
            onChange={e => setForm(f => ({ ...f, condicaoCorporal: e.target.value }))}
            className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#ce7d0a] focus:border-transparent"
          />
        </div>

        {/* Cor da pelagem */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-700">Cor da Pelagem</label>
          <input
            type="text"
            value={form.corPelagem}
            onChange={e => setForm(f => ({ ...f, corPelagem: e.target.value }))}
            className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#ce7d0a] focus:border-transparent"
          />
        </div>

        {/* Formato do chifre */}
        <SuggestField
          label="Formato do Chifre"
          value={form.formatoChifre}
          onChange={v => setForm(f => ({ ...f, formatoChifre: v }))}
          options={FORMATOS_CHIFRE}
          listId="zootec-formato-chifre"
        />

        {/* Porte corporal */}
        <SuggestField
          label="Porte Corporal"
          value={form.porteCorporal}
          onChange={v => setForm(f => ({ ...f, porteCorporal: v }))}
          options={PORTES}
          listId="zootec-porte"
        />

        {/* Tipo de pesagem */}
        <SuggestField
          label="Tipo de Pesagem"
          value={form.tipoPesagem}
          onChange={v => setForm(f => ({ ...f, tipoPesagem: v }))}
          options={TIPOS_PESAGEM}
          listId="zootec-tipo-pesagem"
        />
      </div>

      <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-100">
        <Button type="button" variant="outline" onClick={() => setView("details")} disabled={updateMutation.isPending}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" isLoading={updateMutation.isPending}>
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
          O registro de{" "}
          <span className="font-semibold text-zinc-700">{toNumber(registro.peso).toFixed(2)} kg</span>{" "}
          de{" "}
          <span className="font-semibold text-zinc-700">{formatDate(registro.dtRegistro)}</span>{" "}
          será removido. Você pode restaurá-lo depois na aba de registros removidos.
        </p>
      </div>
      <div className="flex gap-3 w-full">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => setView("details")}
          disabled={deleteMutation.isPending}
        >
          Cancelar
        </Button>
        <Button
          variant="danger"
          className="flex-1"
          isLoading={deleteMutation.isPending}
          onClick={() => deleteMutation.mutate(registro.idZootec)}
        >
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
