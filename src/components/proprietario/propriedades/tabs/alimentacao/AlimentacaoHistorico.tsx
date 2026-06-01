"use client";

import { History, Wheat, Calendar, Scale, Edit2, Trash2 } from "lucide-react";
import { AlimentacaoRegistro, AlimentacaoDef } from "@/services/alimentacao.service";
import {
  DataTable,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableEmptyState,
} from "@/components/ui/DataTable";

type SubTab = "registros" | "tipos";

interface Meta {
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface AlimentacaoHistoricoProps {
  activeTab: SubTab;
  onTabChange: (tab: SubTab) => void;
  page: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
  registros: AlimentacaoRegistro[];
  tipos: AlimentacaoDef[];
  metaRegistros: Meta;
  metaTipos: Meta;
  onEditRegistro: (item: AlimentacaoRegistro) => void;
  onEditTipo: (item: AlimentacaoDef) => void;
  onDelete: (item: AlimentacaoRegistro | AlimentacaoDef) => void;
  onNew: () => void;
}

export function AlimentacaoHistorico({
  activeTab,
  onTabChange,
  page: _page,
  onPageChange,
  isLoading,
  registros,
  tipos,
  metaRegistros,
  metaTipos,
  onEditRegistro,
  onEditTipo,
  onDelete,
  onNew,
}: AlimentacaoHistoricoProps) {
  const currentMeta = activeTab === "registros" ? metaRegistros : metaTipos;

  return (
    <>
      {/* Sub-tabs navigation */}
      <div className="flex items-center gap-6 border-b border-zinc-200">
        <button
          onClick={() => { onTabChange("registros"); onPageChange(1); }}
          className={`pb-3 text-sm font-medium transition-colors relative flex items-center gap-2 ${
            activeTab === "registros" ? "text-zinc-900" : "text-zinc-500 hover:text-zinc-700"
          }`}
        >
          <History className="w-4 h-4" />
          Histórico Diário
          {activeTab === "registros" && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-zinc-900 rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => { onTabChange("tipos"); onPageChange(1); }}
          className={`pb-3 text-sm font-medium transition-colors relative flex items-center gap-2 ${
            activeTab === "tipos" ? "text-zinc-900" : "text-zinc-500 hover:text-zinc-700"
          }`}
        >
          <Wheat className="w-4 h-4" />
          Tipos de Alimento
          {activeTab === "tipos" && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-zinc-900 rounded-t-full" />
          )}
        </button>
      </div>

      {isLoading ? (
        <div className="w-full min-h-[300px] flex items-center justify-center border border-zinc-200 rounded-xl bg-zinc-50/50">
          <div className="flex flex-col items-center gap-2 text-zinc-400">
            <div className="w-6 h-6 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin" />
            <span className="text-sm font-medium">A carregar dados...</span>
          </div>
        </div>
      ) : (
        <DataTable
          isEmpty={activeTab === "registros" ? registros.length === 0 : tipos.length === 0}
          pagination={{
            page: currentMeta.page,
            totalPages: currentMeta.totalPages,
            hasNextPage: currentMeta.hasNextPage,
            hasPrevPage: currentMeta.hasPrevPage,
            onPageChange,
          }}
          emptyState={
            <TableEmptyState
              icon={activeTab === "registros" ? Calendar : Wheat}
              title={activeTab === "registros" ? "Nenhum registo encontrado" : "Catálogo vazio"}
              description={
                activeTab === "registros"
                  ? "Não existem históricos de alimentação registados para esta propriedade."
                  : "Ainda não cadastrou os tipos de ração, silagem ou pasto."
              }
              action={
                <button
                  onClick={onNew}
                  className="bg-zinc-100 hover:bg-zinc-200 text-zinc-900 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  {activeTab === "registros" ? "Adicionar primeiro registo" : "Criar primeiro alimento"}
                </button>
              }
            />
          }
        >
          <TableHeader>
            {activeTab === "registros" ? (
              <>
                <TableHead>Grupo de Manejo</TableHead>
                <TableHead>Alimento Fornecido</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Frequência</TableHead>
                <TableHead>Data</TableHead>
                <TableHead align="right">Ações</TableHead>
              </>
            ) : (
              <>
                <TableHead>Tipo de Alimento</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Data de Criação</TableHead>
                <TableHead align="right">Ações</TableHead>
              </>
            )}
          </TableHeader>
          <TableBody>
            {activeTab === "registros" &&
              registros.map((reg) => (
                <TableRow key={reg.idRegistro}>
                  <TableCell>
                    <span className="text-sm font-semibold text-zinc-900">
                      {reg.grupo?.nomeGrupo || "Desconhecido"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-zinc-700">
                      {reg.alimentacaodef?.tipoAlimentacao || "Desconhecido"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md w-fit">
                      <Scale className="w-3.5 h-3.5" />
                      {reg.quantidade} {reg.unidadeMedida}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-zinc-500">{reg.freqDia}x ao dia</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-zinc-500">
                      {new Date(reg.createdAt).toLocaleDateString("pt-PT")}
                    </span>
                  </TableCell>
                  <TableCell align="right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEditRegistro(reg)}
                        className="p-1.5 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(reg)}
                        className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}

            {activeTab === "tipos" &&
              tipos.map((tipo) => (
                <TableRow key={tipo.idAlimentDef}>
                  <TableCell>
                    <span className="text-sm font-semibold text-zinc-900">{tipo.tipoAlimentacao}</span>
                  </TableCell>
                  <TableCell>
                    <span
                      className="text-sm text-zinc-500 max-w-xs truncate block"
                      title={tipo.descricao}
                    >
                      {tipo.descricao || "-"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-zinc-500">
                      {new Date(tipo.createdAt).toLocaleDateString("pt-PT")}
                    </span>
                  </TableCell>
                  <TableCell align="right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEditTipo(tipo)}
                        className="p-1.5 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(tipo)}
                        className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </DataTable>
      )}
    </>
  );
}
