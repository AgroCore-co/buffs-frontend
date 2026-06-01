// ==========================================
// Imports e Query Keys
// ==========================================

import { useQuery } from '@tanstack/react-query';
import { reproducaoService, PaginacaoParams } from '@/services/reproducao.service';

export const REPRODUCAO_QUERY_KEYS = {
  byPropriedade: (idPropriedade: string, params?: PaginacaoParams) =>
    ['reproducao', 'propriedade', idPropriedade, params] as const,
  byId: (id: string) => ['reproducao', id] as const,
};

// ==========================================
// Hooks Individuais de Query
// ==========================================

export function useReproducoesByPropriedade(
  idPropriedade?: string,
  params?: PaginacaoParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: REPRODUCAO_QUERY_KEYS.byPropriedade(idPropriedade!, params),
    queryFn: () => reproducaoService.getByPropriedade(idPropriedade!, params),
    enabled: !!idPropriedade && options?.enabled !== false,
    staleTime: 1 * 60 * 1000,
  });
}

export function useReproducaoById(id?: string) {
  return useQuery({
    queryKey: REPRODUCAO_QUERY_KEYS.byId(id!),
    queryFn: () => reproducaoService.getById(id!),
    enabled: !!id,
    staleTime: 1 * 60 * 1000,
  });
}
