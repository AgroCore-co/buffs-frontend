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
  brinco_original?: string;
  registro_prov?: string;
  registro_def?: string;
  id_pai_semen?: string;
  id_mae_ovulo?: string;
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
  brinco_original?: string;
  registro_prov?: string;
  registro_def?: string;
  id_pai_semen?: string;
  id_mae_ovulo?: string;
}

// ==========================================
// DTOs - FILTRO AVANÇADO
// ==========================================

export interface FiltroAvancadoParams {
  id_raca?: string;
  sexo?: SexoBufalo;
  nivel_maturidade?: NivelMaturidade;
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

export interface MoverGrupoAnimal {
  id_bufalo: string;
  nome: string;
  grupo_anterior: string;
  grupo_novo: string;
}

export interface MoverGrupoResponse {
  message: string;
  grupo_destino: string;
  total_processados: number;
  motivo: string;
  animais: MoverGrupoAnimal[];
}

// ==========================================
// DTOs - INATIVAR / REATIVAR
// ==========================================

export interface InativarBufaloDTO {
  dataBaixa: string; // ISO 8601
  motivoInativo: string;
}

export interface InativarBufaloResponseData {
  id_bufalo: string;
  nome: string;
  brinco: string;
  status: false;
  data_baixa: string;
  motivo_inativo: string;
  dt_nascimento: string;
  sexo: SexoBufalo;
}

export interface InativarBufaloResponse {
  message: string;
  data: InativarBufaloResponseData;
}

export interface ReativarBufaloResponseData {
  id_bufalo: string;
  nome: string;
  brinco: string;
  status: true;
  data_baixa: null;
  motivo_inativo: null;
  dt_nascimento: string;
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
  id_bufalo: string;
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

  /**
   * Registra um novo búfalo para o usuário logado.
   */
  async create(data: CreateBufaloDTO): Promise<Bufalo> {
    const response = await apiClient.post<Bufalo>('/bufalos', data);
    return response.data;
  },

  /**
   * Lista todos os búfalos do usuário logado com paginação.
   * Ordenado por data de nascimento (mais antigos primeiro), priorizando status = true.
   */
  async getAll(page: number = 1, limit: number = 10): Promise<BufaloPaginatedResponse> {
    const response = await apiClient.get<BufaloPaginatedResponse>('/bufalos', {
      params: { page, limit },
    });
    return response.data;
  },

  /**
   * Busca um búfalo específico pelo UUID.
   */
  async getById(id: string): Promise<Bufalo> {
    const response = await apiClient.get<Bufalo>(`/bufalos/${id}`);
    return response.data;
  },

  /**
   * Atualiza os dados de um búfalo.
   */
  async update(id: string, data: UpdateBufaloDTO): Promise<void> {
    await apiClient.patch(`/bufalos/${id}`, data);
  },

  /**
   * Remove um búfalo do rebanho (soft delete).
   * Use restore() para recuperar.
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/bufalos/${id}`);
  },

  /**
   * Restaura um búfalo removido via soft delete.
   */
  async restore(id: string): Promise<void> {
    await apiClient.post(`/bufalos/${id}/restore`);
  },

  /**
   * Lista todos os búfalos, incluindo os removidos (soft delete).
   */
  async getAllDeleted(): Promise<Bufalo[]> {
    const response = await apiClient.get<Bufalo[]>('/bufalos/deleted/all');
    return response.data;
  },

  // ------------------------------------------
  // BUSCAS ESPECÍFICAS
  // ------------------------------------------

  /**
   * Busca um búfalo pelo número de microchip.
   */
  async getByMicrochip(microchip: string): Promise<Bufalo> {
    const response = await apiClient.get<Bufalo>(`/bufalos/microchip/${microchip}`);
    return response.data;
  },

  /**
   * Lista todos os búfalos de uma propriedade específica com paginação.
   * Ordenado por status (ativos primeiro) e data de nascimento.
   */
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

  /**
   * Lista todos os búfalos de um grupo de manejo específico com paginação.
   * Retorna apenas animais ativos, ordenados por data de nascimento.
   */
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

  /**
   * Lista búfalos por categoria ABCB.
   */
  async getByCategoria(categoria: CategoriaBufalo): Promise<Bufalo[]> {
    const response = await apiClient.get<Bufalo[]>(`/bufalos/categoria/${categoria}`);
    return response.data;
  },

  // ------------------------------------------
  // FILTROS
  // ------------------------------------------

  /**
   * Filtra búfalos por raça em uma propriedade (paginado).
   */
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

  /**
   * Filtra búfalos por raça e brinco (busca progressiva).
   * Ex: "IZ" encontra "IZ-001", "IZ-002".
   */
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

  /**
   * Filtra búfalos por raça e status.
   */
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

  /**
   * Filtra búfalos por sexo em uma propriedade.
   */
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

  /**
   * Filtra búfalos por sexo e brinco (busca progressiva).
   */
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

  /**
   * Filtra búfalos por sexo e status.
   */
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

  /**
   * Filtra búfalos por maturidade em uma propriedade.
   */
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

  /**
   * Filtra búfalos por maturidade e brinco (busca progressiva).
   */
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

  /**
   * Filtra búfalos por maturidade e status.
   */
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

  /**
   * Filtra búfalos por status em uma propriedade.
   */
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

  /**
   * Filtra búfalos por status e brinco (busca progressiva).
   */
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

  /**
   * Filtragem avançada por múltiplos critérios combinados.
   * Todos os filtros são opcionais.
   */
  async filterAvancado(
    idPropriedade: string,
    params: FiltroAvancadoParams = {},
  ): Promise<BufaloPaginatedResponse> {
    const response = await apiClient.get<BufaloPaginatedResponse>(
      `/bufalos/filtro/propriedade/${idPropriedade}/avancado`,
      { params },
    );
    return response.data;
  },

  // ------------------------------------------
  // GESTÃO DE GRUPO
  // ------------------------------------------

  /**
   * Muda o grupo de manejo de um ou mais búfalos.
   * Útil para transições como Lactando → Secagem, Novilhas → Reprodução, etc.
   */
  async moverGrupo(data: MoverGrupoDTO): Promise<MoverGrupoResponse> {
    const response = await apiClient.patch<MoverGrupoResponse>('/bufalos/grupo/mover', data);
    return response.data;
  },

  // ------------------------------------------
  // CICLO DE VIDA (INATIVAR / REATIVAR)
  // ------------------------------------------

  /**
   * Inativa um búfalo com data e motivo formal de baixa.
   * Registra data_baixa e motivo_inativo para rastreabilidade e auditoria.
   */
  async inativar(id: string, data: InativarBufaloDTO): Promise<InativarBufaloResponse> {
    const response = await apiClient.post<InativarBufaloResponse>(`/bufalos/${id}/inativar`, data);
    return response.data;
  },

  /**
   * Reativa um búfalo inativado, limpando data de baixa e motivo.
   */
  async reativar(id: string): Promise<ReativarBufaloResponse> {
    const response = await apiClient.post<ReativarBufaloResponse>(`/bufalos/${id}/reativar`);
    return response.data;
  },

  // ------------------------------------------
  // CATEGORIA ABCB
  // ------------------------------------------

  /**
   * Força o processamento da categoria ABCB de um búfalo específico.
   */
  async processarCategoria(id: string): Promise<void> {
    await apiClient.post(`/bufalos/processar-categoria/${id}`);
  },

  /**
   * Processa a categoria ABCB de todos os búfalos de uma propriedade.
   * Retorna relatório detalhado com sucesso/erros por animal.
   */
  async processarCategoriaPropriedade(
    idPropriedade: string,
  ): Promise<ProcessarCategoriaPropriedadeResponse> {
    const response = await apiClient.post<ProcessarCategoriaPropriedadeResponse>(
      `/bufalos/processar-categoria/propriedade/${idPropriedade}`,
    );
    return response.data;
  },
};