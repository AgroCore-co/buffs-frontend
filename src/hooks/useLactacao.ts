// ==========================================
// Imports e Query Keys
// ==========================================

import { useQuery } from '@tanstack/react-query';
import { lactacaoService } from '@/services/lactacao.service';

export const LACTACAO_QUERY_KEYS = {
  estatisticas: (idPropriedade: string) => ['lactacao', 'estatisticas', idPropriedade] as const,
  femeas: (idPropriedade: string) => ['lactacao', 'femeas-em-lactacao', idPropriedade] as const,
};

// ==========================================
// Hooks Individuais de Query
// ==========================================

export function useEstatisticasLactacao(idPropriedade?: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: LACTACAO_QUERY_KEYS.estatisticas(idPropriedade!),
    queryFn: () => lactacaoService.getEstatisticas(idPropriedade!),
    enabled: !!idPropriedade && options?.enabled !== false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useFemeasEmLactacao(idPropriedade?: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: LACTACAO_QUERY_KEYS.femeas(idPropriedade!),
    queryFn: () => lactacaoService.getFemeasEmLactacao(idPropriedade!),
    enabled: !!idPropriedade && options?.enabled !== false,
    // Status pode mudar com novas ordenhas/secagem — cache curto.
    staleTime: 1 * 60 * 1000,
  });
}
