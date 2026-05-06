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
// HOOK 1: DEFINIÇÕES DE ALIMENTAÇÃO (Tipos de Alimentos)
// ==========================================================

export function useAlimentacaoDef() {
  const queryClient = useQueryClient();

  // --- QUERIES ---
  const getByPropriedade = (idPropriedade: string, page: number = 1, limit: number = 10, options?: { enabled?: boolean }) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery({
      queryKey: ALIMENTACAO_DEF_QUERY_KEYS.byPropriedade(idPropriedade, page, limit),
      queryFn: () => alimentacaoDefService.getByPropriedade(idPropriedade, page, limit),
      enabled: !!idPropriedade && options?.enabled !== false,
      staleTime: 5 * 60 * 1000, // 5 minutos (definições mudam raramente)
    });

  const getById = (id?: string) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery({
      queryKey: ALIMENTACAO_DEF_QUERY_KEYS.byId(id!),
      queryFn: () => alimentacaoDefService.getById(id!),
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
    });

  // --- MUTATIONS ---
  const createMutation = useMutation({
    mutationFn: (data: CreateAlimentacaoDefDTO) => alimentacaoDefService.create(data),
    onSuccess: (_, variables) => {
      // Invalida a lista da propriedade para recarregar com o novo item
      queryClient.invalidateQueries({ queryKey: [...ALIMENTACAO_DEF_QUERY_KEYS.lists(), variables.id_propriedade] });
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
    // Queries
    getByPropriedade,
    getById,

    // Mutations
    createDef: createMutation.mutateAsync,
    isCreatingDef: createMutation.isPending,
    
    updateDef: updateMutation.mutateAsync,
    isUpdatingDef: updateMutation.isPending,
    
    deleteDef: deleteMutation.mutateAsync,
    isDeletingDef: deleteMutation.isPending,
  };
}

// ==========================================================
// HOOK 2: REGISTROS DE ALIMENTAÇÃO (Ocorrências Diárias)
// ==========================================================

export function useAlimentacaoRegistro() {
  const queryClient = useQueryClient();

  // --- QUERIES ---
  const getByPropriedade = (idPropriedade: string, page: number = 1, limit: number = 10, options?: { enabled?: boolean }) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery({
      queryKey: ALIMENTACAO_REGISTRO_QUERY_KEYS.byPropriedade(idPropriedade, page, limit),
      queryFn: () => alimentacaoRegistroService.getByPropriedade(idPropriedade, page, limit),
      enabled: !!idPropriedade && options?.enabled !== false,
      staleTime: 1 * 60 * 1000, // 1 minuto (registros são mais dinâmicos)
    });

  const getById = (id?: string) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery({
      queryKey: ALIMENTACAO_REGISTRO_QUERY_KEYS.byId(id!),
      queryFn: () => alimentacaoRegistroService.getById(id!),
      enabled: !!id,
      staleTime: 1 * 60 * 1000,
    });

  // --- MUTATIONS ---
  const createMutation = useMutation({
    mutationFn: (data: CreateAlimentacaoRegistroDTO) => alimentacaoRegistroService.create(data),
    onSuccess: (_, variables) => {
      // Invalida a lista da propriedade para exibir o novo registro imediatamente
      queryClient.invalidateQueries({ queryKey: [...ALIMENTACAO_REGISTRO_QUERY_KEYS.lists(), variables.id_propriedade] });
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
    // Queries
    getByPropriedade,
    getById,

    // Mutations
    createRegistro: createMutation.mutateAsync,
    isCreatingRegistro: createMutation.isPending,
    
    updateRegistro: updateMutation.mutateAsync,
    isUpdatingRegistro: updateMutation.isPending,
    
    deleteRegistro: deleteMutation.mutateAsync,
    isDeletingRegistro: deleteMutation.isPending,
  };
}