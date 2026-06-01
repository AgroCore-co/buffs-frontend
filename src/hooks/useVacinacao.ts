// ==========================================
// Imports e Query Keys
// ==========================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  vacinacaoService,
  VacinacaoDTO,
  PaginacaoParams,
} from '@/services/vacinacao.service';

export const VACINACAO_QUERY_KEYS = {
  all: ['vacinacao'] as const,
  allWithDeleted: ['vacinacao', 'deleted', 'all'] as const,
  byId: (id: string) => ['vacinacao', id] as const,
  byBufalo: (idBufalo: string, params?: PaginacaoParams) =>
    ['vacinacao', 'bufalo', idBufalo, params] as const,
  vacinasByBufalo: (idBufalo: string, params?: PaginacaoParams) =>
    ['vacinacao', 'bufalo', idBufalo, 'vacinas', params] as const,
};

// ==========================================
// Hook Principal — Mutações
// ==========================================

export function useVacinacao() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: ({ idBufalo, data }: { idBufalo: string; data: VacinacaoDTO }) =>
      vacinacaoService.create(idBufalo, data),
    onSuccess: (_, { idBufalo }) => {
      queryClient.invalidateQueries({ queryKey: ['vacinacao', 'bufalo', idBufalo] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<VacinacaoDTO> }) =>
      vacinacaoService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: VACINACAO_QUERY_KEYS.byId(id) });
      queryClient.invalidateQueries({ queryKey: VACINACAO_QUERY_KEYS.all });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => vacinacaoService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VACINACAO_QUERY_KEYS.all });
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) => vacinacaoService.restore(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: VACINACAO_QUERY_KEYS.byId(id) });
      queryClient.invalidateQueries({ queryKey: VACINACAO_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: VACINACAO_QUERY_KEYS.allWithDeleted });
    },
  });

  return {
    createVacinacao: createMutation.mutateAsync,
    isCreatingVacinacao: createMutation.isPending,

    updateVacinacao: updateMutation.mutateAsync,
    isUpdatingVacinacao: updateMutation.isPending,

    deleteVacinacao: deleteMutation.mutateAsync,
    isDeletingVacinacao: deleteMutation.isPending,

    restoreVacinacao: restoreMutation.mutateAsync,
    isRestoringVacinacao: restoreMutation.isPending,
  };
}

// ==========================================
// Hooks Individuais de Query
// ==========================================

export function useVacinacaoById(id?: string) {
  return useQuery({
    queryKey: VACINACAO_QUERY_KEYS.byId(id!),
    queryFn: () => vacinacaoService.getById(id!),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
}

export function useVacinacaoByBufalo(idBufalo?: string, params?: PaginacaoParams) {
  return useQuery({
    queryKey: VACINACAO_QUERY_KEYS.byBufalo(idBufalo!, params),
    queryFn: () => vacinacaoService.getByBufalo(idBufalo!, params),
    enabled: !!idBufalo,
    staleTime: 2 * 60 * 1000,
  });
}

export function useVacinasByBufalo(idBufalo?: string, params?: PaginacaoParams) {
  return useQuery({
    queryKey: VACINACAO_QUERY_KEYS.vacinasByBufalo(idBufalo!, params),
    queryFn: () => vacinacaoService.getVacinasByBufalo(idBufalo!, params),
    enabled: !!idBufalo,
    staleTime: 2 * 60 * 1000,
  });
}

export function useVacinacaoWithDeleted() {
  return useQuery({
    queryKey: VACINACAO_QUERY_KEYS.allWithDeleted,
    queryFn: vacinacaoService.getAllIncludingDeleted,
    staleTime: 2 * 60 * 1000,
  });
}
