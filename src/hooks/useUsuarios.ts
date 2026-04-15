// ==========================================
// Imports e Query Keys
// ==========================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usuariosService, Usuario, UpdateUsuarioDTO, UpdateCargoDTO } from '@/services/usuarios.service';

export const USUARIOS_QUERY_KEYS = {
  all: ['usuarios'] as const,
  me: ['usuarios', 'me'] as const,
  funcionarios: ['usuarios', 'funcionarios'] as const,
  funcionariosByPropriedade: (id: string) => ['usuarios', 'funcionarios', 'propriedade', id] as const,
  byId: (id: string) => ['usuarios', id] as const,
};

// ==========================================
// Hook de Orquestração de Usuários
// ==========================================

export function useUsuarios() {
  const queryClient = useQueryClient();

  // ==========================================
  // QUERIES
  // ==========================================

  // Perfil do usuário logado
  const meQuery = useQuery({
    queryKey: USUARIOS_QUERY_KEYS.me,
    queryFn: usuariosService.getMe,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Lista geral de usuários
  const allQuery = useQuery({
    queryKey: USUARIOS_QUERY_KEYS.all,
    queryFn: usuariosService.getAll,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });

  // Lista de funcionários de todas as propriedades
  const funcionariosQuery = useQuery({
    queryKey: USUARIOS_QUERY_KEYS.funcionarios,
    queryFn: usuariosService.getFuncionarios,
    staleTime: 2 * 60 * 1000,
  });

  // Busca usuário por ID
  const getById = (id: string) =>
    useQuery({
      queryKey: USUARIOS_QUERY_KEYS.byId(id),
      queryFn: () => usuariosService.getById(id),
      enabled: !!id,
      staleTime: 2 * 60 * 1000,
    });

  // Lista funcionários de uma propriedade específica
  const getFuncionariosByPropriedade = (idPropriedade: string) =>
    useQuery({
      queryKey: USUARIOS_QUERY_KEYS.funcionariosByPropriedade(idPropriedade),
      queryFn: () => usuariosService.getFuncionariosByPropriedade(idPropriedade),
      enabled: !!idPropriedade,
      staleTime: 2 * 60 * 1000,
    });

  // ==========================================
  // MUTATIONS
  // ==========================================

  // Atualizar dados do usuário
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUsuarioDTO }) => usuariosService.update(id, data),
    onSuccess: (_, { id }) => {
      // Invalida cache do usuário e lista geral para refletir a edição
      queryClient.invalidateQueries({ queryKey: USUARIOS_QUERY_KEYS.byId(id) });
      queryClient.invalidateQueries({ queryKey: USUARIOS_QUERY_KEYS.all });
    },
  });

  // Atualizar cargo do funcionário
  const updateCargoMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCargoDTO }) => usuariosService.updateCargo(id, data),
    onSuccess: (_, { id }) => {
      // Invalida listas de funcionários e usuário específico
      queryClient.invalidateQueries({ queryKey: USUARIOS_QUERY_KEYS.byId(id) });
      queryClient.invalidateQueries({ queryKey: USUARIOS_QUERY_KEYS.funcionarios });
      queryClient.invalidateQueries({ queryKey: USUARIOS_QUERY_KEYS.all });
    },
  });

  // Excluir usuário
  const deleteMutation = useMutation({
    mutationFn: (id: string) => usuariosService.delete(id),
    onSuccess: () => {
      // Invalida todas as listas para remover usuário excluído
      queryClient.invalidateQueries({ queryKey: USUARIOS_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: USUARIOS_QUERY_KEYS.funcionarios });
    },
  });

  // Desvincular funcionário de uma propriedade
  const desvincularFuncionarioMutation = useMutation({
    mutationFn: ({ idUsuario, idPropriedade }: { idUsuario: string; idPropriedade: string }) =>
      usuariosService.desvincularFuncionarioPropriedade(idUsuario, idPropriedade),
    onSuccess: (_, { idPropriedade }) => {
      // Invalida lista de funcionários da propriedade e geral
      queryClient.invalidateQueries({ queryKey: USUARIOS_QUERY_KEYS.funcionariosByPropriedade(idPropriedade) });
      queryClient.invalidateQueries({ queryKey: USUARIOS_QUERY_KEYS.funcionarios });
    },
  });

  // ==========================================
  // Retorno do Hook (Facade)
  // ==========================================

  return {
    // Dados e status das queries
    me: meQuery.data,
    isLoadingMe: meQuery.isLoading,
    usuarios: allQuery.data,
    isLoadingUsuarios: allQuery.isLoading,
    funcionarios: funcionariosQuery.data,
    isLoadingFuncionarios: funcionariosQuery.isLoading,
    getById,
    getFuncionariosByPropriedade,

    // Ações de mutação
    updateUsuario: updateMutation.mutateAsync,
    isUpdatingUsuario: updateMutation.isPending,
    updateCargo: updateCargoMutation.mutateAsync,
    isUpdatingCargo: updateCargoMutation.isPending,
    deleteUsuario: deleteMutation.mutateAsync,
    isDeletingUsuario: deleteMutation.isPending,
    desvincularFuncionario: desvincularFuncionarioMutation.mutateAsync,
    isDesvinculandoFuncionario: desvincularFuncionarioMutation.isPending,
  };
}
