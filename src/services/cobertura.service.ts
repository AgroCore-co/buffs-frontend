import apiClient from '@/lib/apiClient';

// ==========================================
// DTOs
// ==========================================

export interface BufaloRecomendado {
  idBufalo: string;
  nome: string;
  brinco: string;
  raca: string | null;
  score: number;
  idadeMeses: number | null;
  dados_reprodutivos?: {
    status?: string;
    [key: string]: unknown;
  } | null;
  motivos?: string[] | null;
}

export interface DetalhesConsanguinidade {
  e_meio_irmao: boolean;
  tem_parentesco_direto: boolean;
  tipo_parentesco_direto: string | null;
  coeficiente_decimal: number;
}

export interface PredicaoProducaoFemea {
  predicao_litros: number | null;
  producao_media_propriedade: number | null;
  percentual_vs_media: number | null;
  classificacao_potencial: string | null;
}

export interface ResultadoSimulacao {
  consanguinidade_prole: number;
  parentesco_pais: number;
  nivel_parentesco: string | null;
  risco_consanguinidade: string | null;
  recomendacao: string;
  detalhes: DetalhesConsanguinidade;
  predicao_producao_femea: PredicaoProducaoFemea | null;
}

// ==========================================
// Service
// ==========================================

export const coberturaService = {
  async getRecomendacoesFemeas(idPropriedade: string): Promise<BufaloRecomendado[]> {
    const response = await apiClient.get<BufaloRecomendado[]>(
      `/cobertura/recomendacoes/femeas/${idPropriedade}`,
    );
    return Array.isArray(response.data) ? response.data : [];
  },

  async getRecomendacoesMachos(idPropriedade: string): Promise<BufaloRecomendado[]> {
    const response = await apiClient.get<BufaloRecomendado[]>(
      `/cobertura/recomendacoes/machos/${idPropriedade}`,
    );
    return Array.isArray(response.data) ? response.data : [];
  },

  async simularAcasalamento(idMacho: string, idFemea: string): Promise<ResultadoSimulacao> {
    const response = await apiClient.post<ResultadoSimulacao>('/reproducao/simulacao', {
      idMacho,
      idFemea,
    });
    return response.data;
  },
};
