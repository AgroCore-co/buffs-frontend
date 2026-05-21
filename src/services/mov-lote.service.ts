import apiClient from '@/lib/apiClient';
import { toCamelCase } from '@/lib/toCamelCase';

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
  // Joins retornados pela API (nomes gerados pelo ORM)
  grupo?: {
    nomeGrupo: string;
  };
  loteIdLoteAnterior?: {
    nomeLote: string;
  } | null;
  loteIdLoteAtual?: {
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
  idMovimento: string;
  idLoteAnterior: string | null;
  idLoteAtual: string;
  dtEntrada: string;
  dtSaida: string | null;
  diasPermanencia: number;
  status: string;
}

export interface HistoricoGrupoResponse {
  grupoId: string;
  totalMovimentacoes: number;
  historico: MovimentoHistoricoDetalhe[];
}

export interface StatusGrupoResponse {
  grupoId: string;
  localizacaoAtual: {
    idLote: string;
    desde: string;
    diasNoLocal: number;
  };
}

// ==========================================
// SERVIÇO DE MOVIMENTAÇÃO DE LOTES
// ==========================================

export const movLoteService = {
  async create(data: CreateMovLoteDTO): Promise<MovimentacaoLote> {
    const response = await apiClient.post<MovimentacaoLote>('/mov-lote', data);
    return toCamelCase<MovimentacaoLote>(response.data);
  },

  async getAll(page: number = 1, limit: number = 10): Promise<MovLoteListResponse> {
    const response = await apiClient.get<MovLoteListResponse>('/mov-lote', {
      params: { page, limit },
    });
    return toCamelCase<MovLoteListResponse>(response.data);
  },

  async getByPropriedade(idPropriedade: string, page: number = 1, limit: number = 10): Promise<MovLotePaginatedResponse> {
    const response = await apiClient.get<MovLotePaginatedResponse>(`/mov-lote/propriedade/${idPropriedade}`, {
      params: { page, limit },
    });
    return toCamelCase<MovLotePaginatedResponse>(response.data);
  },

  async getById(id: string): Promise<MovimentacaoLote> {
    const response = await apiClient.get<MovimentacaoLote>(`/mov-lote/${id}`);
    return toCamelCase<MovimentacaoLote>(response.data);
  },

  async update(id: string, data: UpdateMovLoteDTO): Promise<void> {
    await apiClient.patch(`/mov-lote/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/mov-lote/${id}`);
  },

  async getHistoricoByGrupo(idGrupo: string): Promise<HistoricoGrupoResponse> {
    const response = await apiClient.get<HistoricoGrupoResponse>(`/mov-lote/historico/grupo/${idGrupo}`);
    return toCamelCase<HistoricoGrupoResponse>(response.data);
  },

  async getStatusByGrupo(idGrupo: string): Promise<StatusGrupoResponse> {
    const response = await apiClient.get<StatusGrupoResponse>(`/mov-lote/status/grupo/${idGrupo}`);
    return toCamelCase<StatusGrupoResponse>(response.data);
  },
};
