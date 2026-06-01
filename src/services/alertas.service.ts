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

export type NichoAlerta = 'CLINICO' | 'SANITARIO' | 'REPRODUCAO' | 'MANEJO' | 'PRODUCAO';
export type PrioridadeAlerta = 'BAIXA' | 'MEDIA' | 'ALTA';

/**
 * Estrutura de um alerta retornado pela API.
 */
export interface Alerta {
  idAlerta: string;
  animalId: string | null;
  grupo: string | null;
  localizacao: string | null;
  motivo: string;
  nicho: NichoAlerta;
  dataAlerta: string;
  prioridade: PrioridadeAlerta;
  observacao: string | null;
  visto: boolean;
  idEventoOrigem: string | null;
  tipoEventoOrigem: string | null;
  idPropriedade: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  // Join retornado em alguns endpoints (ex: por propriedade)
  bufalo?: {
    nome: string;
    brinco: string;
  };
}

export interface AlertasPaginatedResponse {
  data: Alerta[];
  meta: PaginationMeta;
}

/**
 * Filtros do endpoint global GET /alertas.
 */
export interface AlertasFilterParams {
  tipo?: NichoAlerta;
  prioridade?: PrioridadeAlerta;
  antecedencia?: number;
  incluirVistos?: boolean;
  page?: number;
  limit?: number;
}

/**
 * Filtros do endpoint GET /alertas/propriedade/{id}.
 */
export interface AlertasByPropriedadeParams {
  incluirVistos?: boolean;
  prioridade?: PrioridadeAlerta;
  nichos?: NichoAlerta[];
  page?: number;
  limit?: number;
}

/**
 * Payload para criar um alerta.
 * Se `textoOcorrenciaClinica` for fornecido, a prioridade pode ser classificada pela IA.
 */
export interface CreateAlertaDTO {
  idPropriedade: string;
  motivo: string;
  nicho: NichoAlerta;
  animalId?: string;
  grupo?: string;
  localizacao?: string;
  dataAlerta?: string; // ISO 8601
  prioridade?: PrioridadeAlerta;
  textoOcorrenciaClinica?: string;
  observacao?: string;
  visto?: boolean;
  idEventoOrigem?: string;
  tipoEventoOrigem?: string;
}

/**
 * Resposta do POST /alertas/verificar/{id_propriedade}.
 */
export interface VerificarAlertasResponse {
  success: boolean;
  message: string;
  propriedade: string;
  nichosVerificados: NichoAlerta[];
  alertasCriados: number;
  detalhes: Record<string, Record<string, number>>;
}

// ==========================================
// Helpers de query (serialização de arrays)
// ==========================================

// Serializa arrays como `nichos=A&nichos=B` (sem colchetes), formato aceito pela API.
const repeatArraySerializer = { indexes: null } as const;

// ==========================================
// SERVIÇO DE ALERTAS
// ==========================================

export const alertasService = {
  /**
   * Cria um novo alerta (com classificação automática de prioridade via IA, se aplicável).
   */
  async create(data: CreateAlertaDTO): Promise<Alerta> {
    const response = await apiClient.post<Alerta>('/alertas', {
      id_propriedade: data.idPropriedade,
      motivo: data.motivo,
      nicho: data.nicho,
      ...(data.animalId && { animal_id: data.animalId }),
      ...(data.grupo && { grupo: data.grupo }),
      ...(data.localizacao && { localizacao: data.localizacao }),
      ...(data.dataAlerta && { data_alerta: data.dataAlerta }),
      ...(data.prioridade && { prioridade: data.prioridade }),
      ...(data.textoOcorrenciaClinica && { texto_ocorrencia_clinica: data.textoOcorrenciaClinica }),
      ...(data.observacao && { observacao: data.observacao }),
      ...(data.visto !== undefined && { visto: data.visto }),
      ...(data.idEventoOrigem && { id_evento_origem: data.idEventoOrigem }),
      ...(data.tipoEventoOrigem && { tipo_evento_origem: data.tipoEventoOrigem }),
    });
    return response.data;
  },

  /**
   * Lista alertas com filtros avançados (endpoint global).
   */
  async getAll(params?: AlertasFilterParams): Promise<AlertasPaginatedResponse> {
    const response = await apiClient.get<AlertasPaginatedResponse>('/alertas', {
      params: {
        ...(params?.tipo && { tipo: params.tipo }),
        ...(params?.prioridade && { prioridade: params.prioridade }),
        ...(params?.antecedencia !== undefined && { antecedencia: params.antecedencia }),
        ...(params?.incluirVistos !== undefined && { incluirVistos: params.incluirVistos }),
        page: params?.page ?? 1,
        limit: params?.limit ?? 10,
      },
    });
    return response.data;
  },

  /**
   * Lista alertas de uma propriedade específica com filtros opcionais.
   */
  async getByPropriedade(
    idPropriedade: string,
    params?: AlertasByPropriedadeParams,
  ): Promise<AlertasPaginatedResponse> {
    const response = await apiClient.get<AlertasPaginatedResponse>(
      `/alertas/propriedade/${idPropriedade}`,
      {
        params: {
          ...(params?.incluirVistos !== undefined && { incluirVistos: params.incluirVistos }),
          ...(params?.prioridade && { prioridade: params.prioridade }),
          ...(params?.nichos?.length && { nichos: params.nichos }),
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
        },
        paramsSerializer: repeatArraySerializer,
      },
    );
    return response.data;
  },

  /**
   * Busca um alerta específico pelo ID.
   */
  async getById(id: string): Promise<Alerta> {
    const response = await apiClient.get<Alerta>(`/alertas/${id}`);
    return response.data;
  },

  /**
   * Remove permanentemente um alerta (não pode ser desfeito).
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/alertas/${id}`);
  },

  /**
   * Marca um alerta como visto ou não visto.
   */
  async marcarVisto(id: string, status: boolean): Promise<void> {
    await apiClient.patch(`/alertas/${id}/visto`, undefined, {
      params: { status },
    });
  },

  /**
   * Executa verificação manual de alertas para uma propriedade (processa dados e cria alertas).
   * @param nichos Nichos específicos a verificar; se omitido, verifica todos.
   */
  async verificar(idPropriedade: string, nichos?: NichoAlerta[]): Promise<VerificarAlertasResponse> {
    const response = await apiClient.post(`/alertas/verificar/${idPropriedade}`, undefined, {
      params: nichos?.length ? { nichos } : undefined,
      paramsSerializer: repeatArraySerializer,
    });
    return toCamelCase<VerificarAlertasResponse>(response.data);
  },
};
