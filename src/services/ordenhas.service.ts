import apiClient from '@/lib/apiClient';
import { toCamelCase } from '@/lib/toCamelCase';

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

export type PeriodoOrdenha = 'M' | 'T' | 'N';

export interface OrdenhaBufaloResumo {
  idBufalo: string;
  nome: string;
  brinco: string;
}

export interface OrdenhaUsuarioResumo {
  idUsuario: string;
  nome: string;
}

/**
 * Registro de ordenha individual retornado pela API.
 * Atenção: qtOrdenha vem como string (ex: "5.623").
 */
export interface Ordenha {
  idLact: string;
  idBufala: string;
  idUsuario: string;
  idCicloLactacao: string;
  qtOrdenha: string;
  periodo: PeriodoOrdenha | null;
  ocorrencia: string | null;
  dtOrdenha: string;
  idPropriedade: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  // Joins retornados em alguns endpoints
  bufalo?: OrdenhaBufaloResumo;
  usuario?: OrdenhaUsuarioResumo;
}

export interface OrdenhaPaginatedResponse {
  data: Ordenha[];
  meta: PaginationMeta;
}

export interface PaginacaoParams {
  page?: number;
  limit?: number;
}

/**
 * Payload para registrar/atualizar uma ordenha.
 * Pré-requisito: a búfala deve ter um ciclo de lactação ATIVO (idCicloLactacao).
 */
export interface CreateOrdenhaDTO {
  idBufala: string;
  idPropriedade: string;
  idCicloLactacao: string;
  qtOrdenha: number;
  periodo?: PeriodoOrdenha;
  ocorrencia?: string;
  dtOrdenha: string; // ISO 8601
}

export type UpdateOrdenhaDTO = Partial<CreateOrdenhaDTO>;

// ==========================================
// DTOs - RESUMO DE PRODUÇÃO POR BÚFALA
// ==========================================

export interface UltimaOrdenhaResumo {
  data: string;
  quantidade: number;
  periodo: string;
}

export interface CicloAtualResumo {
  idCicloLactacao: string;
  numeroCiclo: number;
  dtParto: string;
  diasEmLactacao: number;
  totalProduzido: number;
  mediaDiaria: number;
  dtSecagemPrevista: string | null;
  ultimaOrdenha: UltimaOrdenhaResumo | null;
}

export interface CicloComparativo {
  idCicloLactacao: string;
  numeroCiclo: number;
  dtParto: string;
  dtSecagem: string | null;
  totalProduzido: number;
  mediaDiaria: number;
  duracaoDias: number;
}

export interface GraficoProducaoPonto {
  data: string; // YYYY-MM-DD
  quantidade: number;
}

export interface ResumoProducaoBufala {
  bufala: { id: string; nome: string; brinco: string };
  cicloAtual: CicloAtualResumo | null;
  comparativoCiclos: CicloComparativo[];
  graficoProducao: GraficoProducaoPonto[];
}

// ==========================================
// SERVIÇO DE ORDENHAS
// ==========================================

export const ordenhasService = {
  /**
   * Registra uma ordenha individual.
   */
  async create(data: CreateOrdenhaDTO): Promise<Ordenha> {
    const response = await apiClient.post<Ordenha>('/ordenhas', data);
    return response.data;
  },

  /**
   * Lista as ordenhas de uma búfala com paginação.
   */
  async getByBufala(idBufala: string, params?: PaginacaoParams): Promise<OrdenhaPaginatedResponse> {
    const response = await apiClient.get<OrdenhaPaginatedResponse>(`/ordenhas/bufala/${idBufala}`, {
      params: {
        page: params?.page ?? 1,
        limit: params?.limit ?? 20,
      },
    });
    return response.data;
  },

  /**
   * Lista as ordenhas de um ciclo de lactação específico com paginação.
   */
  async getByCiclo(idCiclo: string, params?: PaginacaoParams): Promise<OrdenhaPaginatedResponse> {
    const response = await apiClient.get<OrdenhaPaginatedResponse>(`/ordenhas/ciclo/${idCiclo}`, {
      params: {
        page: params?.page ?? 1,
        limit: params?.limit ?? 100,
      },
    });
    return response.data;
  },

  /**
   * Busca uma ordenha pelo ID.
   */
  async getById(id: string): Promise<Ordenha> {
    const response = await apiClient.get<Ordenha>(`/ordenhas/${id}`);
    return response.data;
  },

  /**
   * Atualiza parcialmente uma ordenha.
   */
  async update(id: string, data: UpdateOrdenhaDTO): Promise<Ordenha> {
    const response = await apiClient.patch<Ordenha>(`/ordenhas/${id}`, data);
    return response.data;
  },

  /**
   * Remove logicamente uma ordenha (soft delete).
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/ordenhas/${id}`);
  },

  /**
   * Restaura uma ordenha removida (soft delete).
   */
  async restore(id: string): Promise<Ordenha> {
    const response = await apiClient.post<Ordenha>(`/ordenhas/${id}/restore`);
    return response.data;
  },

  /**
   * Resumo de produção de uma búfala: ciclo atual, estatísticas,
   * comparativo de ciclos e gráfico dos últimos 30 dias.
   * A API responde em snake_case — normalizamos para camelCase.
   */
  async getResumoProducao(idBufala: string): Promise<ResumoProducaoBufala> {
    const response = await apiClient.get(`/ordenhas/bufala/${idBufala}/resumo-producao`);
    return toCamelCase<ResumoProducaoBufala>(response.data);
  },
};
