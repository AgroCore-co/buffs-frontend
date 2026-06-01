// ==========================================
// Imports
// ==========================================

import { useMutation } from '@tanstack/react-query';
import { predicaoProducaoService, PredicaoProducao } from '@/services/predicao-producao.service';

// ==========================================
// Hook de Predição de Produção (IA)
// ==========================================

/**
 * Predição de produção é calculada sob demanda (POST), então é exposta como mutação.
 * O resultado fica em `predicao`; estados de erro/loading acompanham a chamada.
 */
export function usePredicaoProducao() {
  const mutation = useMutation({
    mutationFn: (idFemea: string) => predicaoProducaoService.predizer(idFemea),
  });

  return {
    predizer: mutation.mutateAsync,
    isPredizendo: mutation.isPending,
    predicao: mutation.data as PredicaoProducao | undefined,
    error: mutation.error,
    reset: mutation.reset,
  };
}
