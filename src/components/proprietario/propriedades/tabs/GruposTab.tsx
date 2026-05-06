"use client";

import React, { useState } from "react";
import { useGrupos } from "@/hooks/useGrupos";
import { Grupo } from "@/services/grupos.service";
import { Button, IconButton } from "@/components/ui/Button";
import { 
  Plus, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  AlertCircle,
  Hash,
  X,
  Calendar
} from "lucide-react";

interface GruposTabProps {
  idPropriedade: string;
}

export default function GruposTab({ idPropriedade }: GruposTabProps) {
  // ==========================================================================
  // ESTADOS E HOOKS
  // ==========================================================================
  const [page, setPage] = useState(1);
  const limit = 12;

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
  const [selectedGrupo, setSelectedGrupo] = useState<Grupo | null>(null);

  // Estados do Formulário
  const [formData, setFormData] = useState({ nomeGrupo: "", color: "#000000" });

  // ==========================================================================
  // HANDLERS
  // ==========================================================================
  const handleOpenCreate = () => {
    setSelectedGrupo(null);
    setFormData({ nomeGrupo: "", color: "#3b82f6" });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (grupo: Grupo) => {
    setSelectedGrupo(grupo);
    setFormData({ nomeGrupo: grupo.nomeGrupo, color: grupo.color });
    setIsModalOpen(true);
  };

  const handleOpenDelete = (grupo: Grupo) => {
    setSelectedGrupo(grupo);
    setIsModalOpen(false); // Fecha o modal de edição antes de abrir o de exclusão
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 tracking-tight">Grupos de Manejo</h2>
          <p className="text-sm text-zinc-500 mt-1">Gerencie as divisões e categorias do rebanho nesta propriedade.</p>
        </div>
        <Button
          onClick={handleOpenCreate}
          variant="primary"
          icon={Plus}
          className="shrink-0"
        >
          Novo Grupo
        </Button>
      </div>

      {/* CONTEÚDO DOS CARDS */}
      {grupos.length === 0 ? (
        // Empty State
        <div className="w-full flex flex-col items-center justify-center p-12 border border-dashed border-zinc-300 rounded-xl bg-zinc-50/50 text-center">
          <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
            <Hash className="w-6 h-6 text-zinc-400" />
          </div>
          <h3 className="text-sm font-semibold text-zinc-900 mb-1">Nenhum grupo encontrado</h3>
          <p className="text-sm text-zinc-500 max-w-sm mb-4">
            Você ainda não tem grupos cadastrados para esta propriedade. Crie o primeiro grupo para organizar seu rebanho.
          </p>
          <Button
            onClick={handleOpenCreate}
            variant="secondary"
          >
            Criar meu primeiro grupo
          </Button>
        </div>
      ) : (
        <>
          {/* Grid de Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {grupos.map((grupo: Grupo) => (
              <div 
                key={grupo.idGrupo} 
                onClick={() => handleOpenEdit(grupo)}
                className="bg-white border border-zinc-200 rounded-lg p-3.5 shadow-sm hover:shadow-md hover:border-zinc-300 transition-all group flex flex-col h-full cursor-pointer"
              >
                {/* Topo do Card (Cor) */}
                <div className="flex items-start justify-between mb-2.5">
                  <div 
                    className="w-6 h-6 rounded-md shadow-sm border border-black/10" 
                    style={{ backgroundColor: grupo.color }}
                  />
                </div>

                {/* Informações do Grupo */}
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-zinc-900 line-clamp-1" title={grupo.nomeGrupo}>
                    {grupo.nomeGrupo}
                  </h3>
                  <span className="text-[11px] font-mono text-zinc-500 mt-0.5 block">
                    {grupo.color.toUpperCase()}
                  </span>
                </div>

                {/* Rodapé do Card (Data) */}
                <div className="mt-3 pt-3 border-t border-zinc-100 flex items-center text-[11px] text-zinc-500 gap-1.5">
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Criado em {new Date(grupo.createdAt).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Paginação */}
          {meta.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-zinc-200">
              <span className="text-sm text-zinc-500">
                Página <span className="font-medium text-zinc-900">{page}</span> de <span className="font-medium text-zinc-900">{meta.totalPages}</span>
              </span>
              <div className="flex items-center gap-2">
                <IconButton
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={!meta.hasPrevPage}
                  variant="outline"
                  icon={ChevronLeft}
                  aria-label="Página anterior"
                />
                <IconButton
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!meta.hasNextPage}
                  variant="outline"
                  icon={ChevronRight}
                  aria-label="Próxima página"
                />
              </div>
            </div>
          )}
        </>
      )}

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
              <IconButton 
                onClick={handleCloseModals} 
                variant="ghost" 
                size="sm"
                icon={X} 
                aria-label="Fechar modal" 
              />
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
                  className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#ce7d0a] focus:border-transparent transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700">Cor de Identificação no Mapa</label>
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-zinc-300 shadow-sm shrink-0 cursor-pointer focus-within:ring-2 focus-within:ring-[#ce7d0a]">
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
                    className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-sm font-mono text-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#ce7d0a] focus:border-transparent transition-all"
                  />
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">Utilize o seletor ou digite o código HEX.</p>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-zinc-100 mt-6 -mx-5 px-5 pt-5">
                {selectedGrupo ? (
                  <Button
                    type="button"
                    variant="ghost"
                    icon={Trash2}
                    onClick={() => handleOpenDelete(selectedGrupo)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <span className="hidden sm:inline">Excluir</span>
                  </Button>
                ) : (
                  <div /> // Div vazia para manter o alinhamento flex quando for "Novo Grupo"
                )}
                
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseModals}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isCreatingGrupo || isUpdatingGrupo}
                  >
                    {selectedGrupo ? "Salvar" : "Criar grupo"}
                  </Button>
                </div>
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
              <Button
                onClick={handleDelete}
                variant="danger"
                isLoading={isDeletingGrupo}
                className="w-full"
              >
                Sim, excluir grupo
              </Button>
              <Button
                onClick={handleCloseModals}
                disabled={isDeletingGrupo}
                variant="outline"
                className="w-full"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}