// ==========================================
// Imports e Query Keys
// ==========================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  alimentacaoDefService,
  alimentacaoRegistroService,
  CreateAlimentacaoDefDTO,
  UpdateAlimentacaoDefDTO,
  CreateAlimentacaoRegistroDTO,
  UpdateAlimentacaoRegistroDTO,
} from '@/services/alimentacao.service';

// ==========================================================
// CHAVES DE CACHE
// ==========================================================

export const ALIMENTACAO_DEF_QUERY_KEYS = {
  lists: () => ['alimentacao_def', 'propriedade'] as const,
  byPropriedade: (idPropriedade: string, page: number, limit: number) =>
    [...ALIMENTACAO_DEF_QUERY_KEYS.lists(), idPropriedade, page, limit] as const,
  byId: (id: string) => ['alimentacao_def', id] as const,
};

export const ALIMENTACAO_REGISTRO_QUERY_KEYS = {
  lists: () => ['alimentacao_registro', 'propriedade'] as const,
  byPropriedade: (idPropriedade: string, page: number, limit: number) =>
    [...ALIMENTACAO_REGISTRO_QUERY_KEYS.lists(), idPropriedade, page, limit] as const,
  byId: (id: string) => ['alimentacao_registro', id] as const,
};

// ==========================================================
// Hooks Individuais de Query — Definições de Alimentação
// ==========================================================

export function useAlimentacaoDefByPropriedade(
  idPropriedade?: string,
  page: number = 1,
  limit: number = 10,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ALIMENTACAO_DEF_QUERY_KEYS.byPropriedade(idPropriedade!, page, limit),
    queryFn: () => alimentacaoDefService.getByPropriedade(idPropriedade!, page, limit),
    enabled: !!idPropriedade && options?.enabled !== false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAlimentacaoDefById(id?: string) {
  return useQuery({
    queryKey: ALIMENTACAO_DEF_QUERY_KEYS.byId(id!),
    queryFn: () => alimentacaoDefService.getById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// ==========================================================
// Hooks Individuais de Query — Registros de Alimentação
// ==========================================================

export function useAlimentacaoRegistroByPropriedade(
  idPropriedade?: string,
  page: number = 1,
  limit: number = 10,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ALIMENTACAO_REGISTRO_QUERY_KEYS.byPropriedade(idPropriedade!, page, limit),
    queryFn: () => alimentacaoRegistroService.getByPropriedade(idPropriedade!, page, limit),
    enabled: !!idPropriedade && options?.enabled !== false,
    staleTime: 1 * 60 * 1000,
  });
}

export function useAlimentacaoRegistroById(id?: string) {
  return useQuery({
    queryKey: ALIMENTACAO_REGISTRO_QUERY_KEYS.byId(id!),
    queryFn: () => alimentacaoRegistroService.getById(id!),
    enabled: !!id,
    staleTime: 1 * 60 * 1000,
  });
}

// ==========================================================
// HOOK 1: MUTAÇÕES DE DEFINIÇÕES DE ALIMENTAÇÃO
// ==========================================================

export function useAlimentacaoDef() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: CreateAlimentacaoDefDTO) => alimentacaoDefService.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [...ALIMENTACAO_DEF_QUERY_KEYS.lists(), variables.idPropriedade] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAlimentacaoDefDTO }) =>
      alimentacaoDefService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ALIMENTACAO_DEF_QUERY_KEYS.byId(id) });
      queryClient.invalidateQueries({ queryKey: ALIMENTACAO_DEF_QUERY_KEYS.lists() });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => alimentacaoDefService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ALIMENTACAO_DEF_QUERY_KEYS.lists() });
    },
  });

  return {
    createDef: createMutation.mutateAsync,
    isCreatingDef: createMutation.isPending,

    updateDef: updateMutation.mutateAsync,
    isUpdatingDef: updateMutation.isPending,

    deleteDef: deleteMutation.mutateAsync,
    isDeletingDef: deleteMutation.isPending,
  };
}

// ==========================================================
// HOOK 2: MUTAÇÕES DE REGISTROS DE ALIMENTAÇÃO
// ==========================================================

export function useAlimentacaoRegistro() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: CreateAlimentacaoRegistroDTO) => alimentacaoRegistroService.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [...ALIMENTACAO_REGISTRO_QUERY_KEYS.lists(), variables.idPropriedade] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAlimentacaoRegistroDTO }) =>
      alimentacaoRegistroService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ALIMENTACAO_REGISTRO_QUERY_KEYS.byId(id) });
      queryClient.invalidateQueries({ queryKey: ALIMENTACAO_REGISTRO_QUERY_KEYS.lists() });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => alimentacaoRegistroService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ALIMENTACAO_REGISTRO_QUERY_KEYS.lists() });
    },
  });

  return {
    createRegistro: createMutation.mutateAsync,
    isCreatingRegistro: createMutation.isPending,

    updateRegistro: updateMutation.mutateAsync,
    isUpdatingRegistro: updateMutation.isPending,

    deleteRegistro: deleteMutation.mutateAsync,
    isDeletingRegistro: deleteMutation.isPending,
  };
}
