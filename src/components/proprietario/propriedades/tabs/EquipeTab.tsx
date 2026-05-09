"use client";

import React, { useState } from "react";
import { useUsuarios } from "@/hooks/useUsuarios";
import { Cargo, Usuario } from "@/services/usuarios.service";
import { 
  Users, 
  UserCog, 
  UserMinus, 
  AlertCircle, 
  X,
  Phone
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

interface EquipeTabProps {
  idPropriedade: string;
}

export default function EquipeTab({ idPropriedade }: EquipeTabProps) {
  // ==========================================================================
  // ESTADOS E HOOKS
  // ==========================================================================
  const { 
    getFuncionariosByPropriedade, 
    updateCargo, isUpdatingCargo,
    desvincularFuncionario, isDesvinculandoFuncionario 
  } = useUsuarios();

  // A API retorna diretamente a lista de usuários, sem paginação neste endpoint
  const { data: funcionarios = [], isLoading } = getFuncionariosByPropriedade(idPropriedade);

  // Estados dos Modais
  const [isEditRoleModalOpen, setIsEditRoleModalOpen] = useState(false);
  const [isUnlinkModalOpen, setIsUnlinkModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);

  // Estado do Formulário de Edição
  const [selectedCargo, setSelectedCargo] = useState<Cargo | "">("");

  // ==========================================================================
  // HANDLERS
  // ==========================================================================
  const handleOpenEditRole = (user: Usuario) => {
    setSelectedUser(user);
    setSelectedCargo(user.cargo);
    setIsEditRoleModalOpen(true);
  };

  const handleOpenUnlink = (user: Usuario) => {
    setSelectedUser(user);
    setIsUnlinkModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsEditRoleModalOpen(false);
    setIsUnlinkModalOpen(false);
    setSelectedUser(null);
    setSelectedCargo("");
  };

  const handleUpdateCargo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !selectedCargo) return;
    
    try {
      await updateCargo({ 
        id: selectedUser.id_usuario, 
        data: { cargo: selectedCargo as Exclude<Cargo, 'PROPRIETARIO'> } 
      });
      handleCloseModals();
    } catch (error) {
      console.error("Erro ao atualizar cargo:", error);
    }
  };

  const handleUnlink = async () => {
    if (!selectedUser) return;
    try {
      await desvincularFuncionario({ 
        idUsuario: selectedUser.id_usuario, 
        idPropriedade 
      });
      handleCloseModals();
    } catch (error) {
      console.error("Erro ao desvincular funcionário:", error);
    }
  };

  // ==========================================================================
  // UTILS
  // ==========================================================================
  const renderCargoBadge = (cargo: Cargo) => {
    const badges: Record<string, { bg: string, text: string, label: string }> = {
      PROPRIETARIO: { bg: "bg-zinc-900", text: "text-white", label: "Proprietário" },
      GERENTE: { bg: "bg-blue-100", text: "text-blue-700", label: "Gerente" },
      VETERINARIO: { bg: "bg-teal-100", text: "text-teal-700", label: "Veterinário" },
      FUNCIONARIO: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Funcionário" },
    };

    const style = badges[cargo] || badges.FUNCIONARIO;

    return (
      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${style.bg} ${style.text}`}>
        {style.label}
      </span>
    );
  };

  // ==========================================================================
  // RENDERIZAÇÃO
  // ==========================================================================
  if (isLoading) {
    return (
      <div className="w-full min-h-[400px] flex items-center justify-center border border-zinc-200 rounded-xl bg-zinc-50/50">
        <div className="flex flex-col items-center gap-2 text-zinc-400">
          <div className="w-6 h-6 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin" />
          <span className="text-sm font-medium">Carregando equipe...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* HEADER DA TAB */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 tracking-tight">Equipe da Propriedade</h2>
          <p className="text-sm text-zinc-500 mt-1">Gerencie os funcionários, gerentes e veterinários com acesso a esta fazenda.</p>
        </div>
        {/* Placeholder para uma futura feature de convidar usuários, já que o endpoint de vincular não existe no swagger no momento */}
        {/* <button className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          Convidar Membro
        </button> */}
      </div>

      {/* COMPONENTE DA TABELA GENÉRICA */}
      <DataTable
        isEmpty={funcionarios.length === 0}
        emptyState={
          <TableEmptyState
            icon={Users}
            title="Nenhuma equipe vinculada"
            description="Ainda não há funcionários vinculados a esta propriedade. Os usuários podem ser vinculados no painel central de gestão de equipe."
          />
        }
      >
        <TableHeader>
          <TableHead>Membro da Equipe</TableHead>
          <TableHead>Contato</TableHead>
          <TableHead>Cargo / Nível de Acesso</TableHead>
          <TableHead align="right">Ações</TableHead>
        </TableHeader>
        <TableBody>
          {funcionarios.map((user: Usuario) => (
            <TableRow key={user.id_usuario}>
              <TableCell>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-zinc-900">{user.nome}</span>
                  <span className="text-xs text-zinc-500 mt-0.5">{user.email}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-600">
                    <Phone className="w-3 h-3 text-zinc-400" />
                    {user.telefone || "Não informado"}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {renderCargoBadge(user.cargo)}
              </TableCell>
              <TableCell align="right">
                <div className="flex items-center justify-end gap-2">
                  {user.cargo !== 'PROPRIETARIO' && (
                    <>
                      <button 
                        onClick={() => handleOpenEditRole(user)}
                        className="p-1.5 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        title="Alterar cargo"
                      >
                        <UserCog className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleOpenUnlink(user)}
                        className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Desvincular da propriedade"
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </DataTable>

      {/* ========================================================================== */}
      {/* MODAL EDITAR CARGO */}
      {/* ========================================================================== */}
      {isEditRoleModalOpen && selectedUser && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-zinc-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-zinc-100">
              <div>
                <h3 className="text-base font-semibold text-zinc-900">Alterar Cargo</h3>
                <p className="text-xs text-zinc-500 mt-0.5">Editando acesso de {selectedUser.nome}</p>
              </div>
              <button onClick={handleCloseModals} className="text-zinc-400 hover:text-zinc-600 p-1 rounded-md hover:bg-zinc-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateCargo} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700">Novo Cargo / Nível de Acesso</label>
                <select
                  required
                  value={selectedCargo}
                  onChange={(e) => setSelectedCargo(e.target.value as Cargo)}
                  className="w-full px-3 py-2.5 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                >
                  <option value="" disabled>Selecione um cargo</option>
                  <option value="GERENTE">Gerente</option>
                  <option value="VETERINARIO">Veterinário</option>
                  <option value="FUNCIONARIO">Funcionário</option>
                </select>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Gerentes têm amplo acesso à propriedade. Veterinários acessam dados sanitários. Funcionários têm acesso restrito de operação.
                </p>
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
                  disabled={isUpdatingCargo || selectedCargo === selectedUser.cargo}
                  className="px-4 py-2 text-sm font-medium text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-70 flex items-center gap-2"
                >
                  {isUpdatingCargo && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  Salvar novo cargo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================== */}
      {/* MODAL DESVINCULAR */}
      {/* ========================================================================== */}
      {isUnlinkModalOpen && selectedUser && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-zinc-200 animate-in zoom-in-95 duration-200 p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 mb-1">Desvincular usuário?</h3>
            <p className="text-sm text-zinc-500 mb-6">
              Tem certeza que deseja remover <span className="font-semibold text-zinc-700">{selectedUser.nome}</span> desta propriedade? Ele perderá imediatamente o acesso aos dados desta fazenda.
            </p>
            
            <div className="flex flex-col gap-2">
              <button
                onClick={handleUnlink}
                disabled={isDesvinculandoFuncionario}
                className="w-full py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isDesvinculandoFuncionario && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                Sim, remover acesso
              </button>
              <button
                onClick={handleCloseModals}
                disabled={isDesvinculandoFuncionario}
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