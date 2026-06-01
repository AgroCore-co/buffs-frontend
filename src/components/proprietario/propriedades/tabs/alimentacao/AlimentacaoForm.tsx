"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { AlimentacaoRegistro, AlimentacaoDef } from "@/services/alimentacao.service";
import { Grupo } from "@/services/grupos.service";

export interface RegistroFormData {
  idGrupo: string;
  idAlimentDef: string;
  quantidade: string;
  unidadeMedida: string;
  freqDia: number;
}

interface AlimentacaoFormRegistroProps {
  isOpen: boolean;
  initialRegistro: AlimentacaoRegistro | null;
  gruposList: Grupo[];
  tiposSelectList: AlimentacaoDef[];
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (data: RegistroFormData) => void;
}

export function AlimentacaoFormRegistro({
  isOpen,
  initialRegistro,
  gruposList,
  tiposSelectList,
  isSubmitting,
  onClose,
  onSubmit,
}: AlimentacaoFormRegistroProps) {
  const defaultForm: RegistroFormData = {
    idGrupo: "",
    idAlimentDef: "",
    quantidade: "",
    unidadeMedida: "kg",
    freqDia: 1,
  };

  const [form, setForm] = useState<RegistroFormData>(defaultForm);

  useEffect(() => {
    if (!isOpen) return;
    if (initialRegistro) {
      setForm({
        idGrupo: initialRegistro.idGrupo,
        idAlimentDef: initialRegistro.idAlimentDef,
        quantidade: initialRegistro.quantidade.toString(),
        unidadeMedida: initialRegistro.unidadeMedida,
        freqDia: initialRegistro.freqDia,
      });
    } else {
      setForm(defaultForm);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-zinc-200 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-zinc-100">
          <h3 className="text-base font-semibold text-zinc-900">
            {initialRegistro ? "Editar Registo" : "Novo Registo de Alimentação"}
          </h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 p-1 rounded-md hover:bg-zinc-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700">Grupo de Manejo</label>
            <select
              required
              value={form.idGrupo}
              onChange={(e) => setForm({ ...form, idGrupo: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:ring-2 focus:ring-zinc-900"
            >
              <option value="" disabled>Selecione um grupo</option>
              {gruposList.map((g) => (
                <option key={g.idGrupo} value={g.idGrupo}>{g.nomeGrupo}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700">Tipo de Alimento</label>
            <select
              required
              value={form.idAlimentDef}
              onChange={(e) => setForm({ ...form, idAlimentDef: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:ring-2 focus:ring-zinc-900"
            >
              <option value="" disabled>Selecione o alimento</option>
              {tiposSelectList.map((t) => (
                <option key={t.idAlimentDef} value={t.idAlimentDef}>{t.tipoAlimentacao}</option>
              ))}
            </select>
            {tiposSelectList.length === 0 && (
              <p className="text-[11px] text-amber-600 mt-1">Precisa de cadastrar tipos de alimento primeiro.</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700">Quantidade</label>
              <input
                type="number"
                step="0.01"
                required
                value={form.quantidade}
                onChange={(e) => setForm({ ...form, quantidade: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900"
                placeholder="Ex: 50.5"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700">Unidade</label>
              <select
                required
                value={form.unidadeMedida}
                onChange={(e) => setForm({ ...form, unidadeMedida: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900"
              >
                <option value="kg">Quilogramas (kg)</option>
                <option value="g">Gramas (g)</option>
                <option value="L">Litros (L)</option>
                <option value="un">Unidades</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700">Frequência Diária</label>
            <input
              type="number"
              min="1"
              required
              value={form.freqDia}
              onChange={(e) => setForm({ ...form, freqDia: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900"
              placeholder="Ex: 2 (vezes ao dia)"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-zinc-700 border border-zinc-300 rounded-lg hover:bg-zinc-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 disabled:opacity-70 flex items-center gap-2"
            >
              {isSubmitting && (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              Salvar Registo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export interface TipoFormData {
  tipoAlimentacao: string;
  descricao: string;
}

interface AlimentacaoFormTipoProps {
  isOpen: boolean;
  initialTipo: AlimentacaoDef | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (data: TipoFormData) => void;
}

export function AlimentacaoFormTipo({
  isOpen,
  initialTipo,
  isSubmitting,
  onClose,
  onSubmit,
}: AlimentacaoFormTipoProps) {
  const [form, setForm] = useState<TipoFormData>({ tipoAlimentacao: "", descricao: "" });

  useEffect(() => {
    if (!isOpen) return;
    setForm(
      initialTipo
        ? { tipoAlimentacao: initialTipo.tipoAlimentacao, descricao: initialTipo.descricao || "" }
        : { tipoAlimentacao: "", descricao: "" }
    );
  }, [isOpen, initialTipo]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-zinc-200 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-zinc-100">
          <h3 className="text-base font-semibold text-zinc-900">
            {initialTipo ? "Editar Alimento" : "Novo Tipo de Alimento"}
          </h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 p-1 rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700">Nome / Tipo do Alimento</label>
            <input
              type="text"
              required
              placeholder="Ex: Silagem de Milho, Ração Inicial..."
              value={form.tipoAlimentacao}
              onChange={(e) => setForm({ ...form, tipoAlimentacao: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700">Descrição (Opcional)</label>
            <textarea
              rows={3}
              placeholder="Detalhes nutricionais, proporções, etc."
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900 resize-none"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-zinc-700 border border-zinc-300 rounded-lg hover:bg-zinc-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 disabled:opacity-70 flex items-center gap-2"
            >
              {isSubmitting && (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              Salvar Alimento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
