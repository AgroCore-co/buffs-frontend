"use client";

import React, { useState } from "react";
import { useAlimentacaoDef, useAlimentacaoRegistro } from "@/hooks/useAlimentacao";
import { AlimentacaoRegistro, AlimentacaoDef } from "@/services/alimentacao.service";
import { useGrupos } from "@/hooks/useGrupos";
import { Grupo } from "@/services/grupos.service";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  AlertCircle, 
  X,
  Wheat,
  History,
  Calendar,
  Scale
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

interface AlimentacaoTabProps {
  idPropriedade: string;
}

type SubTab = "registros" | "tipos";

export default function AlimentacaoTab({ idPropriedade }: AlimentacaoTabProps) {
  // ==========================================================================
  // ESTADOS GERAIS
  // ==========================================================================
  const [activeTab, setActiveTab] = useState<SubTab>("registros");
  const [page, setPage] = useState(1);
  const limit = 10;

  // ==========================================================================
  // HOOKS E DADOS
  // ==========================================================================
  const { 
    getByPropriedade: getRegistros, 
    createRegistro, isCreatingRegistro,
    updateRegistro, isUpdatingRegistro,
    deleteRegistro, isDeletingRegistro 
  } = useAlimentacaoRegistro();

  const { 
    getByPropriedade: getTipos, 
    createDef, isCreatingDef,
    updateDef, isUpdatingDef,
    deleteDef, isDeletingDef 
  } = useAlimentacaoDef();

  // Para popular os selects no formulário de registo
  const { getByPropriedade: getGrupos } = useGrupos();
  const { data: resGrupos } = getGrupos(idPropriedade, 1, 100);
  const { data: resTiposSelect } = getTipos(idPropriedade, 1, 100);
  
  const gruposList = resGrupos?.data || [];
  const tiposSelectList = resTiposSelect?.data || [];

  // Dados das tabelas baseados na tab ativa
  const { data: resRegistros, isLoading: loadReg } = getRegistros(idPropriedade, page, limit, { enabled: activeTab === "registros" });
  const { data: resTipos, isLoading: loadTipos } = getTipos(idPropriedade, page, limit, { enabled: activeTab === "tipos" });

  const registros = resRegistros?.data || [];
  const metaRegistros = resRegistros?.meta || { totalPages: 1, hasNextPage: false, hasPrevPage: false, page: 1 };

  const tipos = resTipos?.data || [];
  const metaTipos = resTipos?.meta || { totalPages: 1, hasNextPage: false, hasPrevPage: false, page: 1 };

  const isLoading = activeTab === "registros" ? loadReg : loadTipos;
  const currentMeta = activeTab === "registros" ? metaRegistros : metaTipos;

  // ==========================================================================
  // ESTADOS DOS MODAIS
  // ==========================================================================
  const [isRegistroModalOpen, setIsRegistroModalOpen] = useState(false);
  const [isTipoModalOpen, setIsTipoModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [selectedItem, setSelectedItem] = useState<AlimentacaoRegistro | AlimentacaoDef | null>(null);

  // Formulários
  const [formRegistro, setFormRegistro] = useState({
    id_grupo: "",
    id_aliment_def: "",
    quantidade: "",
    unidade_medida: "kg",
    freq_dia: 1,
  });

  const [formTipo, setFormTipo] = useState({
    tipo_alimentacao: "",
    descricao: "",
  });

  // ==========================================================================
  // HANDLERS - REGISTOS
  // ==========================================================================
  const handleOpenRegistro = (item?: AlimentacaoRegistro) => {
    if (item) {
      setSelectedItem(item);
      setFormRegistro({
        id_grupo: item.idGrupo,
        id_aliment_def: item.idAlimentDef,
        quantidade: item.quantidade.toString(),
        unidade_medida: item.unidadeMedida,
        freq_dia: item.freqDia,
      });
    } else {
      setSelectedItem(null);
      setFormRegistro({ id_grupo: "", id_aliment_def: "", quantidade: "", unidade_medida: "kg", freq_dia: 1 });
    }
    setIsRegistroModalOpen(true);
  };

  const handleSubmitRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formRegistro,
        id_propriedade: idPropriedade,
        quantidade: Number(formRegistro.quantidade),
      };

      if (selectedItem) {
        await updateRegistro({ id: selectedItem.idRegistro, data: payload });
      } else {
        await createRegistro(payload);
      }
      closeAllModals();
    } catch (error) {
      console.error("Erro ao salvar registo:", error);
    }
  };

  // ==========================================================================
  // HANDLERS - TIPOS DE ALIMENTO
  // ==========================================================================
  const handleOpenTipo = (item?: AlimentacaoDef) => {
    if (item) {
      setSelectedItem(item);
      setFormTipo({ tipo_alimentacao: item.tipoAlimentacao, descricao: item.descricao || "" });
    } else {
      setSelectedItem(null);
      setFormTipo({ tipo_alimentacao: "", descricao: "" });
    }
    setIsTipoModalOpen(true);
  };

  const handleSubmitTipo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...formTipo, id_propriedade: idPropriedade };
      
      if (selectedItem) {
        await updateDef({ id: selectedItem.idAlimentDef, data: payload });
      } else {
        await createDef(payload);
      }
      closeAllModals();
    } catch (error) {
      console.error("Erro ao salvar tipo:", error);
    }
  };

  // ==========================================================================
  // HANDLERS - EXCLUSÃO E UTILIDADE
  // ==========================================================================
  const handleOpenDelete = (item: AlimentacaoRegistro | AlimentacaoDef) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    try {
      if (activeTab === "registros") {
        await deleteRegistro(selectedItem.idRegistro);
      } else {
        await deleteDef(selectedItem.idAlimentDef);
      }
      closeAllModals();
    } catch (error) {
      console.error("Erro ao excluir:", error);
    }
  };

  const closeAllModals = () => {
    setIsRegistroModalOpen(false);
    setIsTipoModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedItem(null);
  };

  // ==========================================================================
  // RENDERIZAÇÃO
  // ==========================================================================
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* HEADER DA TAB */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 tracking-tight">Gestão de Alimentação</h2>
          <p className="text-sm text-zinc-500 mt-1">Registe as ocorrências diárias e gira o seu catálogo de rações e silagens.</p>
        </div>
        <button
          onClick={() => activeTab === "registros" ? handleOpenRegistro() : handleOpenTipo()}
          className="flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          {activeTab === "registros" ? "Novo Registo" : "Novo Alimento"}
        </button>
      </div>

      {/* SUB-TABS (Navegação Interna) */}
      <div className="flex items-center gap-6 border-b border-zinc-200">
        <button
          onClick={() => { setActiveTab("registros"); setPage(1); }}
          className={`pb-3 text-sm font-medium transition-colors relative flex items-center gap-2 ${
            activeTab === "registros" ? "text-zinc-900" : "text-zinc-500 hover:text-zinc-700"
          }`}
        >
          <History className="w-4 h-4" />
          Histórico Diário
          {activeTab === "registros" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-zinc-900 rounded-t-full" />}
        </button>
        <button
          onClick={() => { setActiveTab("tipos"); setPage(1); }}
          className={`pb-3 text-sm font-medium transition-colors relative flex items-center gap-2 ${
            activeTab === "tipos" ? "text-zinc-900" : "text-zinc-500 hover:text-zinc-700"
          }`}
        >
          <Wheat className="w-4 h-4" />
          Tipos de Alimento
          {activeTab === "tipos" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-zinc-900 rounded-t-full" />}
        </button>
      </div>

      {/* LOADING STATE */}
      {isLoading ? (
        <div className="w-full min-h-[300px] flex items-center justify-center border border-zinc-200 rounded-xl bg-zinc-50/50">
          <div className="flex flex-col items-center gap-2 text-zinc-400">
            <div className="w-6 h-6 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin" />
            <span className="text-sm font-medium">A carregar dados...</span>
          </div>
        </div>
      ) : (
        /* TABELA DINÂMICA */
        <DataTable
          isEmpty={activeTab === "registros" ? registros.length === 0 : tipos.length === 0}
          pagination={{
            page: currentMeta.page,
            totalPages: currentMeta.totalPages,
            hasNextPage: currentMeta.hasNextPage,
            hasPrevPage: currentMeta.hasPrevPage,
            onPageChange: setPage,
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
                  onClick={() => activeTab === "registros" ? handleOpenRegistro() : handleOpenTipo()}
                  className="bg-zinc-100 hover:bg-zinc-200 text-zinc-900 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  {activeTab === "registros" ? "Adicionar primeiro registo" : "Criar primeiro alimento"}
                </button>
              }
            />
          }
        >
          {/* HEADERS DA TABELA */}
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

          {/* CORPO DA TABELA */}
          <TableBody>
            {activeTab === "registros" && registros.map((reg: AlimentacaoRegistro) => (
              <TableRow key={reg.idRegistro}>
                <TableCell>
                  <span className="text-sm font-semibold text-zinc-900">{reg.grupo?.nomeGrupo || "Desconhecido"}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-zinc-700">{reg.alimentacaodef?.tipoAlimentacao || "Desconhecido"}</span>
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
                    {new Date(reg.createdAt).toLocaleDateString('pt-PT')}
                  </span>
                </TableCell>
                <TableCell align="right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => handleOpenRegistro(reg)} className="p-1.5 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-md">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleOpenDelete(reg)} className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-md">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {activeTab === "tipos" && tipos.map((tipo: AlimentacaoDef) => (
              <TableRow key={tipo.idAlimentDef}>
                <TableCell>
                  <span className="text-sm font-semibold text-zinc-900">{tipo.tipoAlimentacao}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-zinc-500 max-w-xs truncate block" title={tipo.descricao}>
                    {tipo.descricao || "-"}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-zinc-500">
                    {new Date(tipo.createdAt).toLocaleDateString('pt-PT')}
                  </span>
                </TableCell>
                <TableCell align="right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => handleOpenTipo(tipo)} className="p-1.5 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-md">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleOpenDelete(tipo)} className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-md">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </DataTable>
      )}

      {/* ========================================================================== */}
      {/* MODAL: CRIAR / EDITAR REGISTO */}
      {/* ========================================================================== */}
      {isRegistroModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-zinc-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-zinc-100">
              <h3 className="text-base font-semibold text-zinc-900">
                {selectedItem ? "Editar Registo" : "Novo Registo de Alimentação"}
              </h3>
              <button onClick={closeAllModals} className="text-zinc-400 hover:text-zinc-600 p-1 rounded-md hover:bg-zinc-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmitRegistro} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700">Grupo de Manejo</label>
                <select
                  required
                  value={formRegistro.id_grupo}
                  onChange={(e) => setFormRegistro({ ...formRegistro, id_grupo: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:ring-2 focus:ring-zinc-900"
                >
                  <option value="" disabled>Selecione um grupo</option>
                  {gruposList.map((g: Grupo) => (
                    <option key={g.idGrupo} value={g.idGrupo}>{g.nomeGrupo}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700">Tipo de Alimento</label>
                <select
                  required
                  value={formRegistro.id_aliment_def}
                  onChange={(e) => setFormRegistro({ ...formRegistro, id_aliment_def: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:ring-2 focus:ring-zinc-900"
                >
                  <option value="" disabled>Selecione o alimento</option>
                  {tiposSelectList.map((t: AlimentacaoDef) => (
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
                    value={formRegistro.quantidade}
                    onChange={(e) => setFormRegistro({ ...formRegistro, quantidade: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900"
                    placeholder="Ex: 50.5"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-700">Unidade</label>
                  <select
                    required
                    value={formRegistro.unidade_medida}
                    onChange={(e) => setFormRegistro({ ...formRegistro, unidade_medida: e.target.value })}
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
                  value={formRegistro.freq_dia}
                  onChange={(e) => setFormRegistro({ ...formRegistro, freq_dia: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900"
                  placeholder="Ex: 2 (vezes ao dia)"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button type="button" onClick={closeAllModals} className="px-4 py-2 text-sm font-medium text-zinc-700 border border-zinc-300 rounded-lg hover:bg-zinc-50">
                  Cancelar
                </button>
                <button type="submit" disabled={isCreatingRegistro || isUpdatingRegistro} className="px-4 py-2 text-sm font-medium text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 disabled:opacity-70 flex items-center gap-2">
                  {(isCreatingRegistro || isUpdatingRegistro) && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  Salvar Registo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================== */}
      {/* MODAL: CRIAR / EDITAR TIPO DE ALIMENTO */}
      {/* ========================================================================== */}
      {isTipoModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-zinc-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-zinc-100">
              <h3 className="text-base font-semibold text-zinc-900">
                {selectedItem ? "Editar Alimento" : "Novo Tipo de Alimento"}
              </h3>
              <button onClick={closeAllModals} className="text-zinc-400 hover:text-zinc-600 p-1 rounded-md">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmitTipo} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700">Nome / Tipo do Alimento</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Silagem de Milho, Ração Inicial..."
                  value={formTipo.tipo_alimentacao}
                  onChange={(e) => setFormTipo({ ...formTipo, tipo_alimentacao: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700">Descrição (Opcional)</label>
                <textarea
                  rows={3}
                  placeholder="Detalhes nutricionais, proporções, etc."
                  value={formTipo.descricao}
                  onChange={(e) => setFormTipo({ ...formTipo, descricao: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900 resize-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button type="button" onClick={closeAllModals} className="px-4 py-2 text-sm font-medium text-zinc-700 border border-zinc-300 rounded-lg hover:bg-zinc-50">
                  Cancelar
                </button>
                <button type="submit" disabled={isCreatingDef || isUpdatingDef} className="px-4 py-2 text-sm font-medium text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 disabled:opacity-70 flex items-center gap-2">
                  {(isCreatingDef || isUpdatingDef) && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  Salvar Alimento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================== */}
      {/* MODAL EXCLUIR (Partilhado) */}
      {/* ========================================================================== */}
      {isDeleteModalOpen && selectedItem && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-zinc-200 animate-in zoom-in-95 duration-200 p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 mb-1">Confirmar Exclusão</h3>
            <p className="text-sm text-zinc-500 mb-6">
              Tem a certeza que deseja eliminar o {activeTab === "registros" ? "registo" : "alimento"} 
              <span className="font-semibold text-zinc-700 block mt-1">
                {activeTab === "registros" 
                  ? `${selectedItem.alimentacaodef?.tipoAlimentacao} (${selectedItem.quantidade}${selectedItem.unidadeMedida})` 
                  : selectedItem.tipoAlimentacao}
              </span>
            </p>
            
            <div className="flex flex-col gap-2">
              <button
                onClick={handleDelete}
                disabled={isDeletingRegistro || isDeletingDef}
                className="w-full py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {(isDeletingRegistro || isDeletingDef) && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                Sim, excluir
              </button>
              <button onClick={closeAllModals} className="w-full py-2.5 text-sm font-medium text-zinc-700 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}