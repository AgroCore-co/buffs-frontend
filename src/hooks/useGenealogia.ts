// ==========================================
// Imports e Query Keys
// ==========================================

import { useQuery } from '@tanstack/react-query';
import { genealogiaService } from '@/services/genealogia.service';

export const GENEALOGIA_QUERY_KEYS = {
  arvore: (id: string, geracoes: number) => ['genealogia', id, 'arvore', geracoes] as const,
  analise: (id: string) => ['genealogia', id, 'analise'] as const,
  machosCompativeis: (femeaId: string, max: number) =>
    ['genealogia', femeaId, 'machos-compativeis', max] as const,
};

// ==========================================
// Hooks Individuais de Query
// ==========================================

export function useGenealogiaArvore(id?: string, geracoes: number = 5, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: GENEALOGIA_QUERY_KEYS.arvore(id!, geracoes),
    queryFn: () => genealogiaService.getArvore(id!, geracoes),
    enabled: !!id && options?.enabled !== false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAnaliseGenealogica(id?: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: GENEALOGIA_QUERY_KEYS.analise(id!),
    queryFn: () => genealogiaService.getAnalise(id!),
    enabled: !!id && options?.enabled !== false,
    staleTime: 10 * 60 * 1000,
    // Falhas de IA (503) não devem ser repetidas agressivamente.
    retry: false,
  });
}

export function useMachosCompativeis(
  femeaId?: string,
  maxConsanguinidade: number = 6.25,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: GENEALOGIA_QUERY_KEYS.machosCompativeis(femeaId!, maxConsanguinidade),
    queryFn: () => genealogiaService.getMachosCompativeis(femeaId!, maxConsanguinidade),
    enabled: !!femeaId && options?.enabled !== false,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
