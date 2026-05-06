import apiClient from '@/lib/apiClient';

// ==========================================
// DTOs (Data Transfer Objects)
// ==========================================

/**
 * Estrutura do grupo vinculado a um lote.
 */
export interface GrupoLote {
  idGrupo: string;
  nomeGrupo: string;
  color: string;
}

/**
 * Estrutura de um lote (piquete) retornado pela API.
 * O campo geoMapa já vem parseado como um objeto GeoJSON.
 */
export interface Lote {
  idLote: string;
  tipoLote: string | null;
  nomeLote: string;
  idPropriedade: string;
  status: string;
  descricao: string;
  qtdMax: number;
  geoMapa: Record<string, unknown> | null; // GeoJSON object
  areaM2: string;
  createdAt: string;
  updatedAt: string;
  idGrupo: string | null;
  deletedAt: string | null;
  grupo?: GrupoLote;
}

/**
 * Payload para criar um novo lote.
 * IMPORTANTE: geo_mapa deve ser enviado como string (JSON.stringify).
 */
export interface CreateLoteDTO {
  nomeLote: string;
  idPropriedade: string;
  idGrupo?: string;
  tipoLote?: string;
  status?: string;
  descricao?: string;
  qtd_max?: number;
  area_m2?: number;
  geo_mapa?: string; 
}

/**
 * Payload para atualizar um lote existente.
 * Todos os campos são opcionais. 
 * IMPORTANTE: Se for atualizar a geometria, geo_mapa deve ser string.
 */
export interface UpdateLoteDTO {
  nomeLote?: string;
  idPropriedade?: string;
  idGrupo?: string;
  tipoLote?: string;
  status?: string;
  descricao?: string;
  qtd_max?: number;
  area_m2?: number;
  geo_mapa?: string;
}

// ==========================================
// SERVIÇO DE LOTES (PIQUETES)
// ==========================================

/**
 * Serviço centralizado para operações CRUD de lotes/piquetes.
 * Utiliza o apiClient customizado para injeção automática de tokens.
 */
export const lotesService = {
  /**
   * Lista todos os lotes de uma propriedade específica.
   * @param idPropriedade UUID da propriedade
   * @returns Array de lotes com geometria e dados do grupo.
   */
  async getByPropriedade(idPropriedade: string): Promise<Lote[]> {
    const response = await apiClient.get<Lote[]>(`/lotes/propriedade/${idPropriedade}`);
    return response.data;
  },

  /**
   * Busca um lote específico pelo seu UUID.
   * Retorna 404 se o lote não existir ou não pertencer ao escopo do usuário.
   * @param id UUID do lote
   * @returns Dados completos do lote.
   */
  async getById(id: string): Promise<Lote> {
    const response = await apiClient.get<Lote>(`/lotes/${id}`);
    return response.data;
  },

  /**
   * Cria um novo lote vinculado a uma propriedade.
   * @param data Dados do lote a ser criado (lembre-se de fazer JSON.stringify no geo_mapa)
   * @returns Dados do lote criado.
   */
  async create(data: CreateLoteDTO): Promise<Lote> {
    const response = await apiClient.post<Lote>('/lotes', data);
    return response.data;
  },

  /**
   * Atualiza parcialmente um lote existente.
   * @param id UUID do lote
   * @param data Campos a serem atualizados
   */
  async update(id: string, data: UpdateLoteDTO): Promise<void> {
    await apiClient.patch(`/lotes/${id}`, data);
  },

  /**
   * Remove um lote do sistema.
   * Retorna 404 se o lote não existir.
   * @param id UUID do lote a ser removido
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/lotes/${id}`);
  },
};