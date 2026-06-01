import { useQuery, useMutation } from '@tanstack/react-query';
import { coberturaService } from '@/services/cobertura.service';

export const COBERTURA_QUERY_KEYS = {
  recomendacoesFemeas: (idPropriedade: string) =>
    ['cobertura', 'recomendacoes', 'femeas', idPropriedade] as const,
  recomendacoesMachos: (idPropriedade: string) =>
    ['cobertura', 'recomendacoes', 'machos', idPropriedade] as const,
};

export function useRecomendacoesFemeas(idPropriedade?: string) {
  return useQuery({
    queryKey: COBERTURA_QUERY_KEYS.recomendacoesFemeas(idPropriedade!),
    queryFn: () => coberturaService.getRecomendacoesFemeas(idPropriedade!),
    enabled: !!idPropriedade,
    staleTime: 2 * 60 * 1000,
  });
}

export function useRecomendacoesMachos(idPropriedade?: string) {
  return useQuery({
    queryKey: COBERTURA_QUERY_KEYS.recomendacoesMachos(idPropriedade!),
    queryFn: () => coberturaService.getRecomendacoesMachos(idPropriedade!),
    enabled: !!idPropriedade,
    staleTime: 2 * 60 * 1000,
  });
}

export function useSimularAcasalamento() {
  return useMutation({
    mutationFn: ({ idMacho, idFemea }: { idMacho: string; idFemea: string }) =>
      coberturaService.simularAcasalamento(idMacho, idFemea),
  });
}
