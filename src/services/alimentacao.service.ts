import apiClient from '@/lib/apiClient';

// ==========================================
// DTOs (Data Transfer Objects) - Comuns
// ==========================================

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// ==========================================================
// DTOs - DEFINIÇÕES DE ALIMENTAÇÃO (Tipos de Alimento)
// ==========================================================

export interface AlimentacaoDef {
  idAlimentDef: string;
  tipoAlimentacao: string;
  descricao: string;
  idPropriedade: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface AlimentacaoDefPaginatedResponse {
  data: AlimentacaoDef[];
  meta: PaginationMeta;
}

export interface CreateAlimentacaoDefDTO {
  id_propriedade: string;
  tipo_alimentacao: string;
  descricao?: string;
}

export interface UpdateAlimentacaoDefDTO {
  tipo_alimentacao?: string;
  descricao?: string;
}

// ==========================================================
// DTOs - REGISTROS DE ALIMENTAÇÃO (Ocorrências)
// ==========================================================

export interface AlimentacaoRegistro {
  idRegistro: string;
  idGrupo: string;
  idAlimentDef: string;
  quantidade: string | number; // A API retorna como string (ex: "50.50")
  unidadeMedida: string;
  freqDia: number;
  dtRegistro: string | null;
  idPropriedade: string;
  idUsuario: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  // Joins retornados pela API
  alimentacaodef?: {
    tipoAlimentacao: string;
    descricao: string;
  };
  grupo?: {
    nomeGrupo: string;
  };
  usuario?: {
    nome: string;
  };
}

export interface AlimentacaoRegistroPaginatedResponse {
  data: AlimentacaoRegistro[];
  meta: PaginationMeta;
}

export interface CreateAlimentacaoRegistroDTO {
  id_propriedade: string;
  id_grupo: string;
  id_aliment_def: string;
  quantidade: number;
  unidade_medida: string;
  freq_dia?: number;
  dt_registro?: string; // Formato ISO 8601
}

export interface UpdateAlimentacaoRegistroDTO {
  quantidade?: number;
  unidade_medida?: string;
  freq_dia?: number;
  dt_registro?: string;
}

// ==========================================================
// SERVIÇO 1: DEFINIÇÕES DE ALIMENTAÇÃO
// ==========================================================

export const alimentacaoDefService = {
  /**
   * Lista definições de alimentação de uma propriedade (Paginado).
   * @param idPropriedade UUID da propriedade
   * @param page Página atual (padrão 1)
   * @param limit Itens por página (padrão 10)
   */
  async getByPropriedade(idPropriedade: string, page: number = 1, limit: number = 10): Promise<AlimentacaoDefPaginatedResponse> {
    const response = await apiClient.get<AlimentacaoDefPaginatedResponse>(`/alimentacoes-def/propriedade/${idPropriedade}`, {
      params: { page, limit },
    });
    return response.data;
  },

  /**
   * Busca uma definição de alimentação específica pelo UUID.
   */
  async getById(id: string): Promise<AlimentacaoDef> {
    const response = await apiClient.get<AlimentacaoDef>(`/alimentacoes-def/${id}`);
    return response.data;
  },

  /**
   * Cria uma nova definição de alimentação.
   */
  async create(data: CreateAlimentacaoDefDTO): Promise<AlimentacaoDef> {
    const response = await apiClient.post<AlimentacaoDef>('/alimentacoes-def', data);
    return response.data;
  },

  /**
   * Atualiza uma definição de alimentação existente.
   */
  async update(id: string, data: UpdateAlimentacaoDefDTO): Promise<void> {
    await apiClient.patch(`/alimentacoes-def/${id}`, data);
  },

  /**
   * Remove uma definição de alimentação do sistema.
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/alimentacoes-def/${id}`);
  },
};

// ==========================================================
// SERVIÇO 2: REGISTROS DE ALIMENTAÇÃO (Operacional)
// ==========================================================

export const alimentacaoRegistroService = {
  /**
   * Lista registros de alimentação de uma propriedade (Paginado, com Joins).
   * @param idPropriedade UUID da propriedade
   * @param page Página atual (padrão 1)
   * @param limit Itens por página (padrão 10)
   */
  async getByPropriedade(idPropriedade: string, page: number = 1, limit: number = 10): Promise<AlimentacaoRegistroPaginatedResponse> {
    const response = await apiClient.get<AlimentacaoRegistroPaginatedResponse>(`/alimentacao/registros/propriedade/${idPropriedade}`, {
      params: { page, limit },
    });
    return response.data;
  },

  /**
   * Busca um registro de alimentação específico pelo UUID.
   */
  async getById(id: string): Promise<AlimentacaoRegistro> {
    const response = await apiClient.get<AlimentacaoRegistro>(`/alimentacao/registros/${id}`);
    return response.data;
  },

  /**
   * Cria um novo registro operacional de alimentação para um grupo.
   */
  async create(data: CreateAlimentacaoRegistroDTO): Promise<AlimentacaoRegistro> {
    const response = await apiClient.post<AlimentacaoRegistro>('/alimentacao/registros', data);
    return response.data;
  },

  /**
   * Atualiza parcialmente um registro de alimentação.
   */
  async update(id: string, data: UpdateAlimentacaoRegistroDTO): Promise<void> {
    await apiClient.patch(`/alimentacao/registros/${id}`, data);
  },

  /**
   * Remove um registro de alimentação.
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/alimentacao/registros/${id}`);
  },
};