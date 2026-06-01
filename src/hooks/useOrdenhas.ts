// ==========================================
// Imports e Query Keys
// ==========================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ordenhasService,
  CreateOrdenhaDTO,
  UpdateOrdenhaDTO,
  PaginacaoParams,
} from '@/services/ordenhas.service';

export const ORDENHAS_QUERY_KEYS = {
  all: ['ordenhas'] as const,
  byId: (id: string) => ['ordenhas', id] as const,
  byBufala: (idBufala: string, params?: PaginacaoParams) =>
    ['ordenhas', 'bufala', idBufala, params] as const,
  byCiclo: (idCiclo: string, params?: PaginacaoParams) =>
    ['ordenhas', 'ciclo', idCiclo, params] as const,
  resumoBufala: (idBufala: string) => ['ordenhas', 'bufala', idBufala, 'resumo-producao'] as const,
};

// ==========================================
// Hooks Individuais de Query
// ==========================================

export function useOrdenhasByBufala(idBufala?: string, params?: PaginacaoParams) {
  return useQuery({
    queryKey: ORDENHAS_QUERY_KEYS.byBufala(idBufala!, params),
    queryFn: () => ordenhasService.getByBufala(idBufala!, params),
    enabled: !!idBufala,
    staleTime: 2 * 60 * 1000,
  });
}

export function useOrdenhasByCiclo(
  idCiclo?: string,
  params?: PaginacaoParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ORDENHAS_QUERY_KEYS.byCiclo(idCiclo!, params),
    queryFn: () => ordenhasService.getByCiclo(idCiclo!, params),
    enabled: !!idCiclo && options?.enabled !== false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useResumoProducaoBufala(idBufala?: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ORDENHAS_QUERY_KEYS.resumoBufala(idBufala!),
    queryFn: () => ordenhasService.getResumoProducao(idBufala!),
    enabled: !!idBufala && options?.enabled !== false,
    staleTime: 2 * 60 * 1000,
  });
}

// ==========================================
// Hook de Mutações de Ordenhas
// ==========================================

export function useOrdenhas() {
  const queryClient = useQueryClient();

  const invalidarBufala = (idBufala?: string) => {
    queryClient.invalidateQueries({ queryKey: ORDENHAS_QUERY_KEYS.all });
    if (idBufala) {
      queryClient.invalidateQueries({ queryKey: ['ordenhas', 'bufala', idBufala] });
    }
  };

  const createMutation = useMutation({
    mutationFn: (data: CreateOrdenhaDTO) => ordenhasService.create(data),
    onSuccess: (_, variables) => invalidarBufala(variables.idBufala),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrdenhaDTO }) =>
      ordenhasService.update(id, data),
    onSuccess: (_, { id, data }) => {
      queryClient.invalidateQueries({ queryKey: ORDENHAS_QUERY_KEYS.byId(id) });
      invalidarBufala(data.idBufala);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => ordenhasService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDENHAS_QUERY_KEYS.all });
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) => ordenhasService.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDENHAS_QUERY_KEYS.all });
    },
  });

  return {
    createOrdenha: createMutation.mutateAsync,
    isCreatingOrdenha: createMutation.isPending,

    updateOrdenha: updateMutation.mutateAsync,
    isUpdatingOrdenha: updateMutation.isPending,

    deleteOrdenha: deleteMutation.mutateAsync,
    isDeletingOrdenha: deleteMutation.isPending,

    restoreOrdenha: restoreMutation.mutateAsync,
    isRestoringOrdenha: restoreMutation.isPending,
  };
}
