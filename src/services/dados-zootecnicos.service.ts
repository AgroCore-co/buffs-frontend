import apiClient from '@/lib/apiClient';

// ==========================================
// DTOs (Data Transfer Objects)
// ==========================================

/**
 * Meta de paginação retornada pela API.
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Dados resumidos do búfalo incluídos nos registros zootécnicos
 * (presentes apenas na listagem por propriedade e no getById).
 */
export interface BufaloResumo {
  brinco: string;
  nome: string;
}

/**
 * Estrutura de um registro zootécnico retornado pela API.
 * Atenção: peso e condicaoCorporal são retornados como string (ex: "613.32").
 */
export interface DadoZootecnico {
  idZootec: string;
  idBufalo: string;
  idUsuario: string;
  peso: string;
  condicaoCorporal: string;
  corPelagem: string;
  formatoChifre: string;
  porteCorporal: string;
  dtRegistro: string; // ex: "2025-11-01 00:00:00+00"
  tipoPesagem: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  bufalo?: BufaloResumo;
}

/**
 * Resposta paginada de registros zootécnicos.
 */
export interface DadosZootecnicosPaginados {
  data: DadoZootecnico[];
  meta: PaginationMeta;
}

/**
 * Parâmetros de paginação.
 */
export interface PaginacaoParams {
  page?: number;
  limit?: number;
}

/**
 * Payload para criar um registro zootécnico.
 */
export interface CreateDadoZootecnicoDTO {
  peso: number;
  condicaoCorporal: number;
  corPelagem?: string;
  formatoChifre?: string;
  porteCorporal?: string;
  dtRegistro: string; // Formato ISO 8601 (ex: "2025-02-10")
  tipoPesagem?: string;
}

/**
 * Payload para atualizar um registro zootécnico.
 * Todos os campos são opcionais — envie apenas o que deseja alterar.
 */
export type UpdateDadoZootecnicoDTO = Partial<CreateDadoZootecnicoDTO>;

// ==========================================
// SERVIÇO DE DADOS ZOOTÉCNICOS
// ==========================================

/**
 * Serviço centralizado para registros zootécnicos e métricas de campo
 * (peso, escore de condição corporal, formato de chifre, porte, etc.).
 */
export const dadosZootecnicosService = {
  /**
   * Cria um novo registro zootécnico para um búfalo específico.
   * @param idBufalo ID do búfalo ao qual o registro pertence
   * @param data Dados da métrica (peso, condição corporal, etc.)
   * @returns Registro zootécnico criado
   */
  async create(idBufalo: string, data: CreateDadoZootecnicoDTO): Promise<DadoZootecnico> {
    const response = await apiClient.post<DadoZootecnico>(
      `/dados-zootecnicos/bufalo/${idBufalo}`,
      data,
    );
    return response.data;
  },

  /**
   * Lista todos os registros zootécnicos de um búfalo com paginação.
   * @param idBufalo ID do búfalo
   * @param params Parâmetros de paginação (page, limit)
   * @returns Lista paginada de registros zootécnicos do búfalo
   */
  async getByBufalo(
    idBufalo: string,
    params?: PaginacaoParams,
  ): Promise<DadosZootecnicosPaginados> {
    const response = await apiClient.get<DadosZootecnicosPaginados>(
      `/dados-zootecnicos/bufalo/${idBufalo}`,
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
   * Lista todos os registros zootécnicos de uma propriedade com paginação.
   * @param idPropriedade ID da propriedade
   * @param params Parâmetros de paginação (page, limit)
   * @returns Lista paginada de registros zootécnicos da propriedade
   */
  async getByPropriedade(
    idPropriedade: string,
    params?: PaginacaoParams,
  ): Promise<DadosZootecnicosPaginados> {
    const response = await apiClient.get<DadosZootecnicosPaginados>(
      `/dados-zootecnicos/propriedade/${idPropriedade}`,
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
   * Busca um registro zootécnico pelo seu ID.
   * @param id ID do registro zootécnico
   * @returns Dados do registro zootécnico
   */
  async getById(id: string): Promise<DadoZootecnico> {
    const response = await apiClient.get<DadoZootecnico>(`/dados-zootecnicos/${id}`);
    return response.data;
  },

  /**
   * Atualiza parcialmente um registro zootécnico existente.
   * @param id ID do registro zootécnico
   * @param data Campos a serem atualizados
   * @returns Registro zootécnico atualizado
   */
  async update(id: string, data: UpdateDadoZootecnicoDTO): Promise<DadoZootecnico> {
    const response = await apiClient.patch<DadoZootecnico>(`/dados-zootecnicos/${id}`, data);
    return response.data;
  },

  /**
   * Remove logicamente um registro zootécnico (soft delete).
   * Use restore() para restaurar.
   * @param id ID do registro a ser removido
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/dados-zootecnicos/${id}`);
  },

  /**
   * Restaura um registro zootécnico que foi removido (soft delete).
   * @param id ID do registro a ser restaurado
   * @returns Registro zootécnico restaurado
   */
  async restore(id: string): Promise<DadoZootecnico> {
    const response = await apiClient.post<DadoZootecnico>(`/dados-zootecnicos/${id}/restore`);
    return response.data;
  },

  /**
   * Lista todos os registros zootécnicos incluindo os removidos (soft delete).
   * @returns Lista completa de registros zootécnicos
   */
  async getAllIncludingDeleted(): Promise<DadoZootecnico[]> {
    const response = await apiClient.get<DadoZootecnico[]>('/dados-zootecnicos/deleted/all');
    return response.data;
  },
};
