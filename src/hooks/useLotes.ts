// ==========================================
// Imports e Query Keys
// ==========================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  lotesService,
  CreateLoteDTO,
  UpdateLoteDTO,
} from '@/services/lotes.service';

/**
 * Chaves de cache centralizadas para o domínio de Lotes (Piquetes).
 */
export const LOTES_QUERY_KEYS = {
  lists: () => ['lotes', 'propriedade'] as const,
  byPropriedade: (idPropriedade: string) => [...LOTES_QUERY_KEYS.lists(), idPropriedade] as const,
  byId: (id: string) => ['lotes', id] as const,
};

// ==========================================
// Hooks Individuais de Query
// ==========================================

/**
 * Busca todos os lotes atrelados a uma propriedade.
 */
export function useLotesByPropriedade(idPropriedade?: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: LOTES_QUERY_KEYS.byPropriedade(idPropriedade!),
    queryFn: () => lotesService.getByPropriedade(idPropriedade!),
    enabled: !!idPropriedade && options?.enabled !== false,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Busca um lote específico por UUID.
 */
export function useLotesById(id?: string) {
  return useQuery({
    queryKey: LOTES_QUERY_KEYS.byId(id!),
    queryFn: () => lotesService.getById(id!),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
}

// ==========================================
// Hook de Mutações de Lotes
// ==========================================

export function useLotes() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: CreateLoteDTO) => lotesService.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: LOTES_QUERY_KEYS.byPropriedade(variables.idPropriedade) });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLoteDTO }) =>
      lotesService.update(id, data),
    onSuccess: (_, { id, data }) => {
      queryClient.invalidateQueries({ queryKey: LOTES_QUERY_KEYS.byId(id) });
      if (data.idPropriedade) {
        queryClient.invalidateQueries({ queryKey: LOTES_QUERY_KEYS.byPropriedade(data.idPropriedade) });
      } else {
        queryClient.invalidateQueries({ queryKey: LOTES_QUERY_KEYS.lists() });
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => lotesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LOTES_QUERY_KEYS.lists() });
    },
  });

  return {
    createLote: createMutation.mutateAsync,
    isCreatingLote: createMutation.isPending,

    updateLote: updateMutation.mutateAsync,
    isUpdatingLote: updateMutation.isPending,

    deleteLote: deleteMutation.mutateAsync,
    isDeletingLote: deleteMutation.isPending,
  };
}
