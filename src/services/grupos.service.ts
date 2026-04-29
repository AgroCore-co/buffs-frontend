import apiClient from '@/lib/apiClient';

// ==========================================
// DTOs (Data Transfer Objects)
// ==========================================

export interface Grupo {
  idGrupo: string;
  nomeGrupo: string;
  color: string;
  idPropriedade: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  propriedade?: {
    nome: string;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface GruposPaginatedResponse {
  data: Grupo[];
  meta: PaginationMeta;
}

export interface CreateGrupoDTO {
  nomeGrupo: string;
  idPropriedade: string;
  color: string;
}

export interface UpdateGrupoDTO {
  nomeGrupo?: string;
  idPropriedade?: string;
  color?: string;
}

// ==========================================
// SERVIÇO DE GRUPOS DE MANEJO
// ==========================================

export const gruposService = {
  /**
   * Lista todos os grupos no sistema.
   */
  async getAll(): Promise<Grupo[]> {
    const response = await apiClient.get<Grupo[]>('/grupos');
    return response.data;
  },

  /**
   * Lista grupos de uma propriedade específica com paginação.
   * @param idPropriedade UUID da propriedade
   * @param page Número da página (padrão: 1)
   * @param limit Quantidade de itens por página (padrão: 10)
   */
  async getByPropriedade(idPropriedade: string, page: number = 1, limit: number = 10): Promise<GruposPaginatedResponse> {
    const response = await apiClient.get<GruposPaginatedResponse>(`/grupos/propriedade/${idPropriedade}`, {
      params: { page, limit },
    });
    return response.data;
  },

  /**
   * Busca um grupo específico pelo seu UUID.
   */
  async getById(id: string): Promise<Grupo> {
    const response = await apiClient.get<Grupo>(`/grupos/${id}`);
    return response.data;
  },

  /**
   * Cria um novo grupo.
   */
  async create(data: CreateGrupoDTO): Promise<Grupo> {
    const response = await apiClient.post<Grupo>('/grupos', data);
    return response.data;
  },

  /**
   * Atualiza um grupo existente.
   */
  async update(id: string, data: UpdateGrupoDTO): Promise<void> {
    await apiClient.patch(`/grupos/${id}`, data);
  },

  /**
   * Remove logicamente (soft delete) um grupo.
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/grupos/${id}`);
  },

  /**
   * Restaura um grupo que foi removido (soft delete).
   */
  async restore(id: string): Promise<void> {
    await apiClient.post(`/grupos/${id}/restore`);
  },

  /**
   * Retorna todos os grupos, incluindo os que foram removidos.
   */
  async getAllDeleted(): Promise<Grupo[]> {
    const response = await apiClient.get<Grupo[]>('/grupos/deleted/all');
    return response.data;
  },
};