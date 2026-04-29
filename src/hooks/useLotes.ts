// ==========================================
// Imports e Query Keys
// ==========================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  lotesService,
  Lote,
  CreateLoteDTO,
  UpdateLoteDTO,
} from '@/services/lotes.service';

/**
 * Chaves de cache centralizadas para o domínio de Lotes (Piquetes).
 */
export const LOTES_QUERY_KEYS = {
  // Base para todas as listas de lotes por propriedade
  lists: () => ['lotes', 'propriedade'] as const,
  // Cache da lista de lotes de uma propriedade específica
  byPropriedade: (idPropriedade: string) => [...LOTES_QUERY_KEYS.lists(), idPropriedade] as const,
  // Cache de um lote específico por UUID
  byId: (id: string) => ['lotes', id] as const,
};

// ==========================================
// Hook de Orquestração de Lotes
// ==========================================

/**
 * Hook Facade para o domínio de Lotes (Piquetes).
 * Centraliza o gerenciamento de cache e comunicação com a API.
 */
export function useLotes() {
  const queryClient = useQueryClient();

  // ==========================================
  // QUERIES
  // ==========================================

  /**
   * Busca todos os lotes atrelados a uma propriedade.
   * Retorna uma função para uso flexível nos componentes (ex: mapas, tabelas).
   */
  const getByPropriedade = (idPropriedade: string, options?: { enabled?: boolean }) =>
    useQuery({
      queryKey: LOTES_QUERY_KEYS.byPropriedade(idPropriedade),
      queryFn: () => lotesService.getByPropriedade(idPropriedade),
      enabled: !!idPropriedade && options?.enabled !== false,
      staleTime: 2 * 60 * 1000, // 2 minutos (dados geográficos não mudam constantemente)
    });

  /**
   * Busca um lote específico por UUID.
   */
  const getById = (id: string) =>
    useQuery({
      queryKey: LOTES_QUERY_KEYS.byId(id),
      queryFn: () => lotesService.getById(id),
      enabled: !!id,
      staleTime: 2 * 60 * 1000,
    });

  // ==========================================
  // MUTATIONS
  // ==========================================

  // Cria um novo lote.
  const createMutation = useMutation({
    mutationFn: (data: CreateLoteDTO) => lotesService.create(data),
    onSuccess: (_, variables) => {
      // Invalida especificamente a lista de lotes da propriedade atual
      // para renderizar o novo polígono/geometria imediatamente no mapa.
      queryClient.invalidateQueries({ queryKey: LOTES_QUERY_KEYS.byPropriedade(variables.idPropriedade) });
    },
  });

  // Atualiza um lote existente (incluindo redimensionamento no mapa).
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLoteDTO }) =>
      lotesService.update(id, data),
    onSuccess: (_, { id, data }) => {
      // Invalida os detalhes específicos deste lote
      queryClient.invalidateQueries({ queryKey: LOTES_QUERY_KEYS.byId(id) });
      
      // Tenta invalidar a lista exata da propriedade, ou genérica caso o DTO não tenha vindo com o ID
      if (data.idPropriedade) {
        queryClient.invalidateQueries({ queryKey: LOTES_QUERY_KEYS.byPropriedade(data.idPropriedade) });
      } else {
        queryClient.invalidateQueries({ queryKey: LOTES_QUERY_KEYS.lists() });
      }
    },
  });

  // Remove um lote.
  const deleteMutation = useMutation({
    mutationFn: (id: string) => lotesService.delete(id),
    onSuccess: () => {
      // Como não temos o ID da propriedade no payload de delete, 
      // invalidamos o prefixo 'lists' para forçar refetch nas propriedades montadas.
      queryClient.invalidateQueries({ queryKey: LOTES_QUERY_KEYS.lists() });
    },
  });

  // ==========================================
  // Retorno do Hook (Facade)
  // ==========================================

  return {
    // --- Buscas (Read) ---
    getByPropriedade,
    getById,

    // --- Ações de criação (Create) ---
    createLote: createMutation.mutateAsync,
    isCreatingLote: createMutation.isPending,

    // --- Ações de atualização (Update) ---
    updateLote: updateMutation.mutateAsync,
    isUpdatingLote: updateMutation.isPending,

    // --- Ações de exclusão (Delete) ---
    deleteLote: deleteMutation.mutateAsync,
    isDeletingLote: deleteMutation.isPending,
  };
}