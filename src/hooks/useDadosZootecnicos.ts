// ==========================================
// Imports e Query Keys
// ==========================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  dadosZootecnicosService,
  CreateDadoZootecnicoDTO,
  UpdateDadoZootecnicoDTO,
  PaginacaoParams,
} from '@/services/dados-zootecnicos.service';

export const DADOS_ZOOTECNICOS_QUERY_KEYS = {
  all: ['dados-zootecnicos'] as const,
  allWithDeleted: ['dados-zootecnicos', 'deleted', 'all'] as const,
  byId: (id: string) => ['dados-zootecnicos', id] as const,
  byBufalo: (idBufalo: string, params?: PaginacaoParams) =>
    ['dados-zootecnicos', 'bufalo', idBufalo, params] as const,
  byPropriedade: (idPropriedade: string, params?: PaginacaoParams) =>
    ['dados-zootecnicos', 'propriedade', idPropriedade, params] as const,
};

// ==========================================
// Hook Principal — Mutações
// ==========================================

export function useDadosZootecnicos() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: ({ idBufalo, data }: { idBufalo: string; data: CreateDadoZootecnicoDTO }) =>
      dadosZootecnicosService.create(idBufalo, data),
    onSuccess: (_, { idBufalo }) => {
      queryClient.invalidateQueries({ queryKey: ['dados-zootecnicos', 'bufalo', idBufalo] });
      queryClient.invalidateQueries({ queryKey: ['dados-zootecnicos', 'propriedade'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDadoZootecnicoDTO }) =>
      dadosZootecnicosService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: DADOS_ZOOTECNICOS_QUERY_KEYS.byId(id) });
      queryClient.invalidateQueries({ queryKey: DADOS_ZOOTECNICOS_QUERY_KEYS.all });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => dadosZootecnicosService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DADOS_ZOOTECNICOS_QUERY_KEYS.all });
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) => dadosZootecnicosService.restore(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: DADOS_ZOOTECNICOS_QUERY_KEYS.byId(id) });
      queryClient.invalidateQueries({ queryKey: DADOS_ZOOTECNICOS_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: DADOS_ZOOTECNICOS_QUERY_KEYS.allWithDeleted });
    },
  });

  return {
    createDadoZootecnico: createMutation.mutateAsync,
    isCreatingDadoZootecnico: createMutation.isPending,

    updateDadoZootecnico: updateMutation.mutateAsync,
    isUpdatingDadoZootecnico: updateMutation.isPending,

    deleteDadoZootecnico: deleteMutation.mutateAsync,
    isDeletingDadoZootecnico: deleteMutation.isPending,

    restoreDadoZootecnico: restoreMutation.mutateAsync,
    isRestoringDadoZootecnico: restoreMutation.isPending,
  };
}

// ==========================================
// Hooks Individuais de Query
// ==========================================

export function useDadoZootecnico(id?: string) {
  return useQuery({
    queryKey: DADOS_ZOOTECNICOS_QUERY_KEYS.byId(id!),
    queryFn: () => dadosZootecnicosService.getById(id!),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
}

export function useDadosZootecnicosByBufalo(idBufalo?: string, params?: PaginacaoParams) {
  return useQuery({
    queryKey: DADOS_ZOOTECNICOS_QUERY_KEYS.byBufalo(idBufalo!, params),
    queryFn: () => dadosZootecnicosService.getByBufalo(idBufalo!, params),
    enabled: !!idBufalo,
    staleTime: 2 * 60 * 1000,
  });
}

export function useDadosZootecnicosByPropriedade(idPropriedade?: string, params?: PaginacaoParams) {
  return useQuery({
    queryKey: DADOS_ZOOTECNICOS_QUERY_KEYS.byPropriedade(idPropriedade!, params),
    queryFn: () => dadosZootecnicosService.getByPropriedade(idPropriedade!, params),
    enabled: !!idPropriedade,
    staleTime: 2 * 60 * 1000,
  });
}

export function useDadosZootecnicosWithDeleted() {
  return useQuery({
    queryKey: DADOS_ZOOTECNICOS_QUERY_KEYS.allWithDeleted,
    queryFn: dadosZootecnicosService.getAllIncludingDeleted,
    staleTime: 2 * 60 * 1000,
  });
}
