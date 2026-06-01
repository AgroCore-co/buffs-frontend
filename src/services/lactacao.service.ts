import apiClient from '@/lib/apiClient';
import { toCamelCase } from '@/lib/toCamelCase';

// ==========================================
// DTOs (Data Transfer Objects)
// ==========================================

/**
 * Estatísticas dos ciclos de lactação de uma propriedade.
 * (Backend responde em snake_case — normalizado para camelCase.)
 */
export interface EstatisticasLactacao {
  totalCiclos: number;
  ciclosAtivos: number;
  ciclosSecos: number;
  mediaDiasLactacao: number;
  ciclosProximosSecagem: number;
  ciclosSecagemAtrasada: number;
}

/**
 * Resumo do ciclo de lactação ativo de uma fêmea (na listagem de ordenha).
 */
export interface FemeaCicloAtual {
  idCicloLactacao: string;
  numeroCiclo: number;
  dtParto: string;
  diasEmLactacao: number;
  dtSecagemPrevista: string | null;
  status: string;
}

export interface FemeaUltimaOrdenha {
  data: string;
  quantidade: number;
  periodo: string;
}

export interface FemeaProducaoAtual {
  totalProduzido: number;
  mediaDiaria: number;
  ultimaOrdenha: FemeaUltimaOrdenha | null;
}

/**
 * Fêmea em lactação disponível para ordenha.
 */
export interface FemeaEmLactacao {
  idBufalo: string;
  nome: string;
  brinco: string;
  idadeMeses: number;
  raca: string;
  classificacao: string;
  cicloAtual: FemeaCicloAtual;
  producaoAtual: FemeaProducaoAtual;
}

// ==========================================
// SERVIÇO DE LACTAÇÃO
// ==========================================

export const lactacaoService = {
  /**
   * Estatísticas dos ciclos de lactação da propriedade (total de ciclos, ativos, etc.).
   */
  async getEstatisticas(idPropriedade: string): Promise<EstatisticasLactacao> {
    const response = await apiClient.get(`/lactacao/propriedade/${idPropriedade}/estatisticas`);
    return toCamelCase<EstatisticasLactacao>(response.data);
  },

  /**
   * Lista as fêmeas com ciclo de lactação ativo, disponíveis para ordenha.
   * O endpoint retorna um array simples (sem paginação).
   */
  async getFemeasEmLactacao(idPropriedade: string): Promise<FemeaEmLactacao[]> {
    const response = await apiClient.get(`/ordenhas/femeas/em-lactacao/${idPropriedade}`);
    return toCamelCase<FemeaEmLactacao[]>(response.data);
  },
};
