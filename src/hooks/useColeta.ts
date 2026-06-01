import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  coletaService,
  laticinioService,
  type CreateLaticinioDTO,
  type UpdateLaticinioDTO,
} from '@/services/coleta.service';

// ==========================================
// Query Keys
// ==========================================

export const COLETA_QUERY_KEYS = {
  byPropriedade: (idPropriedade: string, page: number, limit: number) =>
    ['coletas', idPropriedade, page, limit] as const,
  byId: (id: string) => ['coletas', id] as const,
};

export const LATICINIO_QUERY_KEYS = {
  byPropriedade: (idPropriedade: string) =>
    ['laticinios', idPropriedade] as const,
  byId: (id: string) => ['laticinios', id] as const,
};

// ==========================================
// Coleta Hooks
// ==========================================

export function useColetas(
  idPropriedade?: string,
  page = 1,
  limit = 10,
) {
  return useQuery({
    queryKey: COLETA_QUERY_KEYS.byPropriedade(idPropriedade!, page, limit),
    queryFn: () => coletaService.getByPropriedade(idPropriedade!, page, limit),
    enabled: !!idPropriedade,
    staleTime: 1 * 60 * 1000,
  });
}

export function useColetaById(id?: string) {
  return useQuery({
    queryKey: COLETA_QUERY_KEYS.byId(id!),
    queryFn: () => coletaService.getById(id!),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
}

// ==========================================
// Laticinio Hooks
// ==========================================

export function useLaticiniosByPropriedade(idPropriedade?: string) {
  return useQuery({
    queryKey: LATICINIO_QUERY_KEYS.byPropriedade(idPropriedade!),
    queryFn: () => laticinioService.getByPropriedade(idPropriedade!),
    enabled: !!idPropriedade,
    staleTime: 2 * 60 * 1000,
  });
}

export function useLaticinioById(id?: string) {
  return useQuery({
    queryKey: LATICINIO_QUERY_KEYS.byId(id!),
    queryFn: () => laticinioService.getById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateLaticinio(idPropriedade?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateLaticinioDTO) => laticinioService.create(data),
    onSuccess: () => {
      if (idPropriedade) {
        queryClient.invalidateQueries({
          queryKey: LATICINIO_QUERY_KEYS.byPropriedade(idPropriedade),
        });
      }
    },
  });
}

export function useUpdateLaticinio(idPropriedade?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLaticinioDTO }) =>
      laticinioService.update(id, data),
    onSuccess: (_result, { id }) => {
      queryClient.invalidateQueries({ queryKey: LATICINIO_QUERY_KEYS.byId(id) });
      if (idPropriedade) {
        queryClient.invalidateQueries({
          queryKey: LATICINIO_QUERY_KEYS.byPropriedade(idPropriedade),
        });
      }
    },
  });
}

export function useDeleteLaticinio(idPropriedade?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => laticinioService.delete(id),
    onSuccess: (_result, id) => {
      queryClient.invalidateQueries({ queryKey: LATICINIO_QUERY_KEYS.byId(id) });
      if (idPropriedade) {
        queryClient.invalidateQueries({
          queryKey: LATICINIO_QUERY_KEYS.byPropriedade(idPropriedade),
        });
      }
    },
  });
}
