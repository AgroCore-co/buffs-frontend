// ==========================================
// Imports e Query Keys
// ==========================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  dadosSanitariosService,
  DadoSanitarioDTO,
  PaginacaoParams,
  FrequenciaDoencasParams,
} from '@/services/dados-sanitarios.service';

export const DADOS_SANITARIOS_QUERY_KEYS = {
  all: ['dados-sanitarios'] as const,
  allWithDeleted: ['dados-sanitarios', 'deleted', 'all'] as const,
  byId: (id: string) => ['dados-sanitarios', id] as const,
  byBufalo: (idBufalo: string, params?: PaginacaoParams) =>
    ['dados-sanitarios', 'bufalo', idBufalo, params] as const,
  byPropriedade: (idPropriedade: string, params?: PaginacaoParams) =>
    ['dados-sanitarios', 'propriedade', idPropriedade, params] as const,
  frequenciaDoencas: (idPropriedade: string, params?: FrequenciaDoencasParams) =>
    ['dados-sanitarios', 'propriedade', idPropriedade, 'frequencia-doencas', params] as const,
  sugestoesDoencas: (termo?: string, limit?: number) =>
    ['dados-sanitarios', 'doencas', 'sugestoes', termo, limit] as const,
};

// ==========================================
// Hook Principal — Listagem e Mutações
// ==========================================

export function useDadosSanitarios(params?: PaginacaoParams) {
  const queryClient = useQueryClient();

  const allQuery = useQuery({
    queryKey: [...DADOS_SANITARIOS_QUERY_KEYS.all, params],
    queryFn: () => dadosSanitariosService.getAll(params),
    staleTime: 2 * 60 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: (data: DadoSanitarioDTO) => dadosSanitariosService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DADOS_SANITARIOS_QUERY_KEYS.all });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<DadoSanitarioDTO> }) =>
      dadosSanitariosService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: DADOS_SANITARIOS_QUERY_KEYS.byId(id) });
      queryClient.invalidateQueries({ queryKey: DADOS_SANITARIOS_QUERY_KEYS.all });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => dadosSanitariosService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DADOS_SANITARIOS_QUERY_KEYS.all });
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) => dadosSanitariosService.restore(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: DADOS_SANITARIOS_QUERY_KEYS.byId(id) });
      queryClient.invalidateQueries({ queryKey: DADOS_SANITARIOS_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: DADOS_SANITARIOS_QUERY_KEYS.allWithDeleted });
    },
  });

  return {
    dadosSanitarios: allQuery.data?.data ?? [],
    meta: allQuery.data?.meta,
    totalDadosSanitarios: allQuery.data?.meta.total ?? 0,
    isLoadingDadosSanitarios: allQuery.isLoading,
    isErrorDadosSanitarios: allQuery.isError,
    errorDadosSanitarios: allQuery.error,

    createDadoSanitario: createMutation.mutateAsync,
    isCreatingDadoSanitario: createMutation.isPending,

    updateDadoSanitario: updateMutation.mutateAsync,
    isUpdatingDadoSanitario: updateMutation.isPending,

    deleteDadoSanitario: deleteMutation.mutateAsync,
    isDeletingDadoSanitario: deleteMutation.isPending,

    restoreDadoSanitario: restoreMutation.mutateAsync,
    isRestoringDadoSanitario: restoreMutation.isPending,
  };
}

// ==========================================
// Hooks Individuais de Query
// ==========================================

export function useDadoSanitario(id?: string) {
  return useQuery({
    queryKey: DADOS_SANITARIOS_QUERY_KEYS.byId(id!),
    queryFn: () => dadosSanitariosService.getById(id!),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
}

export function useDadosSanitariosByBufalo(idBufalo?: string, params?: PaginacaoParams) {
  return useQuery({
    queryKey: DADOS_SANITARIOS_QUERY_KEYS.byBufalo(idBufalo!, params),
    queryFn: () => dadosSanitariosService.getByBufalo(idBufalo!, params),
    enabled: !!idBufalo,
    staleTime: 2 * 60 * 1000,
  });
}

export function useDadosSanitariosByPropriedade(idPropriedade?: string, params?: PaginacaoParams) {
  return useQuery({
    queryKey: DADOS_SANITARIOS_QUERY_KEYS.byPropriedade(idPropriedade!, params),
    queryFn: () => dadosSanitariosService.getByPropriedade(idPropriedade!, params),
    enabled: !!idPropriedade,
    staleTime: 2 * 60 * 1000,
  });
}

export function useFrequenciaDoencas(idPropriedade?: string, params?: FrequenciaDoencasParams) {
  return useQuery({
    queryKey: DADOS_SANITARIOS_QUERY_KEYS.frequenciaDoencas(idPropriedade!, params),
    queryFn: () => dadosSanitariosService.getFrequenciaDoencas(idPropriedade!, params),
    enabled: !!idPropriedade,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSugestoesDoencas(termo?: string, limit?: number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: DADOS_SANITARIOS_QUERY_KEYS.sugestoesDoencas(termo, limit),
    queryFn: () => dadosSanitariosService.getSugestoesDoencas(termo, limit),
    enabled: options?.enabled !== false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useDadosSanitariosWithDeleted() {
  return useQuery({
    queryKey: DADOS_SANITARIOS_QUERY_KEYS.allWithDeleted,
    queryFn: dadosSanitariosService.getAllIncludingDeleted,
    staleTime: 2 * 60 * 1000,
  });
}
