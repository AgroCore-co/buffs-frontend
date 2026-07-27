// ==========================================
// Imports e Query Keys
// ==========================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  reproducaoService,
  PaginacaoParams,
  CreateReproducaoDTO,
  UpdateReproducaoDTO,
  ResumoReprodutivoParams,
} from '@/services/reproducao.service';

export const REPRODUCAO_QUERY_KEYS = {
  byPropriedade: (idPropriedade: string, params?: PaginacaoParams) =>
    ['reproducao', 'propriedade', idPropriedade, params] as const,
  byId: (id: string) => ['reproducao', id] as const,
  resumoByBufalo: (idBufalo: string, params?: ResumoReprodutivoParams) =>
    ['reproducao', 'resumo', idBufalo, params] as const,
};

// ==========================================
// Hooks Individuais de Query
// ==========================================

export function useReproducoesByPropriedade(
  idPropriedade?: string,
  params?: PaginacaoParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: REPRODUCAO_QUERY_KEYS.byPropriedade(idPropriedade!, params),
    queryFn: () => reproducaoService.getByPropriedade(idPropriedade!, params),
    enabled: !!idPropriedade && options?.enabled !== false,
    staleTime: 1 * 60 * 1000,
  });
}

export function useReproducaoById(id?: string) {
  return useQuery({
    queryKey: REPRODUCAO_QUERY_KEYS.byId(id!),
    queryFn: () => reproducaoService.getById(id!),
    enabled: !!id,
    staleTime: 1 * 60 * 1000,
  });
}

/**
 * Resumo reprodutivo consolidado de um búfalo (fêmea ou macho), via
 * GET /reproducao/bufalo/:id/resumo. Substitui a antiga busca por
 * propriedade + filtro client-side.
 */
export function useResumoReprodutivo(
  idBufalo?: string,
  params?: ResumoReprodutivoParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: REPRODUCAO_QUERY_KEYS.resumoByBufalo(idBufalo!, params),
    queryFn: () => reproducaoService.getResumoByBufalo(idBufalo!, params),
    enabled: !!idBufalo && options?.enabled !== false,
    staleTime: 1 * 60 * 1000,
  });
}

export function useReproducaoMutations() {
  const queryClient = useQueryClient();

  const invalidate = (idPropriedade?: string) => {
    if (idPropriedade) {
      queryClient.invalidateQueries({
        queryKey: REPRODUCAO_QUERY_KEYS.byPropriedade(idPropriedade),
      });
    }
    queryClient.invalidateQueries({ queryKey: ['reproducao'] });
  };

  const createMutation = useMutation({
    mutationFn: (data: CreateReproducaoDTO) => reproducaoService.create(data),
    onSuccess: (_, variables) => invalidate(variables.idPropriedade),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateReproducaoDTO }) =>
      reproducaoService.update(id, data),
    onSuccess: () => invalidate(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => reproducaoService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reproducao'] }),
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) => reproducaoService.restore(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reproducao'] }),
  });

  return {
    createReproducao: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateReproducao: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteReproducao: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    restoreReproducao: restoreMutation.mutateAsync,
    isRestoring: restoreMutation.isPending,
  };
}
