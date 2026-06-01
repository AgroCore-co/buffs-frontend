// ==========================================
// Imports e Query Keys
// ==========================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  alertasService,
  CreateAlertaDTO,
  AlertasFilterParams,
  AlertasByPropriedadeParams,
  NichoAlerta,
} from '@/services/alertas.service';

export const ALERTAS_QUERY_KEYS = {
  all: ['alertas'] as const,
  lists: () => ['alertas', 'list'] as const,
  list: (params?: AlertasFilterParams) => [...ALERTAS_QUERY_KEYS.lists(), params] as const,
  byPropriedade: (idPropriedade: string, params?: AlertasByPropriedadeParams) =>
    ['alertas', 'propriedade', idPropriedade, params] as const,
  byId: (id: string) => ['alertas', id] as const,
};

// ==========================================
// Hooks Individuais de Query
// ==========================================

export function useAlertas(params?: AlertasFilterParams, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ALERTAS_QUERY_KEYS.list(params),
    queryFn: () => alertasService.getAll(params),
    enabled: options?.enabled !== false,
    staleTime: 1 * 60 * 1000,
  });
}

export function useAlertasByPropriedade(
  idPropriedade?: string,
  params?: AlertasByPropriedadeParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ALERTAS_QUERY_KEYS.byPropriedade(idPropriedade!, params),
    queryFn: () => alertasService.getByPropriedade(idPropriedade!, params),
    enabled: !!idPropriedade && options?.enabled !== false,
    staleTime: 1 * 60 * 1000,
  });
}

export function useAlerta(id?: string) {
  return useQuery({
    queryKey: ALERTAS_QUERY_KEYS.byId(id!),
    queryFn: () => alertasService.getById(id!),
    enabled: !!id,
    staleTime: 1 * 60 * 1000,
  });
}

// ==========================================
// Hook de Mutações de Alertas
// ==========================================

export function useAlertasMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: CreateAlertaDTO) => alertasService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ALERTAS_QUERY_KEYS.all });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => alertasService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ALERTAS_QUERY_KEYS.all });
    },
  });

  const marcarVistoMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: boolean }) =>
      alertasService.marcarVisto(id, status),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ALERTAS_QUERY_KEYS.byId(id) });
      queryClient.invalidateQueries({ queryKey: ALERTAS_QUERY_KEYS.all });
    },
  });

  const verificarMutation = useMutation({
    mutationFn: ({ idPropriedade, nichos }: { idPropriedade: string; nichos?: NichoAlerta[] }) =>
      alertasService.verificar(idPropriedade, nichos),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ALERTAS_QUERY_KEYS.all });
    },
  });

  return {
    createAlerta: createMutation.mutateAsync,
    isCreatingAlerta: createMutation.isPending,

    deleteAlerta: deleteMutation.mutateAsync,
    isDeletingAlerta: deleteMutation.isPending,

    marcarVisto: marcarVistoMutation.mutateAsync,
    isMarcandoVisto: marcarVistoMutation.isPending,

    verificarAlertas: verificarMutation.mutateAsync,
    isVerificandoAlertas: verificarMutation.isPending,
  };
}
