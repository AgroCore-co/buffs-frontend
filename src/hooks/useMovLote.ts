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
    // Raiz
    all: ['mov-lote'] as const,

    // Listagens
    lists: () => ['mov-lote', 'list'] as const,
    listAll: (page: number, limit: number) =>
        [...MOV_LOTE_QUERY_KEYS.lists(), 'all', page, limit] as const,
    byPropriedade: (idPropriedade: string, page: number, limit: number) =>
        [...MOV_LOTE_QUERY_KEYS.lists(), 'propriedade', idPropriedade, page, limit] as const,

    // Detalhes
    byId: (id: string) => ['mov-lote', 'detail', id] as const,

    // Histórico e Status de Grupos
    historicoByGrupo: (idGrupo: string) => ['mov-lote', 'historico', 'grupo', idGrupo] as const,
    statusByGrupo: (idGrupo: string) => ['mov-lote', 'status', 'grupo', idGrupo] as const,
};

// ==========================================
// HOOK DE ORQUESTRAÇÃO DE MOVIMENTAÇÃO DE LOTES
// ==========================================

export function useMovLote() {
    const queryClient = useQueryClient();

    // ==========================================
    // QUERIES
    // ==========================================

    /**
     * Lista todas as movimentações do sistema (paginado).
     */
    const getAll = (page: number = 1, limit: number = 10, options?: { enabled?: boolean }) =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            queryKey: MOV_LOTE_QUERY_KEYS.listAll(page, limit),
            queryFn: () => movLoteService.getAll(page, limit),
            enabled: options?.enabled !== false,
            staleTime: 1 * 60 * 1000, // 1 minuto
        });

    /**
     * Lista movimentações de lotes de uma propriedade específica com paginação.
     */
    const getByPropriedade = (idPropriedade: string, page: number = 1, limit: number = 10, options?: { enabled?: boolean }) =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            queryKey: MOV_LOTE_QUERY_KEYS.byPropriedade(idPropriedade, page, limit),
            queryFn: () => movLoteService.getByPropriedade(idPropriedade, page, limit),
            enabled: !!idPropriedade && options?.enabled !== false,
            staleTime: 1 * 60 * 1000,
        });

    /**
     * Busca uma movimentação específica pelo seu ID.
     */
    const getById = (id?: string) =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            queryKey: MOV_LOTE_QUERY_KEYS.byId(id!),
            queryFn: () => movLoteService.getById(id!),
            enabled: !!id,
            staleTime: 2 * 60 * 1000,
        });

    /**
     * Busca o histórico completo de movimentações físicas de um grupo.
     */
    const getHistoricoByGrupo = (idGrupo?: string, options?: { enabled?: boolean }) =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            queryKey: MOV_LOTE_QUERY_KEYS.historicoByGrupo(idGrupo!),
            queryFn: () => movLoteService.getHistoricoByGrupo(idGrupo!),
            enabled: !!idGrupo && options?.enabled !== false,
            staleTime: 1 * 60 * 1000,
        });

    /**
     * Verifica o status atual de localização de um grupo.
     */
    const getStatusByGrupo = (idGrupo?: string, options?: { enabled?: boolean }) =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            queryKey: MOV_LOTE_QUERY_KEYS.statusByGrupo(idGrupo!),
            queryFn: () => movLoteService.getStatusByGrupo(idGrupo!),
            enabled: !!idGrupo && options?.enabled !== false,
            staleTime: 1 * 60 * 1000,
        });

    // ==========================================
    // MUTATIONS
    // ==========================================

    const createMutation = useMutation({
        mutationFn: (data: CreateMovLoteDTO) => movLoteService.create(data),
        onSuccess: (_, variables) => {
            // Invalida listas e o histórico/status do grupo movimentado
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

            // Se o idGrupo estiver no payload, invalidamos o cache específico dele também
            if (data.idGrupo) {
                queryClient.invalidateQueries({ queryKey: MOV_LOTE_QUERY_KEYS.historicoByGrupo(data.idGrupo) });
                queryClient.invalidateQueries({ queryKey: MOV_LOTE_QUERY_KEYS.statusByGrupo(data.idGrupo) });
            } else {
                // Fallback genérico caso não saibamos o grupo exato que foi alterado
                queryClient.invalidateQueries({ queryKey: ['mov-lote', 'historico'] });
                queryClient.invalidateQueries({ queryKey: ['mov-lote', 'status'] });
            }
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => movLoteService.delete(id),
        onSuccess: () => {
            // Como não temos os dados do grupo no momento do delete (sem fazer um fetch manual),
            // invalidamos a árvore raiz de movimentações para garantir a consistência
            queryClient.invalidateQueries({ queryKey: MOV_LOTE_QUERY_KEYS.all });
        },
    });

    // ==========================================
    // RETORNO DO HOOK (Facade)
    // ==========================================

    return {
        // Queries
        getAll,
        getByPropriedade,
        getById,
        getHistoricoByGrupo,
        getStatusByGrupo,

        // Mutations
        createMovLote: createMutation.mutateAsync,
        isCreatingMovLote: createMutation.isPending,

        updateMovLote: updateMutation.mutateAsync,
        isUpdatingMovLote: updateMutation.isPending,

        deleteMovLote: deleteMutation.mutateAsync,
        isDeletingMovLote: deleteMutation.isPending,
    };
}

// ==========================================
// Hook Exclusivo para Busca por ID
// ==========================================

export function useMovLoteById(id?: string) {
    return useQuery({
        queryKey: MOV_LOTE_QUERY_KEYS.byId(id!),
        queryFn: () => movLoteService.getById(id!),
        enabled: !!id,
        staleTime: 2 * 60 * 1000,
    });
}