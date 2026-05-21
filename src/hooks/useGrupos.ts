// ==========================================
// Imports e Query Keys
// ==========================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  gruposService,
  CreateGrupoDTO,
  UpdateGrupoDTO,
} from '@/services/grupos.service';

/**
 * Chaves de cache centralizadas para o domínio de Grupos.
 */
export const GRUPOS_QUERY_KEYS = {
  all: ['grupos', 'all'] as const,
  lists: () => ['grupos', 'propriedade'] as const,
  byPropriedade: (idPropriedade: string, page: number, limit: number) =>
    [...GRUPOS_QUERY_KEYS.lists(), idPropriedade, page, limit] as const,
  byId: (id: string) => ['grupos', id] as const,
  deleted: ['grupos', 'deleted'] as const,
};

// ==========================================
// Hooks Individuais de Query
// ==========================================

export function useGruposAll() {
  return useQuery({
    queryKey: GRUPOS_QUERY_KEYS.all,
    queryFn: () => gruposService.getAll(),
    staleTime: 2 * 60 * 1000,
  });
}

export function useGruposByPropriedade(
  idPropriedade?: string,
  page: number = 1,
  limit: number = 10,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: GRUPOS_QUERY_KEYS.byPropriedade(idPropriedade!, page, limit),
    queryFn: () => gruposService.getByPropriedade(idPropriedade!, page, limit),
    enabled: !!idPropriedade && options?.enabled !== false,
    staleTime: 2 * 60 * 1000,
  });
}

export function useGruposById(id?: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: GRUPOS_QUERY_KEYS.byId(id!),
    queryFn: () => gruposService.getById(id!),
    enabled: !!id && options?.enabled !== false,
    staleTime: 2 * 60 * 1000,
  });
}

export function useGruposAllDeleted() {
  return useQuery({
    queryKey: GRUPOS_QUERY_KEYS.deleted,
    queryFn: () => gruposService.getAllDeleted(),
    staleTime: 2 * 60 * 1000,
  });
}

// ==========================================
// Hook de Mutações de Grupos
// ==========================================

export function useGrupos() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: CreateGrupoDTO) => gruposService.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [...GRUPOS_QUERY_KEYS.lists(), variables.idPropriedade] });
      queryClient.invalidateQueries({ queryKey: GRUPOS_QUERY_KEYS.all });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGrupoDTO }) =>
      gruposService.update(id, data),
    onSuccess: (_, { id, data }) => {
      queryClient.invalidateQueries({ queryKey: GRUPOS_QUERY_KEYS.byId(id) });
      if (data.idPropriedade) {
        queryClient.invalidateQueries({ queryKey: [...GRUPOS_QUERY_KEYS.lists(), data.idPropriedade] });
      } else {
        queryClient.invalidateQueries({ queryKey: GRUPOS_QUERY_KEYS.lists() });
      }
      queryClient.invalidateQueries({ queryKey: GRUPOS_QUERY_KEYS.all });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => gruposService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grupos'] });
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) => gruposService.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grupos'] });
    },
  });

  return {
    createGrupo: createMutation.mutateAsync,
    isCreatingGrupo: createMutation.isPending,

    updateGrupo: updateMutation.mutateAsync,
    isUpdatingGrupo: updateMutation.isPending,

    deleteGrupo: deleteMutation.mutateAsync,
    isDeletingGrupo: deleteMutation.isPending,

    restoreGrupo: restoreMutation.mutateAsync,
    isRestoringGrupo: restoreMutation.isPending,
  };
}
