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

/**
 * Chaves de cache centralizadas para o domínio de Endereços.
 * Exportadas para uso externo (ex: prefetch, invalidação em outros hooks).
 */
export const ENDERECOS_QUERY_KEYS = {
  /** Cache da lista geral de endereços */
  all: ['enderecos'] as const,
  /** Cache de um endereço específico por UUID */
  byId: (id: string) => ['enderecos', id] as const,
};

// ==========================================
// Hook de Orquestração de Endereços
// ==========================================

/**
 * Hook Facade para o domínio de Endereços.
 * Centraliza todas as operações de leitura e escrita, gerenciamento de cache
 * e estados de carregamento em uma única interface limpa para os componentes.
 *
 * @param options.enabled - Se false, desabilita a query automática da lista (default: true)
 */
export function useEnderecos(options?: { enabled?: boolean }) {
  const queryClient = useQueryClient();

  // ==========================================
  // QUERIES
  // ==========================================

  // Lista todos os endereços cadastrados.
  // staleTime de 2 minutos: endereços mudam pouco, evita refetch desnecessário.
  const allQuery = useQuery({
    queryKey: ENDERECOS_QUERY_KEYS.all,
    queryFn: enderecosService.getAll,
    staleTime: 2 * 60 * 1000,
    enabled: options?.enabled !== false,
  });

  // Busca um endereço específico por UUID.
  // Retorna uma função para uso condicional nos componentes.
  const getById = (id: string) =>
    useQuery({
      queryKey: ENDERECOS_QUERY_KEYS.byId(id),
      queryFn: () => enderecosService.getById(id),
      enabled: !!id,
      staleTime: 2 * 60 * 1000,
    });

  // ==========================================
  // MUTATIONS
  // ==========================================

  // Cria um novo endereço.
  // Após sucesso, invalida a lista geral para que o novo endereço apareça imediatamente na UI.
  const createMutation = useMutation({
    mutationFn: (data: CreateEnderecoDTO) => enderecosService.create(data),
    onSuccess: () => {
      // Invalida a lista geral para incluir o endereço recém-criado
      queryClient.invalidateQueries({ queryKey: ENDERECOS_QUERY_KEYS.all });
    },
  });

  // Atualiza parcialmente um endereço existente.
  // Após sucesso, invalida tanto a lista geral quanto o cache específico do endereço editado
  // para garantir que todas as views reflitam a alteração.
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEnderecoDTO }) =>
      enderecosService.update(id, data),
    onSuccess: (_, { id }) => {
      // Invalida o cache específico deste endereço para refletir a edição
      queryClient.invalidateQueries({ queryKey: ENDERECOS_QUERY_KEYS.byId(id) });
      // Invalida a lista geral para atualizar cards, contadores e filtros
      queryClient.invalidateQueries({ queryKey: ENDERECOS_QUERY_KEYS.all });
    },
  });

  // Remove um endereço.
  // Após sucesso, invalida a lista geral para que o endereço removido desapareça da UI.
  // O cache específico não precisa ser invalidado pois o endereço não existirá mais.
  const deleteMutation = useMutation({
    mutationFn: (id: string) => enderecosService.delete(id),
    onSuccess: () => {
      // Invalida a lista geral para remover o endereço deletado de todas as views
      queryClient.invalidateQueries({ queryKey: ENDERECOS_QUERY_KEYS.all });
    },
  });

  // ==========================================
  // Retorno do Hook (Facade)
  // ==========================================

  return {
    // --- Dados e status da lista geral ---
    enderecos: allQuery.data ?? [],
    isLoadingEnderecos: allQuery.isLoading,
    isErrorEnderecos: allQuery.isError,
    errorEnderecos: allQuery.error,

    // --- Busca por ID (uso: const { data, isLoading } = getById('uuid')) ---
    getById,

    // --- Ações de criação ---
    createEndereco: createMutation.mutateAsync,
    isCreatingEndereco: createMutation.isPending,

    // --- Ações de atualização ---
    updateEndereco: updateMutation.mutateAsync,
    isUpdatingEndereco: updateMutation.isPending,

    // --- Ações de exclusão ---
    deleteEndereco: deleteMutation.mutateAsync,
    isDeletingEndereco: deleteMutation.isPending,
  };
}
