"use client";

import { Plus } from "lucide-react";

type SubTab = "registros" | "tipos";

interface AlimentacaoResumoProps {
  activeTab: SubTab;
  onNew: () => void;
}

export function AlimentacaoResumo({ activeTab, onNew }: AlimentacaoResumoProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 tracking-tight">Gestão de Alimentação</h2>
        <p className="text-sm text-zinc-500 mt-1">
          Registe as ocorrências diárias e gira o seu catálogo de rações e silagens.
        </p>
      </div>
      <button
        onClick={onNew}
        className="flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm shrink-0"
      >
        <Plus className="w-4 h-4" />
        {activeTab === "registros" ? "Novo Registo" : "Novo Alimento"}
      </button>
    </div>
  );
}
