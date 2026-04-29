// ==========================================
// Imports e Query Keys
// ==========================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  enderecosService,
  Endereco,
  CreateEnderecoDTO,
  UpdateEnderecoDTO,
  CreateEnderecoResponse,
} from '@/services/enderecos.service';

export const ENDERECOS_QUERY_KEYS = {
  all: ['enderecos'] as const,
  byId: (id: string) => ['enderecos', id] as const,
};

// ==========================================
// Hook para Listagem e Mutações
// ==========================================

export function useEnderecos(options?: { enabled?: boolean }) {
  const queryClient = useQueryClient();

  const allQuery = useQuery({
    queryKey: ENDERECOS_QUERY_KEYS.all,
    queryFn: enderecosService.getAll,
    staleTime: 2 * 60 * 1000,
    enabled: options?.enabled !== false,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateEnderecoDTO) => enderecosService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ENDERECOS_QUERY_KEYS.all });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEnderecoDTO }) =>
      enderecosService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ENDERECOS_QUERY_KEYS.byId(id) });
      queryClient.invalidateQueries({ queryKey: ENDERECOS_QUERY_KEYS.all });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => enderecosService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ENDERECOS_QUERY_KEYS.all });
    },
  });

  return {
    enderecos: allQuery.data ?? [],
    isLoadingEnderecos: allQuery.isLoading,
    isErrorEnderecos: allQuery.isError,
    errorEnderecos: allQuery.error,

    createEndereco: createMutation.mutateAsync,
    isCreatingEndereco: createMutation.isPending,
    updateEndereco: updateMutation.mutateAsync,
    isUpdatingEndereco: updateMutation.isPending,
    deleteEndereco: deleteMutation.mutateAsync,
    isDeletingEndereco: deleteMutation.isPending,
  };
}

// ==========================================
// Hook Exclusivo para Busca por ID
// ==========================================

export function useEndereco(id?: string) {
  return useQuery({
    queryKey: ENDERECOS_QUERY_KEYS.byId(id!),
    queryFn: () => enderecosService.getById(id!),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
}