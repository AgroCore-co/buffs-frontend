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
  // Base para buscar as listas atreladas a uma propriedade
  lists: () => ['grupos', 'propriedade'] as const,
  // Cache paginado por propriedade
  byPropriedade: (idPropriedade: string, page: number, limit: number) => 
    [...GRUPOS_QUERY_KEYS.lists(), idPropriedade, page, limit] as const,
  byId: (id: string) => ['grupos', id] as const,
  deleted: ['grupos', 'deleted'] as const,
};

// ==========================================
// Hook de Orquestração de Grupos
// ==========================================

export function useGrupos() {
  const queryClient = useQueryClient();

  // ==========================================
  // QUERIES
  // ==========================================

  const getAll = () => useQuery({
    queryKey: GRUPOS_QUERY_KEYS.all,
    queryFn: () => gruposService.getAll(),
    staleTime: 2 * 60 * 1000,
  });

  const getByPropriedade = (idPropriedade: string, page: number = 1, limit: number = 10, options?: { enabled?: boolean }) => useQuery({
    queryKey: GRUPOS_QUERY_KEYS.byPropriedade(idPropriedade, page, limit),
    queryFn: () => gruposService.getByPropriedade(idPropriedade, page, limit),
    enabled: !!idPropriedade && options?.enabled !== false,
    staleTime: 2 * 60 * 1000,
  });

  const getById = (id: string) => useQuery({
    queryKey: GRUPOS_QUERY_KEYS.byId(id),
    queryFn: () => gruposService.getById(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });

  const getAllDeleted = () => useQuery({
    queryKey: GRUPOS_QUERY_KEYS.deleted,
    queryFn: () => gruposService.getAllDeleted(),
    staleTime: 2 * 60 * 1000,
  });

  // ==========================================
  // MUTATIONS
  // ==========================================

  const createMutation = useMutation({
    mutationFn: (data: CreateGrupoDTO) => gruposService.create(data),
    onSuccess: (_, variables) => {
      // Invalida o cache para recarregar a lista paginada e a lista geral
      queryClient.invalidateQueries({ queryKey: [...GRUPOS_QUERY_KEYS.lists(), variables.idPropriedade] });
      queryClient.invalidateQueries({ queryKey: GRUPOS_QUERY_KEYS.all });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGrupoDTO }) =>
      gruposService.update(id, data),
    onSuccess: (_, { id, data }) => {
      // Atualiza o item específico
      queryClient.invalidateQueries({ queryKey: GRUPOS_QUERY_KEYS.byId(id) });
      
      // Invalida a lista da propriedade afetada, se enviada no DTO, ou generaliza
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
      // Ação de exclusão afeta a árvore inteira ('grupos')
      queryClient.invalidateQueries({ queryKey: ['grupos'] }); 
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) => gruposService.restore(id),
    onSuccess: () => {
      // Assim como exclusão, restauração muda o estado de toda a árvore
      queryClient.invalidateQueries({ queryKey: ['grupos'] });
    },
  });

  // ==========================================
  // Retorno do Hook (Facade)
  // ==========================================

  return {
    // Buscas (Read)
    getAll,
    getByPropriedade,
    getById,
    getAllDeleted,

    // Mutações (Create, Update, Delete)
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