import apiClient from '@/lib/apiClient';

// ==========================================
// DTOs
// ==========================================

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface Coleta {
  id_coleta?: string;
  id?: string;
  dt_coleta: string;
  quantidade: string | number;
  resultado_teste: boolean;
  observacao?: string | null;
  nome_empresa?: string | null;
  id_industria?: string | null;
  id_propriedade?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ColetaPaginatedResponse {
  data: Coleta[];
  meta: PaginationMeta;
}

export interface Laticinio {
  id_industria?: string;
  id?: string;
  nome: string;
  representante?: string | null;
  contato?: string | null;
  observacao?: string | null;
  id_propriedade?: string;
  created_at?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateLaticinioDTO {
  nome: string;
  representante?: string;
  contato?: string;
  observacao?: string;
  id_propriedade: string;
}

export interface UpdateLaticinioDTO {
  nome?: string;
  representante?: string;
  contato?: string;
  observacao?: string;
  id_propriedade?: string;
}

// ==========================================
// Coleta Service
// ==========================================

export const coletaService = {
  async getByPropriedade(
    idPropriedade: string,
    page = 1,
    limit = 10,
  ): Promise<ColetaPaginatedResponse> {
    const response = await apiClient.get<ColetaPaginatedResponse>(
      `/retiradas/propriedade/${idPropriedade}`,
      { params: { page, limit } },
    );
    return response.data;
  },

  async getById(id: string): Promise<Coleta> {
    const response = await apiClient.get<Coleta>(`/retiradas/${id}`);
    return response.data;
  },
};

// ==========================================
// Laticinio Service
// ==========================================

export const laticinioService = {
  async getByPropriedade(idPropriedade: string): Promise<Laticinio[]> {
    const response = await apiClient.get<Laticinio[]>(
      `/laticinios/propriedade/${idPropriedade}`,
    );
    return Array.isArray(response.data) ? response.data : [];
  },

  async getById(id: string): Promise<Laticinio> {
    const response = await apiClient.get<Laticinio>(`/laticinios/${id}`);
    return response.data;
  },

  async create(data: CreateLaticinioDTO): Promise<Laticinio> {
    const response = await apiClient.post<Laticinio>('/laticinios', data);
    return response.data;
  },

  async update(id: string, data: UpdateLaticinioDTO): Promise<Laticinio> {
    const response = await apiClient.patch<Laticinio>(`/laticinios/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/laticinios/${id}`);
  },
};
