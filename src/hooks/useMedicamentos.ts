// ==========================================
// Imports e Query Keys
// ==========================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  medicamentosService,
  CreateMedicacaoDTO,
  UpdateMedicacaoDTO,
} from '@/services/medicamentos.service';

export const MEDICAMENTOS_QUERY_KEYS = {
  all: ['medicamentos'] as const,
  byPropriedade: (idPropriedade: string) => ['medicamentos', 'propriedade', idPropriedade] as const,
  byId: (id: string) => ['medicamentos', id] as const,
  deleted: ['medicamentos', 'deleted'] as const,
};

// ==========================================
// Hooks Individuais de Query
// ==========================================

export function useMedicamentosByPropriedade(idPropriedade?: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: MEDICAMENTOS_QUERY_KEYS.byPropriedade(idPropriedade!),
    queryFn: () => medicamentosService.getByPropriedade(idPropriedade!),
    enabled: !!idPropriedade && options?.enabled !== false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useMedicamento(id?: string) {
  return useQuery({
    queryKey: MEDICAMENTOS_QUERY_KEYS.byId(id!),
    queryFn: () => medicamentosService.getById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useMedicamentosDeleted(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: MEDICAMENTOS_QUERY_KEYS.deleted,
    queryFn: () => medicamentosService.getAllDeleted(),
    enabled: options?.enabled !== false,
    staleTime: 2 * 60 * 1000,
  });
}

// ==========================================
// Hook de Mutações de Medicamentos
// ==========================================

export function useMedicamentos() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: CreateMedicacaoDTO) => medicamentosService.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: MEDICAMENTOS_QUERY_KEYS.byPropriedade(variables.idPropriedade) });
      queryClient.invalidateQueries({ queryKey: MEDICAMENTOS_QUERY_KEYS.all });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMedicacaoDTO }) =>
      medicamentosService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: MEDICAMENTOS_QUERY_KEYS.byId(id) });
      queryClient.invalidateQueries({ queryKey: MEDICAMENTOS_QUERY_KEYS.all });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => medicamentosService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEDICAMENTOS_QUERY_KEYS.all });
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) => medicamentosService.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEDICAMENTOS_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: MEDICAMENTOS_QUERY_KEYS.deleted });
    },
  });

  return {
    createMedicamento: createMutation.mutateAsync,
    isCreatingMedicamento: createMutation.isPending,

    updateMedicamento: updateMutation.mutateAsync,
    isUpdatingMedicamento: updateMutation.isPending,

    deleteMedicamento: deleteMutation.mutateAsync,
    isDeletingMedicamento: deleteMutation.isPending,

    restoreMedicamento: restoreMutation.mutateAsync,
    isRestoringMedicamento: restoreMutation.isPending,
  };
}
