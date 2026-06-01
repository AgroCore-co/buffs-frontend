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
 * Animal (matriz ou touro) embutido no registro de reprodução.
 */
export interface ReproducaoAnimal {
  idBufalo: string;
  nome: string;
  brinco: string;
  microchip?: string | null;
}

/**
 * Registro de reprodução (cobertura/inseminação).
 * A API mantém os joins com os nomes de relação `bufalo_idBufala` (matriz)
 * e `bufalo_idBufalo` (touro).
 */
export interface Reproducao {
  idReproducao: string;
  idBufala: string;
  idBufalo: string | null;
  idSemen: string | null;
  tipoInseminacao: string;
  status: string;
  tipoParto: string | null;
  dtEvento: string;
  ocorrencia: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  // Joins retornados pela API
  bufalo_idBufala?: ReproducaoAnimal | null; // matriz
  bufalo_idBufalo?: ReproducaoAnimal | null; // touro
}

export interface ReproducaoPaginatedResponse {
  data: Reproducao[];
  meta: PaginationMeta;
}

export interface PaginacaoParams {
  page?: number;
  limit?: number;
}

// ==========================================
// SERVIÇO DE REPRODUÇÃO (COBERTURAS)
// ==========================================

export const reproducaoService = {
  /**
   * Lista os registros de reprodução (coberturas) de uma propriedade com paginação.
   */
  async getByPropriedade(idPropriedade: string, params?: PaginacaoParams): Promise<ReproducaoPaginatedResponse> {
    const response = await apiClient.get<ReproducaoPaginatedResponse>(`/cobertura/propriedade/${idPropriedade}`, {
      params: {
        page: params?.page ?? 1,
        limit: params?.limit ?? 10,
      },
    });
    return response.data;
  },

  /**
   * Busca um registro de reprodução pelo ID.
   */
  async getById(id: string): Promise<Reproducao> {
    const response = await apiClient.get<Reproducao>(`/cobertura/${id}`);
    return response.data;
  },
};
