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
  idPropriedade: string;
  tipoAlimentacao: string;
  descricao?: string;
}

export interface UpdateAlimentacaoDefDTO {
  tipoAlimentacao?: string;
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
  idPropriedade: string;
  idGrupo: string;
  idAlimentDef: string;
  quantidade: number;
  unidadeMedida: string;
  freqDia?: number;
  dtRegistro?: string; // Formato ISO 8601
}

export interface UpdateAlimentacaoRegistroDTO {
  quantidade?: number;
  unidadeMedida?: string;
  freqDia?: number;
  dtRegistro?: string;
}

// ==========================================================
// SERVIÇO 1: DEFINIÇÕES DE ALIMENTAÇÃO
// ==========================================================

export const alimentacaoDefService = {
  async getByPropriedade(idPropriedade: string, page: number = 1, limit: number = 10): Promise<AlimentacaoDefPaginatedResponse> {
    const response = await apiClient.get<AlimentacaoDefPaginatedResponse>(`/alimentacoes-def/propriedade/${idPropriedade}`, {
      params: { page, limit },
    });
    return response.data;
  },

  async getById(id: string): Promise<AlimentacaoDef> {
    const response = await apiClient.get<AlimentacaoDef>(`/alimentacoes-def/${id}`);
    return response.data;
  },

  async create(data: CreateAlimentacaoDefDTO): Promise<AlimentacaoDef> {
    const response = await apiClient.post<AlimentacaoDef>('/alimentacoes-def', {
      id_propriedade: data.idPropriedade,
      tipo_alimentacao: data.tipoAlimentacao,
      descricao: data.descricao,
    });
    return response.data;
  },

  async update(id: string, data: UpdateAlimentacaoDefDTO): Promise<void> {
    await apiClient.patch(`/alimentacoes-def/${id}`, {
      ...(data.tipoAlimentacao !== undefined && { tipo_alimentacao: data.tipoAlimentacao }),
      ...(data.descricao !== undefined && { descricao: data.descricao }),
    });
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/alimentacoes-def/${id}`);
  },
};

// ==========================================================
// SERVIÇO 2: REGISTROS DE ALIMENTAÇÃO (Operacional)
// ==========================================================

export const alimentacaoRegistroService = {
  async getByPropriedade(idPropriedade: string, page: number = 1, limit: number = 10): Promise<AlimentacaoRegistroPaginatedResponse> {
    const response = await apiClient.get<AlimentacaoRegistroPaginatedResponse>(`/alimentacao/registros/propriedade/${idPropriedade}`, {
      params: { page, limit },
    });
    return response.data;
  },

  async getById(id: string): Promise<AlimentacaoRegistro> {
    const response = await apiClient.get<AlimentacaoRegistro>(`/alimentacao/registros/${id}`);
    return response.data;
  },

  async create(data: CreateAlimentacaoRegistroDTO): Promise<AlimentacaoRegistro> {
    const response = await apiClient.post<AlimentacaoRegistro>('/alimentacao/registros', {
      id_propriedade: data.idPropriedade,
      id_grupo: data.idGrupo,
      id_aliment_def: data.idAlimentDef,
      quantidade: data.quantidade,
      unidade_medida: data.unidadeMedida,
      ...(data.freqDia !== undefined && { freq_dia: data.freqDia }),
      ...(data.dtRegistro && { dt_registro: data.dtRegistro }),
    });
    return response.data;
  },

  async update(id: string, data: UpdateAlimentacaoRegistroDTO): Promise<void> {
    await apiClient.patch(`/alimentacao/registros/${id}`, {
      ...(data.quantidade !== undefined && { quantidade: data.quantidade }),
      ...(data.unidadeMedida !== undefined && { unidade_medida: data.unidadeMedida }),
      ...(data.freqDia !== undefined && { freq_dia: data.freqDia }),
      ...(data.dtRegistro && { dt_registro: data.dtRegistro }),
    });
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/alimentacao/registros/${id}`);
  },
};
