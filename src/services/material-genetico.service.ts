import apiClient from '@/lib/apiClient';

// ==========================================
// DTOs
// ==========================================

export type TipoMaterial = 'Sêmen' | 'Embrião' | 'Óvulo';
export type OrigemMaterial = 'Coleta Própria' | 'Compra';

export interface MaterialGenetico {
  idMaterial: string;
  tipo: string | null;
  origem: string | null;
  idBufaloOrigem: string | null;
  fornecedor: string | null;
  dataColeta: string | null;
  idPropriedade: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface MaterialGeneticoPaginatedResponse {
  data: MaterialGenetico[];
  meta: PaginationMeta;
}

export interface PaginacaoParams {
  page?: number;
  limit?: number;
}

export interface CreateMaterialGeneticoDTO {
  idPropriedade: string;
  tipo: TipoMaterial;
  origem: OrigemMaterial;
  idBufaloOrigem?: string;
  fornecedor?: string;
  dataColeta: string;
}

export type UpdateMaterialGeneticoDTO = Partial<CreateMaterialGeneticoDTO>;

export const TIPO_MATERIAL_OPTIONS: TipoMaterial[] = ['Sêmen', 'Embrião', 'Óvulo'];
export const ORIGEM_MATERIAL_OPTIONS: OrigemMaterial[] = ['Coleta Própria', 'Compra'];

// ==========================================
// SERVIÇO
// ==========================================

export const materialGeneticoService = {
  async getByPropriedade(
    idPropriedade: string,
    params?: PaginacaoParams,
  ): Promise<MaterialGeneticoPaginatedResponse> {
    const response = await apiClient.get<MaterialGeneticoPaginatedResponse>(
      `/material-genetico/propriedade/${idPropriedade}`,
      { params: { page: params?.page ?? 1, limit: params?.limit ?? 10 } },
    );
    return response.data;
  },

  async getById(id: string): Promise<MaterialGenetico> {
    const response = await apiClient.get<MaterialGenetico>(`/material-genetico/${id}`);
    return response.data;
  },

  async create(data: CreateMaterialGeneticoDTO): Promise<MaterialGenetico> {
    const response = await apiClient.post<{ message: string; data: MaterialGenetico }>(
      '/material-genetico',
      data,
    );
    return response.data.data;
  },

  async update(id: string, data: UpdateMaterialGeneticoDTO): Promise<MaterialGenetico> {
    const response = await apiClient.patch<MaterialGenetico>(`/material-genetico/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/material-genetico/${id}`);
  },

  async restore(id: string): Promise<void> {
    await apiClient.post(`/material-genetico/${id}/restore`);
  },

  async getAllDeleted(): Promise<MaterialGenetico[]> {
    const response = await apiClient.get<MaterialGenetico[]>('/material-genetico/deleted/all');
    return response.data;
  },
};
