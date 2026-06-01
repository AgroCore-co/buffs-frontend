import apiClient from '@/lib/apiClient';

// ==========================================
// DTOs (Data Transfer Objects)
// ==========================================

/**
 * Nó da árvore genealógica retornado por GET /reproducao/genealogia/{id}.
 * `pai`/`mae` podem vir como objeto aninhado, string (id/nome) ou null.
 */
export interface GenealogiaNode {
  id: string;
  nome: string;
  pai?: GenealogiaNode | string | null;
  mae?: GenealogiaNode | string | null;
}

/**
 * Análise genealógica completa (consanguinidade) — assistida por IA.
 */
export interface AnaliseGenealogica {
  idBufalo: string;
  sexo: string;
  consanguinidade: number;
  riscoGenetico: string;
  descricaoRisco: string;
  eFundador: boolean;
  pais: {
    paiId: string | null;
    maeId: string | null;
  };
  ancestrais: Record<string, string[]>;
  descendentes: Record<string, string[]>;
  resumo: {
    totalAncestrais: number;
    totalDescendentes: number;
    geracoesAncestrais: number;
    geracoesDescendentes: number;
  };
}

export interface MachoCompativel {
  idBufalo: string;
  nome: string;
  consanguinidadeEstimada: number;
  riscoGenetico: string;
  scoreCompatibilidade: number;
}

export interface MachosCompativeisResponse {
  femeaId: string;
  machosCompativeis: MachoCompativel[];
  totalEncontrados: number;
  limiteConsanguinidade: number;
}

// ==========================================
// SERVIÇO DE GENEALOGIA (IA)
// ==========================================

export const genealogiaService = {
  /**
   * Obtém a árvore genealógica de um búfalo.
   * @param id ID do búfalo
   * @param geracoes Número de gerações a exibir (padrão: 5)
   */
  async getArvore(id: string, geracoes: number = 5): Promise<GenealogiaNode> {
    const response = await apiClient.get<GenealogiaNode>(`/reproducao/genealogia/${id}`, {
      params: { geracoes },
    });
    return response.data;
  },

  /**
   * Análise genealógica completa com cálculo de consanguinidade (IA).
   * @param id ID do búfalo
   */
  async getAnalise(id: string): Promise<AnaliseGenealogica> {
    const response = await apiClient.get<AnaliseGenealogica>(`/reproducao/genealogia/${id}/analise`);
    return response.data;
  },

  /**
   * Lista machos compatíveis para acasalamento de uma fêmea (IA).
   * @param femeaId ID da fêmea
   * @param maxConsanguinidade Consanguinidade máxima aceitável em % (padrão: 6.25)
   */
  async getMachosCompativeis(
    femeaId: string,
    maxConsanguinidade: number = 6.25,
  ): Promise<MachosCompativeisResponse> {
    const response = await apiClient.get<MachosCompativeisResponse>(
      `/reproducao/genealogia/machos-compativeis/${femeaId}`,
      { params: { maxConsanguinidade } },
    );
    return response.data;
  },
};
