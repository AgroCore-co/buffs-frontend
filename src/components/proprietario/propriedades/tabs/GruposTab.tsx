"use client";

import React, { useState } from "react";
import { useGrupos } from "@/hooks/useGrupos";
import { 
  Plus, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  AlertCircle,
  Hash,
  X 
} from "lucide-react";

import { 
  DataTable, 
  TableHeader, 
  TableHead, 
  TableBody, 
  TableRow, 
  TableCell, 
  TableEmptyState 
} from "@/components/ui/DataTable";

interface GruposTabProps {
  idPropriedade: string;
}

export default function GruposTab({ idPropriedade }: GruposTabProps) {
  // ==========================================================================
  // ESTADOS E HOOKS
  // ==========================================================================
  const [page, setPage] = useState(1);
  const limit = 10;

  const { 
    getByPropriedade, 
    createGrupo, isCreatingGrupo,
    updateGrupo, isUpdatingGrupo,
    deleteGrupo, isDeletingGrupo 
  } = useGrupos();

  const { data: response, isLoading } = getByPropriedade(idPropriedade, page, limit);
  const grupos = response?.data || [];
  const meta = response?.meta || { totalPages: 1, hasNextPage: false, hasPrevPage: false };

  // Estados dos Modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedGrupo, setSelectedGrupo] = useState<any | null>(null);

  // Estados do Formulário
  const [formData, setFormData] = useState({ nomeGrupo: "", color: "#000000" });

  // ==========================================================================
  // HANDLERS
  // ==========================================================================
  const handleOpenCreate = () => {
    setSelectedGrupo(null);
    setFormData({ nomeGrupo: "", color: "#3b82f6" }); // Azul padrão
    setIsModalOpen(true);
  };

  const handleOpenEdit = (grupo: any) => {
    setSelectedGrupo(grupo);
    setFormData({ nomeGrupo: grupo.nomeGrupo, color: grupo.color });
    setIsModalOpen(true);
  };

  const handleOpenDelete = (grupo: any) => {
    setSelectedGrupo(grupo);
    setIsDeleteModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedGrupo(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedGrupo) {
        await updateGrupo({ 
          id: selectedGrupo.idGrupo, 
          data: { ...formData, idPropriedade } 
        });
      } else {
        await createGrupo({ ...formData, idPropriedade });
      }
      handleCloseModals();
    } catch (error) {
      console.error("Erro ao salvar grupo:", error);
    }
  };

  const handleDelete = async () => {
    if (!selectedGrupo) return;
    try {
      await deleteGrupo(selectedGrupo.idGrupo);
      handleCloseModals();
    } catch (error) {
      console.error("Erro ao excluir grupo:", error);
    }
  };

  // ==========================================================================
  // RENDERIZAÇÃO
  // ==========================================================================
  if (isLoading) {
    return (
      <div className="w-full min-h-[400px] flex items-center justify-center border border-zinc-200 rounded-xl bg-zinc-50/50">
        <div className="flex flex-col items-center gap-2 text-zinc-400">
          <div className="w-6 h-6 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin" />
          <span className="text-sm font-medium">Carregando grupos...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* HEADER DA TAB */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 tracking-tight">Grupos de Manejo</h2>
          <p className="text-sm text-zinc-500 mt-1">Gerencie as divisões e categorias do rebanho nesta propriedade.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Novo Grupo
        </button>
      </div>

      {/* COMPONENTE DA TABELA GENÉRICA */}
      <DataTable
        isEmpty={grupos.length === 0}
        pagination={{
          page: meta.page,
          totalPages: meta.totalPages,
          hasNextPage: meta.hasNextPage,
          hasPrevPage: meta.hasPrevPage,
          onPageChange: setPage,
        }}
        emptyState={
          <TableEmptyState
            icon={Hash}
            title="Nenhum grupo encontrado"
            description="Você ainda não tem grupos cadastrados para esta propriedade. Crie o primeiro grupo para organizar seu rebanho."
            action={
              <button
                onClick={handleOpenCreate}
                className="bg-zinc-100 hover:bg-zinc-200 text-zinc-900 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Criar meu primeiro grupo
              </button>
            }
          />
        }
      >
        <TableHeader>
          <TableHead>Grupo</TableHead>
          <TableHead>Identificação Visual</TableHead>
          <TableHead>Data de Criação</TableHead>
          <TableHead align="right">Ações</TableHead>
        </TableHeader>
        <TableBody>
          {grupos.map((grupo: any) => (
            <TableRow key={grupo.idGrupo}>
              <TableCell>
                <span className="text-sm font-semibold text-zinc-900">{grupo.nomeGrupo}</span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-full shadow-sm border border-black/10" 
                    style={{ backgroundColor: grupo.color }}
                  />
                  <span className="text-xs font-mono text-zinc-500">{grupo.color.toUpperCase()}</span>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm text-zinc-500">
                  {new Date(grupo.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </TableCell>
              <TableCell align="right">
                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleOpenEdit(grupo)}
                    className="p-1.5 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    title="Editar grupo"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleOpenDelete(grupo)}
                    className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Excluir grupo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </DataTable>

      {/* ========================================================================== */}
      {/* MODAL CRIAR/EDITAR */}
      {/* ========================================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-zinc-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-zinc-100">
              <h3 className="text-base font-semibold text-zinc-900">
                {selectedGrupo ? "Editar Grupo" : "Novo Grupo"}
              </h3>
              <button onClick={handleCloseModals} className="text-zinc-400 hover:text-zinc-600 p-1 rounded-md hover:bg-zinc-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700">Nome do Grupo</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Recria, Secagem, etc."
                  value={formData.nomeGrupo}
                  onChange={(e) => setFormData({ ...formData, nomeGrupo: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700">Cor de Identificação no Mapa</label>
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-zinc-300 shadow-sm shrink-0 cursor-pointer focus-within:ring-2 focus-within:ring-zinc-900">
                    <input
                      type="color"
                      required
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer"
                    />
                  </div>
                  <input
                    type="text"
                    value={formData.color.toUpperCase()}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    pattern="^#[0-9A-Fa-f]{6}$"
                    placeholder="#000000"
                    className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-sm font-mono text-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                  />
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">Utilize o seletor ou digite o código HEX.</p>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCloseModals}
                  className="px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 rounded-lg hover:bg-zinc-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCreatingGrupo || isUpdatingGrupo}
                  className="px-4 py-2 text-sm font-medium text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-70 flex items-center gap-2"
                >
                  {(isCreatingGrupo || isUpdatingGrupo) && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  {selectedGrupo ? "Salvar alterações" : "Criar grupo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================== */}
      {/* MODAL EXCLUIR */}
      {/* ========================================================================== */}
      {isDeleteModalOpen && selectedGrupo && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-zinc-200 animate-in zoom-in-95 duration-200 p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 mb-1">Excluir grupo?</h3>
            <p className="text-sm text-zinc-500 mb-6">
              Tem certeza que deseja excluir o grupo <span className="font-semibold text-zinc-700">{selectedGrupo.nomeGrupo}</span>? Esta ação pode afetar o histórico de lotes associados a ele.
            </p>
            
            <div className="flex flex-col gap-2">
              <button
                onClick={handleDelete}
                disabled={isDeletingGrupo}
                className="w-full py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isDeletingGrupo && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                Sim, excluir grupo
              </button>
              <button
                onClick={handleCloseModals}
                disabled={isDeletingGrupo}
                className="w-full py-2.5 text-sm font-medium text-zinc-700 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}