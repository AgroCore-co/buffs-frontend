import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  materialGeneticoService,
  CreateMaterialGeneticoDTO,
  UpdateMaterialGeneticoDTO,
  PaginacaoParams,
} from '@/services/material-genetico.service';

export const MATERIAL_GENETICO_QUERY_KEYS = {
  all: ['material-genetico'] as const,
  byPropriedade: (idPropriedade: string, params?: PaginacaoParams) =>
    ['material-genetico', 'propriedade', idPropriedade, params] as const,
  byId: (id: string) => ['material-genetico', id] as const,
  deleted: ['material-genetico', 'deleted'] as const,
};

export function useMaterialGeneticoByPropriedade(
  idPropriedade?: string,
  params?: PaginacaoParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: MATERIAL_GENETICO_QUERY_KEYS.byPropriedade(idPropriedade!, params),
    queryFn: () => materialGeneticoService.getByPropriedade(idPropriedade!, params),
    enabled: !!idPropriedade && options?.enabled !== false,
    staleTime: 2 * 60 * 1000,
  });
}

export function useMaterialGeneticoById(id?: string) {
  return useQuery({
    queryKey: MATERIAL_GENETICO_QUERY_KEYS.byId(id!),
    queryFn: () => materialGeneticoService.getById(id!),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
}

export function useMaterialGeneticoDeleted(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: MATERIAL_GENETICO_QUERY_KEYS.deleted,
    queryFn: () => materialGeneticoService.getAllDeleted(),
    enabled: options?.enabled !== false,
    staleTime: 2 * 60 * 1000,
  });
}

export function useMaterialGenetico() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: CreateMaterialGeneticoDTO) => materialGeneticoService.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: MATERIAL_GENETICO_QUERY_KEYS.byPropriedade(variables.idPropriedade),
      });
      queryClient.invalidateQueries({ queryKey: MATERIAL_GENETICO_QUERY_KEYS.all });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMaterialGeneticoDTO }) =>
      materialGeneticoService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: MATERIAL_GENETICO_QUERY_KEYS.byId(id) });
      queryClient.invalidateQueries({ queryKey: MATERIAL_GENETICO_QUERY_KEYS.all });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => materialGeneticoService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MATERIAL_GENETICO_QUERY_KEYS.all });
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) => materialGeneticoService.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MATERIAL_GENETICO_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: MATERIAL_GENETICO_QUERY_KEYS.deleted });
    },
  });

  return {
    createMaterialGenetico: createMutation.mutateAsync,
    isCreating: createMutation.isPending,

    updateMaterialGenetico: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,

    deleteMaterialGenetico: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,

    restoreMaterialGenetico: restoreMutation.mutateAsync,
    isRestoring: restoreMutation.isPending,
  };
}
