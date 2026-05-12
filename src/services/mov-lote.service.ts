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

// ==========================================
// DTOs - MOVIMENTAÇÃO DE LOTE
// ==========================================

export interface MovimentacaoLote {
  idMovimento: string;
  idGrupo: string;
  idLoteAnterior: string | null;
  idLoteAtual: string;
  dtEntrada: string; // ISO 8601
  dtSaida: string | null; // ISO 8601
  idPropriedade: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  // Joins retornados pela API
  grupo?: {
    nomeGrupo: string;
  };
  lote_idLoteAnterior?: {
    nomeLote: string;
  } | null;
  lote_idLoteAtual?: {
    nomeLote: string;
  };
}

export interface MovLoteListResponse {
  registros: MovimentacaoLote[];
  total: number;
}

export interface MovLotePaginatedResponse {
  data: MovimentacaoLote[];
  meta: PaginationMeta;
}

export interface CreateMovLoteDTO {
  idPropriedade: string;
  idGrupo: string;
  idLoteAnterior?: string | null;
  idLoteAtual: string;
  dtEntrada: string; // ISO 8601
  dtSaida?: string | null; // ISO 8601
}

export interface UpdateMovLoteDTO {
  idPropriedade?: string;
  idGrupo?: string;
  idLoteAnterior?: string | null;
  idLoteAtual?: string;
  dtEntrada?: string;
  dtSaida?: string | null;
}

// ==========================================
// DTOs - HISTÓRICO E STATUS DE GRUPO
// ==========================================

export interface MovimentoHistoricoDetalhe {
  id_movimento: string;
  id_lote_anterior: string | null;
  id_lote_atual: string;
  dt_entrada: string;
  dt_saida: string | null;
  dias_permanencia: number;
  status: string;
}

export interface HistoricoGrupoResponse {
  grupo_id: string;
  total_movimentacoes: number;
  historico: MovimentoHistoricoDetalhe[];
}

export interface StatusGrupoResponse {
  grupo_id: string;
  localizacao_atual: {
    id_lote: string;
    desde: string;
    dias_no_local: number;
  };
}

// ==========================================
// SERVIÇO DE MOVIMENTAÇÃO DE LOTES
// ==========================================

export const movLoteService = {
  /**
   * Registra movimentação física de um grupo para um novo lote.
   */
  async create(data: CreateMovLoteDTO): Promise<MovimentacaoLote> {
    const response = await apiClient.post<MovimentacaoLote>('/mov-lote', data);
    return response.data;
  },

  /**
   * Lista todas as movimentações de lotes no sistema (paginado).
   */
  async getAll(page: number = 1, limit: number = 10): Promise<MovLoteListResponse> {
    const response = await apiClient.get<MovLoteListResponse>('/mov-lote', {
      params: { page, limit },
    });
    return response.data;
  },

  /**
   * Lista movimentações de lotes de uma propriedade específica com paginação.
   */
  async getByPropriedade(idPropriedade: string, page: number = 1, limit: number = 10): Promise<MovLotePaginatedResponse> {
    const response = await apiClient.get<MovLotePaginatedResponse>(`/mov-lote/propriedade/${idPropriedade}`, {
      params: { page, limit },
    });
    return response.data;
  },

  /**
   * Busca uma movimentação específica pelo seu ID.
   */
  async getById(id: string): Promise<MovimentacaoLote> {
    const response = await apiClient.get<MovimentacaoLote>(`/mov-lote/${id}`);
    return response.data;
  },

  /**
   * Atualiza os dados de uma movimentação existente.
   */
  async update(id: string, data: UpdateMovLoteDTO): Promise<void> {
    await apiClient.patch(`/mov-lote/${id}`, data);
  },

  /**
   * Remove o registro de uma movimentação.
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/mov-lote/${id}`);
  },

  /**
   * Busca o histórico completo de movimentações de um grupo.
   */
  async getHistoricoByGrupo(idGrupo: string): Promise<HistoricoGrupoResponse> {
    const response = await apiClient.get<HistoricoGrupoResponse>(`/mov-lote/historico/grupo/${idGrupo}`);
    return response.data;
  },

  /**
   * Verifica o status atual de localização de um grupo.
   */
  async getStatusByGrupo(idGrupo: string): Promise<StatusGrupoResponse> {
    const response = await apiClient.get<StatusGrupoResponse>(`/mov-lote/status/grupo/${idGrupo}`);
    return response.data;
  },
};