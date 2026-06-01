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
// DTOs - BÚFALO
// ==========================================

export type SexoBufalo = 'M' | 'F';
export type NivelMaturidade = 'B' | 'N' | 'V' | 'T';
export type CategoriaBufalo = 'PO' | 'PC' | 'PA' | 'CCG' | 'SRD';

export interface Bufalo {
  idBufalo: string;
  nome: string;
  brinco: string;
  microchip: string | null;
  dtNascimento: string; // ISO 8601
  nivelMaturidade: NivelMaturidade;
  sexo: SexoBufalo;
  idRaca: string;
  idPropriedade: string;
  idGrupo: string | null;
  idPai: string | null;
  idMae: string | null;
  status: boolean;
  categoria: CategoriaBufalo | null;
  origem: string | null;
  brincoOriginal: string | null;
  registroProv: string | null;
  registroDef: string | null;
  idPaiSemen: string | null;
  idMaeOvulo: string | null;
  dataBaixa: string | null;
  motivoInativo: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface BufaloPaginatedResponse {
  data: Bufalo[];
  meta: PaginationMeta;
}

export interface CreateBufaloDTO {
  nome: string;
  brinco: string;
  microchip?: string;
  dtNascimento: string; // ISO 8601
  nivelMaturidade: NivelMaturidade;
  sexo: SexoBufalo;
  idRaca: string;
  idPropriedade: string;
  idGrupo?: string;
  idPai?: string;
  idMae?: string;
  status?: boolean;
  categoria?: CategoriaBufalo;
  origem?: string;
  brincoOriginal?: string;
  registroProv?: string;
  registroDef?: string;
  idPaiSemen?: string;
  idMaeOvulo?: string;
}

export interface UpdateBufaloDTO {
  nome?: string;
  brinco?: string;
  microchip?: string;
  dtNascimento?: string;
  nivelMaturidade?: NivelMaturidade;
  sexo?: SexoBufalo;
  idRaca?: string;
  idPropriedade?: string;
  idGrupo?: string;
  idPai?: string;
  idMae?: string;
  status?: boolean;
  categoria?: CategoriaBufalo;
  origem?: string;
  brincoOriginal?: string;
  registroProv?: string;
  registroDef?: string;
  idPaiSemen?: string;
  idMaeOvulo?: string;
}

// ==========================================
// DTOs - FILTRO AVANÇADO
// ==========================================

export interface FiltroAvancadoParams {
  idRaca?: string;
  sexo?: SexoBufalo;
  nivelMaturidade?: NivelMaturidade;
  status?: boolean;
  brinco?: string;
  page?: number;
  limit?: number;
}

// ==========================================
// DTOs - MOVER GRUPO
// ==========================================

export interface MoverGrupoDTO {
  idsBufalos: string[];
  idNovoGrupo: string;
  motivo?: string;
}


export interface MoverGrupoResponse {
  message: string;
  updated: Bufalo[];
  totalProcessados: number;
}

// ==========================================
// DTOs - INATIVAR / REATIVAR
// ==========================================

export interface InativarBufaloDTO {
  dataBaixa: string; // ISO 8601
  motivoInativo: string;
}

export interface InativarBufaloResponseData {
  idBufalo: string;
  nome: string;
  brinco: string;
  status: false;
  dataBaixa: string;
  motivoInativo: string;
  dtNascimento: string;
  sexo: SexoBufalo;
}

export interface InativarBufaloResponse {
  message: string;
  data: InativarBufaloResponseData;
}

export interface ReativarBufaloResponseData {
  idBufalo: string;
  nome: string;
  brinco: string;
  status: true;
  dataBaixa: null;
  motivoInativo: null;
  dtNascimento: string;
  sexo: SexoBufalo;
}

export interface ReativarBufaloResponse {
  message: string;
  data: ReativarBufaloResponseData;
}

// ==========================================
// DTOs - PROCESSAR CATEGORIA ABCB
// ==========================================

export interface ProcessarCategoriaDetalhe {
  idBufalo: string;
  nome: string;
  categoriaAntes: string;
  categoriaDepois: string;
  status: 'sucesso' | 'erro';
  mensagem: string;
}

export interface ProcessarCategoriaPropriedadeResponse {
  message: string;
  total: number;
  processados: number;
  sucesso: number;
  erros: number;
  detalhes: ProcessarCategoriaDetalhe[];
}

// ==========================================
// SERVIÇO DE BÚFALOS
// ==========================================

export const bufalosService = {
  // ------------------------------------------
  // CRUD BÁSICO
  // ------------------------------------------

  async create(data: CreateBufaloDTO): Promise<Bufalo> {
    const payload = {
      nome: data.nome,
      brinco: data.brinco,
      ...(data.microchip && { microchip: data.microchip }),
      dtNascimento: data.dtNascimento,
      nivelMaturidade: data.nivelMaturidade,
      sexo: data.sexo,
      idRaca: data.idRaca,
      idPropriedade: data.idPropriedade,
      ...(data.idGrupo && { idGrupo: data.idGrupo }),
      ...(data.idPai && { idPai: data.idPai }),
      ...(data.idMae && { idMae: data.idMae }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.categoria && { categoria: data.categoria }),
      ...(data.origem && { origem: data.origem }),
      ...(data.brincoOriginal && { brinco_original: data.brincoOriginal }),
      ...(data.registroProv && { registro_prov: data.registroProv }),
      ...(data.registroDef && { registro_def: data.registroDef }),
      ...(data.idPaiSemen && { id_pai_semen: data.idPaiSemen }),
      ...(data.idMaeOvulo && { id_mae_ovulo: data.idMaeOvulo }),
    };
    const response = await apiClient.post<Bufalo>('/bufalos', payload);
    return response.data;
  },

  async getAll(page: number = 1, limit: number = 10): Promise<BufaloPaginatedResponse> {
    const response = await apiClient.get<BufaloPaginatedResponse>('/bufalos', {
      params: { page, limit },
    });
    return response.data;
  },

  async getById(id: string): Promise<Bufalo> {
    const response = await apiClient.get<Bufalo>(`/bufalos/${id}`);
    return response.data;
  },

  async update(id: string, data: UpdateBufaloDTO): Promise<void> {
    const payload = {
      ...(data.nome && { nome: data.nome }),
      ...(data.brinco && { brinco: data.brinco }),
      ...(data.microchip && { microchip: data.microchip }),
      ...(data.dtNascimento && { dtNascimento: data.dtNascimento }),
      ...(data.nivelMaturidade && { nivelMaturidade: data.nivelMaturidade }),
      ...(data.sexo && { sexo: data.sexo }),
      ...(data.idRaca && { idRaca: data.idRaca }),
      ...(data.idPropriedade && { idPropriedade: data.idPropriedade }),
      ...(data.idGrupo && { idGrupo: data.idGrupo }),
      ...(data.idPai && { idPai: data.idPai }),
      ...(data.idMae && { idMae: data.idMae }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.categoria && { categoria: data.categoria }),
      ...(data.origem && { origem: data.origem }),
      ...(data.brincoOriginal && { brinco_original: data.brincoOriginal }),
      ...(data.registroProv && { registro_prov: data.registroProv }),
      ...(data.registroDef && { registro_def: data.registroDef }),
      ...(data.idPaiSemen && { id_pai_semen: data.idPaiSemen }),
      ...(data.idMaeOvulo && { id_mae_ovulo: data.idMaeOvulo }),
    };
    await apiClient.patch(`/bufalos/${id}`, payload);
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/bufalos/${id}`);
  },

  async restore(id: string): Promise<void> {
    await apiClient.post(`/bufalos/${id}/restore`);
  },

  async getAllDeleted(): Promise<Bufalo[]> {
    const response = await apiClient.get<Bufalo[]>('/bufalos/deleted/all');
    return response.data;
  },

  // ------------------------------------------
  // BUSCAS ESPECÍFICAS
  // ------------------------------------------

  async getByMicrochip(microchip: string): Promise<Bufalo> {
    const response = await apiClient.get<Bufalo>(`/bufalos/microchip/${microchip}`);
    return response.data;
  },

  async getByPropriedade(
    idPropriedade: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<BufaloPaginatedResponse> {
    const response = await apiClient.get<BufaloPaginatedResponse>(
      `/bufalos/propriedade/${idPropriedade}`,
      { params: { page, limit } },
    );
    return response.data;
  },

  async getByGrupo(
    idGrupo: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<BufaloPaginatedResponse> {
    const response = await apiClient.get<BufaloPaginatedResponse>(
      `/bufalos/grupo/${idGrupo}`,
      { params: { page, limit } },
    );
    return response.data;
  },

  async getByCategoria(categoria: CategoriaBufalo): Promise<Bufalo[]> {
    const response = await apiClient.get<Bufalo[]>(`/bufalos/categoria/${categoria}`);
    return response.data;
  },

  // ------------------------------------------
  // FILTROS
  // ------------------------------------------

  async filterByRaca(
    idRaca: string,
    idPropriedade: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<BufaloPaginatedResponse> {
    const response = await apiClient.get<BufaloPaginatedResponse>(
      `/bufalos/filtro/raca/${idRaca}/propriedade/${idPropriedade}`,
      { params: { page, limit } },
    );
    return response.data;
  },

  async filterByRacaEBrinco(
    idRaca: string,
    idPropriedade: string,
    brinco: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<BufaloPaginatedResponse> {
    const response = await apiClient.get<BufaloPaginatedResponse>(
      `/bufalos/filtro/raca/${idRaca}/propriedade/${idPropriedade}/brinco/${brinco}`,
      { params: { page, limit } },
    );
    return response.data;
  },

  async filterByRacaEStatus(
    idRaca: string,
    idPropriedade: string,
    status: boolean,
    page: number = 1,
    limit: number = 10,
  ): Promise<BufaloPaginatedResponse> {
    const response = await apiClient.get<BufaloPaginatedResponse>(
      `/bufalos/filtro/raca/${idRaca}/propriedade/${idPropriedade}/status/${status}`,
      { params: { page, limit } },
    );
    return response.data;
  },

  async filterBySexo(
    sexo: SexoBufalo,
    idPropriedade: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<BufaloPaginatedResponse> {
    const response = await apiClient.get<BufaloPaginatedResponse>(
      `/bufalos/filtro/sexo/${sexo}/propriedade/${idPropriedade}`,
      { params: { page, limit } },
    );
    return response.data;
  },

  async filterBySexoEBrinco(
    sexo: SexoBufalo,
    idPropriedade: string,
    brinco: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<BufaloPaginatedResponse> {
    const response = await apiClient.get<BufaloPaginatedResponse>(
      `/bufalos/filtro/sexo/${sexo}/propriedade/${idPropriedade}/brinco/${brinco}`,
      { params: { page, limit } },
    );
    return response.data;
  },

  async filterBySexoEStatus(
    sexo: SexoBufalo,
    idPropriedade: string,
    status: boolean,
    page: number = 1,
    limit: number = 10,
  ): Promise<BufaloPaginatedResponse> {
    const response = await apiClient.get<BufaloPaginatedResponse>(
      `/bufalos/filtro/sexo/${sexo}/propriedade/${idPropriedade}/status/${status}`,
      { params: { page, limit } },
    );
    return response.data;
  },

  async filterByMaturidade(
    nivelMaturidade: NivelMaturidade,
    idPropriedade: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<BufaloPaginatedResponse> {
    const response = await apiClient.get<BufaloPaginatedResponse>(
      `/bufalos/filtro/maturidade/${nivelMaturidade}/propriedade/${idPropriedade}`,
      { params: { page, limit } },
    );
    return response.data;
  },

  async filterByMaturidadeEBrinco(
    nivelMaturidade: NivelMaturidade,
    idPropriedade: string,
    brinco: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<BufaloPaginatedResponse> {
    const response = await apiClient.get<BufaloPaginatedResponse>(
      `/bufalos/filtro/maturidade/${nivelMaturidade}/propriedade/${idPropriedade}/brinco/${brinco}`,
      { params: { page, limit } },
    );
    return response.data;
  },

  async filterByMaturidadeEStatus(
    nivelMaturidade: NivelMaturidade,
    idPropriedade: string,
    status: boolean,
    page: number = 1,
    limit: number = 10,
  ): Promise<BufaloPaginatedResponse> {
    const response = await apiClient.get<BufaloPaginatedResponse>(
      `/bufalos/filtro/maturidade/${nivelMaturidade}/propriedade/${idPropriedade}/status/${status}`,
      { params: { page, limit } },
    );
    return response.data;
  },

  async filterByStatus(
    status: boolean,
    idPropriedade: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<BufaloPaginatedResponse> {
    const response = await apiClient.get<BufaloPaginatedResponse>(
      `/bufalos/filtro/status/${status}/propriedade/${idPropriedade}`,
      { params: { page, limit } },
    );
    return response.data;
  },

  async filterByStatusEBrinco(
    status: boolean,
    idPropriedade: string,
    brinco: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<BufaloPaginatedResponse> {
    const response = await apiClient.get<BufaloPaginatedResponse>(
      `/bufalos/filtro/status/${status}/propriedade/${idPropriedade}/brinco/${brinco}`,
      { params: { page, limit } },
    );
    return response.data;
  },

  async filterAvancado(
    idPropriedade: string,
    params: FiltroAvancadoParams = {},
  ): Promise<BufaloPaginatedResponse> {
    const apiParams: Record<string, unknown> = {};
    if (params.idRaca) apiParams.id_raca = params.idRaca;
    if (params.sexo) apiParams.sexo = params.sexo;
    if (params.nivelMaturidade) apiParams.nivel_maturidade = params.nivelMaturidade;
    if (params.status !== undefined) apiParams.status = params.status;
    if (params.brinco) apiParams.brinco = params.brinco;
    if (params.page !== undefined) apiParams.page = params.page;
    if (params.limit !== undefined) apiParams.limit = params.limit;

    const response = await apiClient.get<BufaloPaginatedResponse>(
      `/bufalos/filtro/propriedade/${idPropriedade}/avancado`,
      { params: apiParams },
    );
    return response.data;
  },

  // ------------------------------------------
  // GESTÃO DE GRUPO
  // ------------------------------------------

  async moverGrupo(data: MoverGrupoDTO): Promise<MoverGrupoResponse> {
    const response = await apiClient.patch<MoverGrupoResponse>('/bufalos/grupo/mover', data);
    return toCamelCase<MoverGrupoResponse>(response.data);
  },

  // ------------------------------------------
  // CICLO DE VIDA (INATIVAR / REATIVAR)
  // ------------------------------------------

  async inativar(id: string, data: InativarBufaloDTO): Promise<InativarBufaloResponse> {
    const response = await apiClient.post<InativarBufaloResponse>(`/bufalos/${id}/inativar`, data);
    return toCamelCase<InativarBufaloResponse>(response.data);
  },

  async reativar(id: string): Promise<ReativarBufaloResponse> {
    const response = await apiClient.post<ReativarBufaloResponse>(`/bufalos/${id}/reativar`);
    return toCamelCase<ReativarBufaloResponse>(response.data);
  },

  // ------------------------------------------
  // CATEGORIA ABCB
  // ------------------------------------------

  async processarCategoria(id: string): Promise<void> {
    await apiClient.post(`/bufalos/processar-categoria/${id}`);
  },

  async processarCategoriaPropriedade(
    idPropriedade: string,
  ): Promise<ProcessarCategoriaPropriedadeResponse> {
    const response = await apiClient.post<ProcessarCategoriaPropriedadeResponse>(
      `/bufalos/processar-categoria/propriedade/${idPropriedade}`,
    );
    return toCamelCase<ProcessarCategoriaPropriedadeResponse>(response.data);
  },
};
