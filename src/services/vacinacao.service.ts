import apiClient from '@/lib/apiClient';

// ==========================================
// DTOs (Data Transfer Objects)
// ==========================================

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Dados da medicação (vacina) incluídos nos registros de vacinação.
 */
export interface MedicacaoResumo {
  medicacao: string | null;
  tipoTratamento: string | null;
  descricao?: string | null;
}

/**
 * Estrutura de um registro de vacinação retornado pela API.
 * Persistido na mesma tabela de dados sanitários (campo idSanit como PK).
 */
export interface Vacinacao {
  idSanit: string;
  idBufalo: string;
  idUsuario: string;
  idMedicao: string | null;
  dtAplicacao: string;
  dosagem: string;
  unidadeMedida: string;
  doenca: string;
  necessitaRetorno: boolean;
  dtRetorno: string | null;
  observacao: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  // Joins retornados pela API
  medicacoe?: MedicacaoResumo;
  medicacoes?: MedicacaoResumo;
}

export interface VacinacaoPaginatedResponse {
  data: Vacinacao[];
  meta: PaginationMeta;
}

export interface PaginacaoParams {
  page?: number;
  limit?: number;
}

/**
 * Payload para criar/atualizar um registro de vacinação.
 * Atenção aos nomes em snake_case esperados pela API (unidade_medida, necessita_retorno).
 */
export interface VacinacaoDTO {
  idMedicacao: string;
  dtAplicacao: string;
  dosagem?: number;
  unidade_medida?: string;
  doenca?: string;
  necessita_retorno?: boolean;
  dtRetorno?: string | null;
}

// ==========================================
// SERVIÇO DE VACINAÇÃO
// ==========================================

/**
 * Serviço centralizado para aplicação e histórico de vacinação de búfalos.
 */
export const vacinacaoService = {
  /**
   * Cria um registro de vacinação para um búfalo específico.
   * @param idBufalo ID do búfalo que recebeu a vacina
   * @param data Dados da vacinação
   */
  async create(idBufalo: string, data: VacinacaoDTO): Promise<Vacinacao> {
    const response = await apiClient.post<Vacinacao>(`/vacinacao/bufalo/${idBufalo}`, data);
    return response.data;
  },

  /**
   * Lista todos os registros de vacinação de um búfalo com paginação.
   * @param idBufalo ID do búfalo
   * @param params Parâmetros de paginação (page, limit)
   */
  async getByBufalo(idBufalo: string, params?: PaginacaoParams): Promise<VacinacaoPaginatedResponse> {
    const response = await apiClient.get<VacinacaoPaginatedResponse>(`/vacinacao/bufalo/${idBufalo}`, {
      params: {
        page: params?.page ?? 1,
        limit: params?.limit ?? 10,
      },
    });
    return response.data;
  },

  /**
   * Lista apenas vacinas específicas de um búfalo com paginação.
   * @param idBufalo ID do búfalo
   * @param params Parâmetros de paginação (page, limit)
   */
  async getVacinasByBufalo(idBufalo: string, params?: PaginacaoParams): Promise<VacinacaoPaginatedResponse> {
    const response = await apiClient.get<VacinacaoPaginatedResponse>(
      `/vacinacao/bufalo/${idBufalo}/vacinas`,
      {
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
        },
      },
    );
    return response.data;
  },

  /**
   * Busca um registro de vacinação pelo seu ID.
   */
  async getById(id: string): Promise<Vacinacao> {
    const response = await apiClient.get<Vacinacao>(`/vacinacao/${id}`);
    return response.data;
  },

  /**
   * Atualiza parcialmente um registro de vacinação.
   */
  async update(id: string, data: Partial<VacinacaoDTO>): Promise<Vacinacao> {
    const response = await apiClient.patch<Vacinacao>(`/vacinacao/${id}`, data);
    return response.data;
  },

  /**
   * Remove logicamente um registro de vacinação (soft delete).
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/vacinacao/${id}`);
  },

  /**
   * Restaura um registro de vacinação removido (soft delete).
   */
  async restore(id: string): Promise<Vacinacao> {
    const response = await apiClient.post<Vacinacao>(`/vacinacao/${id}/restore`);
    return response.data;
  },

  /**
   * Lista todos os registros de vacinação incluindo os removidos (soft delete).
   */
  async getAllIncludingDeleted(): Promise<Vacinacao[]> {
    const response = await apiClient.get<Vacinacao[]>('/vacinacao/deleted/all');
    return response.data;
  },
};
