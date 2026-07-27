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

export type TipoInseminacao = 'IA' | 'IATF' | 'TE' | 'Monta Natural';
export type StatusReproducao = 'Em andamento' | 'Confirmada' | 'Falha' | 'Concluída';

export const TIPO_INSEMINACAO_OPTIONS: TipoInseminacao[] = ['IA', 'IATF', 'TE', 'Monta Natural'];
export const STATUS_REPRODUCAO_OPTIONS: StatusReproducao[] = [
  'Em andamento',
  'Confirmada',
  'Falha',
  'Concluída',
];

export interface CreateReproducaoDTO {
  idPropriedade: string;
  idBufala: string;
  tipoInseminacao: TipoInseminacao;
  dtEvento: string;
  idSemen?: string;
  idBufalo?: string;
  status?: StatusReproducao;
}

export type UpdateReproducaoDTO = Partial<CreateReproducaoDTO>;

// ==========================================
// RESUMO REPRODUTIVO POR ANIMAL (GET /reproducao/bufalo/:id/resumo)
// ==========================================

/**
 * Registro resumido de cobertura para o histórico da fêmea.
 */
export interface HistoricoReprodutivoFemea {
  idReproducao: string;
  dtEvento: string;
  tipoInseminacao: string;
  status: string;
  tipoParto: string | null;
  dtParto: string | null;
}

/**
 * Registro resumido de cobertura para o histórico do macho.
 */
export interface HistoricoReprodutivoMacho {
  idReproducao: string;
  idBufala: string | null;
  nomeBufala: string | null;
  dtEvento: string;
  tipoInseminacao: string;
  status: string;
  tipoParto: string | null;
}

export interface CicloAtivo {
  numeroCiclo: number;
  diasEmLactacao: number;
  status: string;
  dtParto: string;
}

/** Resumo reprodutivo para búfalas fêmeas (sexo = 'F'). */
export interface ResumoReprodutivoFemea {
  sexo: 'F';
  idBufalo: string;
  nome: string;
  brinco: string;
  idadeMeses: number;
  raca: string;
  statusReprodutivo: string;
  situacaoAtual:
    | 'Vazia'
    | 'Coberta'
    | 'Prenha'
    | 'Em Lactação'
    | 'Período Pós-Parto'
    | 'Aguardando Diagnóstico';
  ultimaCobertura: string | null;
  diasDesdeUltimaCobertura: number | null;
  ultimoParto: string | null;
  totalCiclos: number;
  iepMedioDias: number | null;
  cicloAtivo: CicloAtivo | null;
  historico: HistoricoReprodutivoFemea[];
}

/** Resumo reprodutivo para búfalos machos (sexo = 'M'). */
export interface ResumoReprodutivoMacho {
  sexo: 'M';
  idBufalo: string;
  nome: string;
  brinco: string;
  idadeMeses: number;
  raca: string;
  categoriaAbcb: string | null;
  statusReprodutivo: string;
  ultimaCobertura: string | null;
  diasDesdeUltimaCobertura: number | null;
  totalCoberturasRealizadas: number;
  totalFemeasCobertas: number;
  totalPrenhezes: number;
  taxaSucessoReprodutivoPercent: number | null;
  'taxaConcepçãoAjustada': number | null;
  confiabilidade: 'Baixa' | 'Média' | 'Alta' | null;
  historico: HistoricoReprodutivoMacho[];
}

/** União discriminada pelo campo `sexo`, espelhando o DTO do backend. */
export type ResumoReprodutivo = ResumoReprodutivoFemea | ResumoReprodutivoMacho;

export interface ResumoReprodutivoParams {
  historicoLimit?: number;
  includeGenealogia?: boolean;
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

  async create(data: CreateReproducaoDTO): Promise<Reproducao> {
    const response = await apiClient.post<Reproducao>('/cobertura', data);
    return response.data;
  },

  async update(id: string, data: UpdateReproducaoDTO): Promise<Reproducao> {
    const response = await apiClient.patch<Reproducao>(`/cobertura/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/cobertura/${id}`);
  },

  async restore(id: string): Promise<void> {
    await apiClient.post(`/cobertura/${id}/restore`);
  },

  /**
   * Resumo reprodutivo consolidado de um búfalo (fêmea ou macho).
   * A resposta é discriminada pelo campo `sexo`.
   */
  async getResumoByBufalo(
    idBufalo: string,
    params?: ResumoReprodutivoParams,
  ): Promise<ResumoReprodutivo> {
    const response = await apiClient.get<ResumoReprodutivo>(
      `/reproducao/bufalo/${idBufalo}/resumo`,
      {
        params: {
          historicoLimit: params?.historicoLimit,
          includeGenealogia: params?.includeGenealogia,
        },
      },
    );
    return response.data;
  },
};
