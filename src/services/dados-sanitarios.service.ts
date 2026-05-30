import apiClient from '@/lib/apiClient';

// ==========================================
// DTOs (Data Transfer Objects)
// ==========================================

/**
 * Payload para criar ou atualizar um registro sanitário.
 */
export interface DadoSanitarioDTO {
  idBufalo: string;
  idMedicao?: string;
  dtAplicacao: string;
  dosagem: number;
  unidade_medida: string;
  doenca: string;
  necessita_retorno: boolean;
  dtRetorno?: string | null;
}

/**
 * Dados resumidos do búfalo incluídos nos registros sanitários.
 */
export interface BufaloResumo {
  brinco: string;
  nome: string;
}

/**
 * Dados da medicação incluídos nos registros sanitários.
 */
export interface MedicacaoResumo {
  medicacao: string;
  tipoTratamento: string;
  descricao?: string | null;
}

/**
 * Estrutura de um registro sanitário retornado pela API.
 */
export interface DadoSanitario {
  idSanit: string;
  idBufalo: string;
  idUsuario: string;
  idMedicao: string | null;
  dtAplicacao: string;
  dosagem: string;
  unidadeMedida: string;
  doenca: string;
  necessitaRetorno: boolean;
  dtRetorno: string | null;
  observacao: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  bufalo?: BufaloResumo;
  medicacoe?: MedicacaoResumo;
  medicacoes?: MedicacaoResumo;
}

/**
 * Meta de paginação retornada pela API.
 */
export interface PaginacaoMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Resposta paginada de registros sanitários.
 */
export interface DadosSanitariosPaginados {
  data: DadoSanitario[];
  meta: PaginacaoMeta;
}

/**
 * Parâmetros de paginação.
 */
export interface PaginacaoParams {
  page?: number;
  limit?: number;
}

/**
 * Item de frequência de uma doença.
 */
export interface FrequenciaDoenca {
  doenca: string;
  frequencia: number;
}

/**
 * Resposta do endpoint de frequência de doenças por propriedade.
 */
export interface FrequenciaDoencasResponse {
  dados: FrequenciaDoenca[];
  total_registros: number;
  total_doencas_distintas: number;
}

/**
 * Parâmetros para busca de frequência de doenças.
 */
export interface FrequenciaDoencasParams {
  agruparSimilares?: boolean;
  limiarSimilaridade?: number;
}

/**
 * Detalhe de uma doença normalizada na migração.
 */
export interface DetalhesMigracao {
  id: string;
  de: string;
  para: string;
}

/**
 * Resposta do endpoint de migração de doenças.
 */
export interface MigrarDoencasResponse {
  message: string;
  total: number;
  atualizados: number;
  sem_alteracao: number;
  detalhes: DetalhesMigracao[];
}

// ==========================================
// SERVIÇO DE DADOS SANITÁRIOS
// ==========================================

/**
 * Serviço centralizado para histórico sanitário e tratamentos de búfalos.
 * Os nomes de doenças são automaticamente normalizados pela API.
 */
export const dadosSanitariosService = {
  /**
   * Cria um novo registro sanitário.
   * O nome da doença é automaticamente normalizado (ex: "Verminose" → "verminose").
   * @param data Dados do registro sanitário
   * @returns Registro sanitário criado
   */
  async create(data: DadoSanitarioDTO): Promise<DadoSanitario> {
    const response = await apiClient.post<DadoSanitario>('/dados-sanitarios', data);
    return response.data;
  },

  /**
   * Lista todos os registros sanitários com paginação.
   * Ordenados por data de aplicação (mais recentes primeiro).
   * @param params Parâmetros de paginação (page, limit)
   * @returns Lista paginada de registros sanitários
   */
  async getAll(params?: PaginacaoParams): Promise<DadosSanitariosPaginados> {
    const response = await apiClient.get<DadosSanitariosPaginados>('/dados-sanitarios', {
      params: {
        page: params?.page ?? 1,
        limit: params?.limit ?? 10,
      },
    });
    return response.data;
  },

  /**
   * Retorna sugestões de nomes de doenças para autocomplete.
   * Se nenhum termo for fornecido, retorna as doenças mais comuns.
   * @param termo Termo de busca parcial
   * @param limit Número máximo de sugestões (padrão: 5)
   * @returns Lista de sugestões de nomes de doenças
   */
  async getSugestoesDoencas(termo?: string, limit?: number): Promise<string[]> {
    const response = await apiClient.get<string[]>('/dados-sanitarios/doencas/sugestoes', {
      params: {
        ...(termo && { termo }),
        ...(limit && { limit }),
      },
    });
    return response.data;
  },

  /**
   * Busca todos os registros sanitários de um búfalo específico com paginação.
   * Ordenados por data de aplicação (mais recentes primeiro).
   * @param idBufalo ID do búfalo
   * @param params Parâmetros de paginação (page, limit)
   * @returns Lista paginada de registros sanitários do búfalo
   */
  async getByBufalo(idBufalo: string, params?: PaginacaoParams): Promise<DadosSanitariosPaginados> {
    const response = await apiClient.get<DadosSanitariosPaginados>(
      `/dados-sanitarios/bufalo/${idBufalo}`,
      {
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
        },
      },
    );
    return response.data;
  },

  /**
   * Busca todos os registros sanitários de uma propriedade com paginação.
   * Ordenados por data de aplicação (mais recentes primeiro).
   * @param idPropriedade ID da propriedade
   * @param params Parâmetros de paginação (page, limit)
   * @returns Lista paginada de registros sanitários da propriedade
   */
  async getByPropriedade(
    idPropriedade: string,
    params?: PaginacaoParams,
  ): Promise<DadosSanitariosPaginados> {
    const response = await apiClient.get<DadosSanitariosPaginados>(
      `/dados-sanitarios/propriedade/${idPropriedade}`,
      {
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
        },
      },
    );
    return response.data;
  },

  /**
   * Retorna a frequência de doenças registradas na propriedade.
   * Pode agrupar doenças com nomes similares (erros de digitação).
   * @param idPropriedade ID da propriedade
   * @param params Parâmetros de agrupamento e limiar de similaridade
   * @returns Frequência de doenças ordenada da mais comum para a menos comum
   */
  async getFrequenciaDoencas(
    idPropriedade: string,
    params?: FrequenciaDoencasParams,
  ): Promise<FrequenciaDoencasResponse> {
    const response = await apiClient.get<FrequenciaDoencasResponse>(
      `/dados-sanitarios/propriedade/${idPropriedade}/frequencia-doencas`,
      {
        params: {
          ...(params?.agruparSimilares !== undefined && {
            agruparSimilares: params.agruparSimilares,
          }),
          ...(params?.limiarSimilaridade !== undefined && {
            limiarSimilaridade: params.limiarSimilaridade,
          }),
        },
      },
    );
    return response.data;
  },

  /**
   * Busca um registro sanitário pelo ID.
   * @param id ID do registro sanitário
   * @returns Dados do registro sanitário
   */
  async getById(id: string): Promise<DadoSanitario> {
    const response = await apiClient.get<DadoSanitario>(`/dados-sanitarios/${id}`);
    return response.data;
  },

  /**
   * Atualiza parcialmente um registro sanitário existente.
   * @param id ID do registro sanitário
   * @param data Campos a serem atualizados
   * @returns Registro sanitário atualizado
   */
  async update(id: string, data: Partial<DadoSanitarioDTO>): Promise<DadoSanitario> {
    const response = await apiClient.patch<DadoSanitario>(`/dados-sanitarios/${id}`, data);
    return response.data;
  },

  /**
   * Remove logicamente um registro sanitário (soft delete).
   * Use restore() para restaurar.
   * @param id ID do registro sanitário a ser removido
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/dados-sanitarios/${id}`);
  },

  /**
   * [ADMIN] Normaliza todas as doenças existentes nos registros.
   * Execute UMA VEZ após implementar a normalização automática.
   * @returns Relatório da migração com detalhes das alterações
   */
  async migrarDoencas(): Promise<MigrarDoencasResponse> {
    const response = await apiClient.post<MigrarDoencasResponse>('/dados-sanitarios/migrar-doencas');
    return response.data;
  },

  /**
   * Restaura um registro sanitário que foi removido (soft delete).
   * @param id ID do registro a ser restaurado
   * @returns Registro sanitário restaurado
   */
  async restore(id: string): Promise<DadoSanitario> {
    const response = await apiClient.post<DadoSanitario>(`/dados-sanitarios/${id}/restore`);
    return response.data;
  },

  /**
   * Lista todos os registros sanitários incluindo os removidos (soft delete).
   * @returns Lista completa de registros sanitários
   */
  async getAllIncludingDeleted(): Promise<DadoSanitario[]> {
    const response = await apiClient.get<DadoSanitario[]>('/dados-sanitarios/deleted/all');
    return response.data;
  },
};
