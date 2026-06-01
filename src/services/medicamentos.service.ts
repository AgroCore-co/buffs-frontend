import apiClient from '@/lib/apiClient';

// ==========================================
// DTOs (Data Transfer Objects)
// ==========================================

/**
 * Tipos de tratamento de uma medicação (alinhado ao enum do backend).
 */
export type TipoTratamentoMedicacao =
  | 'VACINACAO'
  | 'VERMIFUGACAO'
  | 'ANTIBIOTICO'
  | 'SUPLEMENTACAO'
  | 'HORMONAL'
  | 'OUTRO';

/**
 * Estrutura de uma medicação retornada pela API.
 */
export interface Medicacao {
  idMedicacao: string;
  tipoTratamento: string | null;
  medicacao: string | null;
  descricao: string | null;
  idPropriedade: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CreateMedicacaoDTO {
  idPropriedade: string;
  tipoTratamento: TipoTratamentoMedicacao;
  medicacao: string;
  descricao?: string;
}

export type UpdateMedicacaoDTO = Partial<CreateMedicacaoDTO>;

/**
 * Rótulos legíveis para cada tipo de tratamento.
 */
export const TIPO_TRATAMENTO_LABELS: Record<TipoTratamentoMedicacao, string> = {
  VACINACAO: 'Vacinação',
  VERMIFUGACAO: 'Vermifugação',
  ANTIBIOTICO: 'Antibiótico',
  SUPLEMENTACAO: 'Suplementação',
  HORMONAL: 'Hormonal',
  OUTRO: 'Outro',
};

// ==========================================
// Helpers de tipo de tratamento
// ==========================================
//
// IMPORTANTE: a API retorna `tipoTratamento` como texto livre/legível
// ("Vacinação", "Tratamento", "Curativo", "Anticoccidiano"...), e não como o
// enum canônico (VACINACAO). Dados antigos inclusive têm tipos fora do enum.
// Por isso normalizamos antes de comparar/rotular/colorir.

/** Normaliza um valor de tipo para um token comparável (minúsculo, sem acentos/símbolos). */
export function normalizeTipoToken(raw?: string | null): string {
  return (raw ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // remove acentos
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
}

/** Aliases (token normalizado) → enum canônico. Tokens desconhecidos caem em OUTRO. */
const TOKEN_TO_ENUM: Record<string, TipoTratamentoMedicacao> = {
  vacinacao: 'VACINACAO',
  vacina: 'VACINACAO',
  imunizacao: 'VACINACAO',
  vermifugacao: 'VERMIFUGACAO',
  vermifugo: 'VERMIFUGACAO',
  antiparasitario: 'VERMIFUGACAO',
  antibiotico: 'ANTIBIOTICO',
  suplementacao: 'SUPLEMENTACAO',
  suplemento: 'SUPLEMENTACAO',
  hormonal: 'HORMONAL',
  hormonio: 'HORMONAL',
  outro: 'OUTRO',
};

/** Classe de badge por enum canônico. */
const TIPO_BADGE_CLASS: Record<TipoTratamentoMedicacao, string> = {
  VACINACAO: 'bg-green-100 text-green-700',
  VERMIFUGACAO: 'bg-orange-100 text-orange-700',
  ANTIBIOTICO: 'bg-red-100 text-red-700',
  SUPLEMENTACAO: 'bg-blue-100 text-blue-700',
  HORMONAL: 'bg-purple-100 text-purple-700',
  OUTRO: 'bg-zinc-100 text-zinc-600',
};

export interface TipoInfo {
  /** Chave de agrupamento/filtro (enum canônico quando conhecido, senão o token). */
  key: string;
  /** Rótulo legível (label do enum quando conhecido, senão o valor original). */
  label: string;
  /** Classe Tailwind para o badge. */
  badge: string;
}

/**
 * Resolve rótulo, cor e chave de agrupamento de um valor de tipo arbitrário,
 * conhecido (enum) ou legado/texto-livre.
 */
export function getTipoInfo(raw?: string | null): TipoInfo {
  const token = normalizeTipoToken(raw);
  const enumKey = TOKEN_TO_ENUM[token];
  if (enumKey) {
    return { key: enumKey, label: TIPO_TRATAMENTO_LABELS[enumKey], badge: TIPO_BADGE_CLASS[enumKey] };
  }
  return {
    key: token || 'sem-tipo',
    label: raw?.trim() || '—',
    badge: 'bg-zinc-100 text-zinc-600',
  };
}

/**
 * Converte um valor de tipo arbitrário para o enum canônico exigido pela API
 * em create/update. Valores desconhecidos viram OUTRO.
 */
export function tipoToEnum(raw?: string | null): TipoTratamentoMedicacao {
  return TOKEN_TO_ENUM[normalizeTipoToken(raw)] ?? 'OUTRO';
}

/**
 * Identifica, de forma semântica, se uma medicação é uma vacina.
 * Espelha a heurística do backend (tipoTratamento = VACINACAO ou nome "vacina%/imuniza%").
 */
export function isVacina(med: Medicacao): boolean {
  if (tipoToEnum(med.tipoTratamento) === 'VACINACAO') return true;
  if (normalizeTipoToken(med.tipoTratamento) === '') {
    const nome = (med.medicacao ?? '').toLowerCase();
    return nome.startsWith('vacina') || nome.startsWith('imuniza');
  }
  return false;
}

// ==========================================
// SERVIÇO DE MEDICAMENTOS
// ==========================================

export const medicamentosService = {
  /**
   * Lista todas as medicações cadastradas no sistema.
   */
  async getAll(): Promise<Medicacao[]> {
    const response = await apiClient.get<Medicacao[]>('/medicamentos');
    return response.data;
  },

  /**
   * Lista todas as medicações de uma propriedade específica.
   * @param idPropriedade UUID da propriedade
   */
  async getByPropriedade(idPropriedade: string): Promise<Medicacao[]> {
    const response = await apiClient.get<Medicacao[]>(`/medicamentos/propriedade/${idPropriedade}`);
    return response.data;
  },

  /**
   * Busca uma medicação pelo seu UUID.
   */
  async getById(id: string): Promise<Medicacao> {
    const response = await apiClient.get<Medicacao>(`/medicamentos/${id}`);
    return response.data;
  },

  async create(data: CreateMedicacaoDTO): Promise<Medicacao> {
    const response = await apiClient.post<Medicacao>('/medicamentos', data);
    return response.data;
  },

  async update(id: string, data: UpdateMedicacaoDTO): Promise<void> {
    await apiClient.patch(`/medicamentos/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/medicamentos/${id}`);
  },

  /**
   * Restaura uma medicação removida (soft delete).
   */
  async restore(id: string): Promise<void> {
    await apiClient.post(`/medicamentos/${id}/restore`);
  },

  /**
   * Lista todas as medicações, incluindo as removidas (soft delete).
   */
  async getAllDeleted(): Promise<Medicacao[]> {
    const response = await apiClient.get<Medicacao[]>('/medicamentos/deleted/all');
    return response.data;
  },
};
