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

/**
 * Chaves de cache centralizadas para o domínio de Propriedades.
 * Exportadas para uso externo (ex: prefetch no login, invalidação em outros hooks).
 */
export const PROPRIEDADES_QUERY_KEYS = {
  /** Cache da lista geral de propriedades do usuário */
  all: ['propriedades'] as const,
  /** Cache de uma propriedade específica por UUID */
  byId: (id: string) => ['propriedades', id] as const,
};

// ==========================================
// Hook de Orquestração de Propriedades
// ==========================================

/**
 * Hook Facade para o domínio de Propriedades.
 * Centraliza todas as operações de leitura e escrita, gerenciamento de cache
 * e estados de carregamento em uma única interface limpa para os componentes.
 *
 * @param options.enabled - Se false, desabilita a query automática da lista (default: true)
 */
export function usePropriedades(options?: { enabled?: boolean }) {
  const queryClient = useQueryClient();

  // ==========================================
  // QUERIES
  // ==========================================

  // Lista todas as propriedades do usuário logado.
  // staleTime de 2 minutos: dados de propriedades não mudam com frequência,
  // então evitamos refetch desnecessário em navegações rápidas.
  const allQuery = useQuery({
    queryKey: PROPRIEDADES_QUERY_KEYS.all,
    queryFn: propriedadesService.getAll,
    staleTime: 2 * 60 * 1000, // 2 minutos
    enabled: options?.enabled !== false, // Permite desabilitar a query se necessário
  });

  // Busca uma propriedade específica por UUID.
  // Retorna uma função ao invés de executar diretamente, permitindo uso condicional nos componentes.
  // O `enabled: !!id` garante que a query só roda quando o ID é fornecido.
  const getById = (id: string) =>
    useQuery({
      queryKey: PROPRIEDADES_QUERY_KEYS.byId(id),
      queryFn: () => propriedadesService.getById(id),
      enabled: !!id,
      staleTime: 2 * 60 * 1000,
    });

  // ==========================================
  // MUTATIONS
  // ==========================================

  // Cria uma nova propriedade.
  // Após sucesso, invalida a lista geral para que a nova propriedade apareça imediatamente na UI.
  const createMutation = useMutation({
    mutationFn: (data: CreatePropriedadeDTO) => propriedadesService.create(data),
    onSuccess: () => {
      // Invalida a lista geral para incluir a propriedade recém-criada
      queryClient.invalidateQueries({ queryKey: PROPRIEDADES_QUERY_KEYS.all });
    },
  });

  // Atualiza parcialmente uma propriedade existente.
  // Após sucesso, invalida tanto a lista geral quanto o cache específico da propriedade editada
  // para garantir que todas as views reflitam a alteração.
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePropriedadeDTO }) =>
      propriedadesService.update(id, data),
    onSuccess: (_, { id }) => {
      // Invalida o cache específico desta propriedade para refletir a edição na tela de detalhes
      queryClient.invalidateQueries({ queryKey: PROPRIEDADES_QUERY_KEYS.byId(id) });
      // Invalida a lista geral para atualizar cards, contadores e filtros
      queryClient.invalidateQueries({ queryKey: PROPRIEDADES_QUERY_KEYS.all });
    },
  });

  // Remove (soft delete) uma propriedade.
  // Após sucesso, invalida a lista geral para que a propriedade removida desapareça da UI.
  // O cache específico não precisa ser invalidado pois a propriedade não existirá mais.
  const deleteMutation = useMutation({
    mutationFn: (id: string) => propriedadesService.delete(id),
    onSuccess: () => {
      // Invalida a lista geral para remover a propriedade deletada de todas as views
      queryClient.invalidateQueries({ queryKey: PROPRIEDADES_QUERY_KEYS.all });
    },
  });

  // ==========================================
  // Retorno do Hook (Facade)
  // ==========================================

  return {
    // --- Dados e status da lista geral ---
    // O array de propriedades é extraído do wrapper da API (que também contém message e total)
    propriedades: allQuery.data?.propriedades ?? [],
    totalPropriedades: allQuery.data?.total ?? 0,
    isLoadingPropriedades: allQuery.isLoading,
    isErrorPropriedades: allQuery.isError,
    errorPropriedades: allQuery.error,

    // --- Busca por ID (uso: const { data, isLoading } = getById('uuid')) ---
    getById,

    // --- Ações de criação ---
    createPropriedade: createMutation.mutateAsync,
    isCreatingPropriedade: createMutation.isPending,

    // --- Ações de atualização ---
    updatePropriedade: updateMutation.mutateAsync,
    isUpdatingPropriedade: updateMutation.isPending,

    // --- Ações de exclusão ---
    deletePropriedade: deleteMutation.mutateAsync,
    isDeletingPropriedade: deleteMutation.isPending,
  };
}
