import apiClient from '@/lib/apiClient';

// ==========================================
// DTOs (Data Transfer Objects)
// ==========================================

export type ClassificacaoPotencial =
  | 'MUITO_BAIXA'
  | 'BAIXA'
  | 'MÉDIA'
  | 'MEDIA'
  | 'ALTA'
  | 'MUITO_ALTA'
  | string;

/**
 * Resultado da predição de produção de leite de uma fêmea (assistida por IA).
 */
export interface PredicaoProducao {
  idFemea: string;
  predicaoLitros: number;
  classificacaoPotencial: ClassificacaoPotencial;
  percentualVsMedia: number;
  producaoMediaPropriedade: number;
  idPropriedade: number | string;
  featuresUtilizadas: string[];
  dataPredicao: string; // ISO 8601
}

// ==========================================
// SERVIÇO DE PREDIÇÃO DE PRODUÇÃO (IA)
// ==========================================

export const predicaoProducaoService = {
  /**
   * Prediz a produção de leite de uma fêmea para o próximo ciclo de lactação.
   * @param idFemea UUID da fêmea
   * @returns Predição com litros estimados, classificação e comparativo com a média
   */
  async predizer(idFemea: string): Promise<PredicaoProducao> {
    const response = await apiClient.post<PredicaoProducao>('/producao/predicao', { idFemea });
    return response.data;
  },
};
