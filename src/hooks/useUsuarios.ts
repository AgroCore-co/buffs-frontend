// ==========================================
// Imports e Query Keys
// ==========================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usuariosService, UpdateUsuarioDTO, UpdateCargoDTO } from '@/services/usuarios.service';

export const USUARIOS_QUERY_KEYS = {
  all: ['usuarios'] as const,
  me: ['usuarios', 'me'] as const,
  funcionarios: ['usuarios', 'funcionarios'] as const,
  funcionariosByPropriedade: (id: string) => ['usuarios', 'funcionarios', 'propriedade', id] as const,
  byId: (id: string) => ['usuarios', id] as const,
};

// ==========================================
// Hook para Listagem e Mutações
// ==========================================

export function useUsuarios() {
  const queryClient = useQueryClient();

  const meQuery = useQuery({
    queryKey: USUARIOS_QUERY_KEYS.me,
    queryFn: usuariosService.getMe,
    staleTime: 5 * 60 * 1000,
  });

  const allQuery = useQuery({
    queryKey: USUARIOS_QUERY_KEYS.all,
    queryFn: usuariosService.getAll,
    staleTime: 2 * 60 * 1000,
  });

  const funcionariosQuery = useQuery({
    queryKey: USUARIOS_QUERY_KEYS.funcionarios,
    queryFn: usuariosService.getFuncionarios,
    staleTime: 2 * 60 * 1000,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUsuarioDTO }) => usuariosService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: USUARIOS_QUERY_KEYS.byId(id) });
      queryClient.invalidateQueries({ queryKey: USUARIOS_QUERY_KEYS.all });
    },
  });

  const updateCargoMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCargoDTO }) => usuariosService.updateCargo(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: USUARIOS_QUERY_KEYS.byId(id) });
      queryClient.invalidateQueries({ queryKey: USUARIOS_QUERY_KEYS.funcionarios });
      queryClient.invalidateQueries({ queryKey: USUARIOS_QUERY_KEYS.all });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usuariosService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USUARIOS_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: USUARIOS_QUERY_KEYS.funcionarios });
    },
  });

  const desvincularFuncionarioMutation = useMutation({
    mutationFn: ({ idUsuario, idPropriedade }: { idUsuario: string; idPropriedade: string }) =>
      usuariosService.desvincularFuncionarioPropriedade(idUsuario, idPropriedade),
    onSuccess: (_, { idPropriedade }) => {
      queryClient.invalidateQueries({ queryKey: USUARIOS_QUERY_KEYS.funcionariosByPropriedade(idPropriedade) });
      queryClient.invalidateQueries({ queryKey: USUARIOS_QUERY_KEYS.funcionarios });
    },
  });

  return {
    me: meQuery.data,
    isLoadingMe: meQuery.isLoading,
    usuarios: allQuery.data,
    isLoadingUsuarios: allQuery.isLoading,
    funcionarios: funcionariosQuery.data,
    isLoadingFuncionarios: funcionariosQuery.isLoading,
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

// ==========================================
// Hooks Individuais de Query
// ==========================================

export function useFuncionariosByPropriedade(idPropriedade?: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: USUARIOS_QUERY_KEYS.funcionariosByPropriedade(idPropriedade!),
    queryFn: () => usuariosService.getFuncionariosByPropriedade(idPropriedade!),
    enabled: !!idPropriedade && options?.enabled !== false,
    staleTime: 2 * 60 * 1000,
  });
}

export function useUsuario(id?: string) {
  return useQuery({
    queryKey: USUARIOS_QUERY_KEYS.byId(id!),
    queryFn: () => usuariosService.getById(id!),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
}