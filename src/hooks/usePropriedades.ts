// ==========================================
// Imports e Query Keys
// ==========================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  propriedadesService,
  Propriedade,
  CreatePropriedadeDTO,
  UpdatePropriedadeDTO,
} from '@/services/propriedades.service';

export const PROPRIEDADES_QUERY_KEYS = {
  all: ['propriedades'] as const,
  byId: (id: string) => ['propriedades', id] as const,
};

// ==========================================
// Hook para Listagem e Mutações
// ==========================================

export function usePropriedades(options?: { enabled?: boolean }) {
  const queryClient = useQueryClient();

  const allQuery = useQuery({
    queryKey: PROPRIEDADES_QUERY_KEYS.all,
    queryFn: propriedadesService.getAll,
    staleTime: 2 * 60 * 1000, 
    enabled: options?.enabled !== false, 
  });

  const createMutation = useMutation({
    mutationFn: (data: CreatePropriedadeDTO) => propriedadesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROPRIEDADES_QUERY_KEYS.all });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePropriedadeDTO }) =>
      propriedadesService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: PROPRIEDADES_QUERY_KEYS.byId(id) });
      queryClient.invalidateQueries({ queryKey: PROPRIEDADES_QUERY_KEYS.all });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => propriedadesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROPRIEDADES_QUERY_KEYS.all });
    },
  });

  return {
    propriedades: allQuery.data?.propriedades ?? [],
    totalPropriedades: allQuery.data?.total ?? 0,
    isLoadingPropriedades: allQuery.isLoading,
    isErrorPropriedades: allQuery.isError,
    errorPropriedades: allQuery.error,

    createPropriedade: createMutation.mutateAsync,
    isCreatingPropriedade: createMutation.isPending,
    updatePropriedade: updateMutation.mutateAsync,
    isUpdatingPropriedade: updateMutation.isPending,
    deletePropriedade: deleteMutation.mutateAsync,
    isDeletingPropriedade: deleteMutation.isPending,
  };
}

// ==========================================
// Hook Exclusivo para Busca por ID
// ==========================================

export function usePropriedade(id?: string) {
  return useQuery({
    queryKey: PROPRIEDADES_QUERY_KEYS.byId(id!),
    queryFn: () => propriedadesService.getById(id!),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
}