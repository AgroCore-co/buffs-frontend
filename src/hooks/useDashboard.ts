// ==========================================
// Imports e Query Keys
// ==========================================

import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboard.service';

/**
 * Chaves de cache centralizadas para o domínio de Dashboards.
 */
export const DASHBOARD_QUERY_KEYS = {
  geral: (idPropriedade: string) => ['dashboard', 'geral', idPropriedade] as const,
  lactacao: (idPropriedade: string, ano?: number) => ['dashboard', 'lactacao', idPropriedade, ano] as const,
  producaoMensal: (idPropriedade: string, ano?: number) => ['dashboard', 'producaoMensal', idPropriedade, ano] as const,
  reproducao: (idPropriedade: string) => ['dashboard', 'reproducao', idPropriedade] as const,
};

// ==========================================
// Hooks Individuais de Dashboard
// ==========================================

/**
 * Busca as estatísticas gerais da propriedade (animais, lotes, usuários, raças).
 */
export function useDashboardGeral(idPropriedade?: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.geral(idPropriedade!),
    queryFn: () => dashboardService.getGeral(idPropriedade!),
    enabled: !!idPropriedade && options?.enabled !== false,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Busca as métricas de lactação por ciclo (búfalas fêmeas).
 */
export function useDashboardLactacao(idPropriedade?: string, ano?: number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.lactacao(idPropriedade!, ano),
    queryFn: () => dashboardService.getLactacao(idPropriedade!, ano),
    enabled: !!idPropriedade && options?.enabled !== false,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Busca as métricas de produção mensal de leite (série histórica e comparativos).
 */
export function useDashboardProducaoMensal(idPropriedade?: string, ano?: number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.producaoMensal(idPropriedade!, ano),
    queryFn: () => dashboardService.getProducaoMensal(idPropriedade!, ano),
    enabled: !!idPropriedade && options?.enabled !== false,
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
}

/**
 * Busca as métricas de reprodução consolidadas.
 */
export function useDashboardReproducao(idPropriedade?: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.reproducao(idPropriedade!),
    queryFn: () => dashboardService.getReproducao(idPropriedade!),
    enabled: !!idPropriedade && options?.enabled !== false,
    staleTime: 5 * 60 * 1000,
  });
}
