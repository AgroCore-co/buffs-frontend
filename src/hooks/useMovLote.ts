// ==========================================
// Imports e Query Keys
// ==========================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    movLoteService,
    CreateMovLoteDTO,
    UpdateMovLoteDTO,
} from '@/services/mov-lote.service';

// ==========================================
// CHAVES DE CACHE
// ==========================================

export const MOV_LOTE_QUERY_KEYS = {
    all: ['mov-lote'] as const,
    lists: () => ['mov-lote', 'list'] as const,
    listAll: (page: number, limit: number) =>
        [...MOV_LOTE_QUERY_KEYS.lists(), 'all', page, limit] as const,
    byPropriedade: (idPropriedade: string, page: number, limit: number) =>
        [...MOV_LOTE_QUERY_KEYS.lists(), 'propriedade', idPropriedade, page, limit] as const,
    byId: (id: string) => ['mov-lote', 'detail', id] as const,
    historicoByGrupo: (idGrupo: string) => ['mov-lote', 'historico', 'grupo', idGrupo] as const,
    statusByGrupo: (idGrupo: string) => ['mov-lote', 'status', 'grupo', idGrupo] as const,
};

// ==========================================
// Hooks Individuais de Query
// ==========================================

export function useMovLoteAll(page: number = 1, limit: number = 10, options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: MOV_LOTE_QUERY_KEYS.listAll(page, limit),
        queryFn: () => movLoteService.getAll(page, limit),
        enabled: options?.enabled !== false,
        staleTime: 1 * 60 * 1000,
    });
}

export function useMovLoteByPropriedade(
    idPropriedade?: string,
    page: number = 1,
    limit: number = 10,
    options?: { enabled?: boolean },
) {
    return useQuery({
        queryKey: MOV_LOTE_QUERY_KEYS.byPropriedade(idPropriedade!, page, limit),
        queryFn: () => movLoteService.getByPropriedade(idPropriedade!, page, limit),
        enabled: !!idPropriedade && options?.enabled !== false,
        staleTime: 1 * 60 * 1000,
    });
}

export function useMovLoteById(id?: string) {
    return useQuery({
        queryKey: MOV_LOTE_QUERY_KEYS.byId(id!),
        queryFn: () => movLoteService.getById(id!),
        enabled: !!id,
        staleTime: 2 * 60 * 1000,
    });
}

export function useMovLoteHistoricoByGrupo(idGrupo?: string, options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: MOV_LOTE_QUERY_KEYS.historicoByGrupo(idGrupo!),
        queryFn: () => movLoteService.getHistoricoByGrupo(idGrupo!),
        enabled: !!idGrupo && options?.enabled !== false,
        staleTime: 1 * 60 * 1000,
    });
}

export function useMovLoteStatusByGrupo(idGrupo?: string, options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: MOV_LOTE_QUERY_KEYS.statusByGrupo(idGrupo!),
        queryFn: () => movLoteService.getStatusByGrupo(idGrupo!),
        enabled: !!idGrupo && options?.enabled !== false,
        staleTime: 1 * 60 * 1000,
    });
}

// ==========================================
// Hook de Mutações de Movimentação de Lotes
// ==========================================

export function useMovLote() {
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: (data: CreateMovLoteDTO) => movLoteService.create(data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: MOV_LOTE_QUERY_KEYS.lists() });
            queryClient.invalidateQueries({ queryKey: MOV_LOTE_QUERY_KEYS.historicoByGrupo(variables.idGrupo) });
            queryClient.invalidateQueries({ queryKey: MOV_LOTE_QUERY_KEYS.statusByGrupo(variables.idGrupo) });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateMovLoteDTO }) =>
            movLoteService.update(id, data),
        onSuccess: (_, { id, data }) => {
            queryClient.invalidateQueries({ queryKey: MOV_LOTE_QUERY_KEYS.byId(id) });
            queryClient.invalidateQueries({ queryKey: MOV_LOTE_QUERY_KEYS.lists() });
            if (data.idGrupo) {
                queryClient.invalidateQueries({ queryKey: MOV_LOTE_QUERY_KEYS.historicoByGrupo(data.idGrupo) });
                queryClient.invalidateQueries({ queryKey: MOV_LOTE_QUERY_KEYS.statusByGrupo(data.idGrupo) });
            } else {
                queryClient.invalidateQueries({ queryKey: ['mov-lote', 'historico'] });
                queryClient.invalidateQueries({ queryKey: ['mov-lote', 'status'] });
            }
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => movLoteService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: MOV_LOTE_QUERY_KEYS.all });
        },
    });

    return {
        createMovLote: createMutation.mutateAsync,
        isCreatingMovLote: createMutation.isPending,

        updateMovLote: updateMutation.mutateAsync,
        isUpdatingMovLote: updateMutation.isPending,

        deleteMovLote: deleteMutation.mutateAsync,
        isDeletingMovLote: deleteMutation.isPending,
    };
}
