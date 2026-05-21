"use client";

import { Button } from "@/components/ui/Button";
import { MapPin } from "lucide-react";
import { Grupo } from "../types";
import { Lote } from "@/services/lotes.service";
import { BufaloPaginatedResponse } from "@/services/bufalos.service";
import { StatusGrupoResponse, HistoricoGrupoResponse } from "@/services/mov-lote.service";

interface DetailsGrupoHeaderProps {
  grupo: Grupo;
  statusGrupo: StatusGrupoResponse | null;
  isLoadingStatus: boolean;
  isLoadingBufalos: boolean;
  bufalosData: BufaloPaginatedResponse | null;
  historicoGrupo: HistoricoGrupoResponse | null;
  lotes: Lote[];
  onMove: () => void;
  onNavigateToMap: () => void;
}

export function DetailsGrupoHeader({
  grupo,
  statusGrupo,
  isLoadingStatus,
  isLoadingBufalos,
  bufalosData,
  historicoGrupo,
  lotes,
  onMove,
  onNavigateToMap,
}: DetailsGrupoHeaderProps) {
  const getLoteName = (idLote?: string | null) => {
    if (!idLote) return "Desconhecido";
    return lotes?.find((l) => l.idLote === idLote)?.nomeLote || "Desconhecido";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-200">
      <div className="bg-zinc-50 p-6 rounded-xl border border-zinc-100 space-y-5">
        <div className="flex justify-between items-center border-b border-zinc-200/60 pb-4">
          <span className="text-sm font-medium text-zinc-500">Nome do Grupo</span>
          <span className="text-base font-semibold text-zinc-900">{grupo.nomeGrupo}</span>
        </div>
        <div className="flex justify-between items-center border-b border-zinc-200/60 pb-4">
          <span className="text-sm font-medium text-zinc-500">Data de Criação</span>
          <span className="text-sm font-medium text-zinc-900">
            {new Date(grupo.createdAt).toLocaleDateString("pt-BR")}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-zinc-500">Cor Identificadora</span>
          <div className="flex items-center gap-3">
            <span className="text-sm font-mono text-zinc-600 bg-white px-2 py-1 rounded border border-zinc-200">
              {grupo.color.toUpperCase()}
            </span>
            <div
              className="w-8 h-8 rounded-md shadow-sm border border-black/10"
              style={{ backgroundColor: grupo.color }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <h4 className="text-sm font-semibold text-zinc-900 flex justify-between items-center">
          Localização Atual
          <Button
            variant="ghost"
            size="sm"
            onClick={onMove}
            className="text-blue-600 hover:text-blue-700 p-0 hover:bg-transparent"
          >
            Transferir Lote
          </Button>
        </h4>

        {isLoadingStatus ? (
          <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-6 flex items-center justify-center animate-pulse">
            <span className="text-sm text-zinc-500">Buscando status...</span>
          </div>
        ) : statusGrupo?.localizacaoAtual ? (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <MapPin className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h5 className="text-base font-bold text-blue-900">
                {getLoteName(statusGrupo.localizacaoAtual.idLote)}
              </h5>
              <p className="text-sm text-blue-700 mt-1">
                Alocado neste lote há {statusGrupo.localizacaoAtual.diasNoLocal} dias (desde{" "}
                {new Date(statusGrupo.localizacaoAtual.desde).toLocaleDateString("pt-BR")}).
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={onNavigateToMap}
                className="mt-4 bg-white text-blue-700 hover:bg-blue-50"
              >
                Ver no Mapa
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-zinc-50 border border-dashed border-zinc-200 rounded-xl p-6 flex flex-col items-center justify-center text-center">
            <span className="text-sm text-zinc-500 mb-3">
              Este grupo não está alocado em nenhum lote atualmente.
            </span>
            <Button variant="outline" size="sm" onClick={onMove}>
              Definir Localização
            </Button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white border border-zinc-200 rounded-xl p-5 text-center shadow-sm">
            <span className="block text-3xl font-bold text-zinc-900">
              {isLoadingBufalos ? "-" : bufalosData?.meta?.total || 0}
            </span>
            <span className="text-sm text-zinc-500 mt-1 block">Búfalos Vinculados</span>
          </div>
          <div className="bg-white border border-zinc-200 rounded-xl p-5 text-center shadow-sm">
            <span className="block text-3xl font-bold text-zinc-900">
              {historicoGrupo?.totalMovimentacoes || 0}
            </span>
            <span className="text-sm text-zinc-500 mt-1 block">Movimentações no Total</span>
          </div>
        </div>
      </div>
    </div>
  );
}
