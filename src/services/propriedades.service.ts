import apiClient from '@/lib/apiClient';

// ==========================================
// DTOs (Data Transfer Objects)
// ==========================================

/**
 * Estrutura de uma propriedade retornada pela API.
 */
export interface Propriedade {
  idPropriedade: string;
  nome: string;
  idDono: string;
  idEndereco: string;
  cnpj: string;
  pAbcb: boolean;
  tipoManejo: 'P' | 'E' | 'I';
  status?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

/**
 * Estrutura completa retornada pelo GET /propriedades (lista).
 * A API retorna um wrapper com mensagem, total e o array de propriedades.
 */
export interface PropriedadesListResponse {
  message: string;
  total: number;
  propriedades: Propriedade[];
}

/**
 * Payload para criar uma nova propriedade.
 * O campo idEndereco é OBRIGATÓRIO e deve ser o UUID retornado pelo POST /enderecos.
 * Apenas PROPRIETARIOS podem criar propriedades.
 */
export interface CreatePropriedadeDTO {
  nome: string;
  cnpj: string;
  idEndereco: string;
  pAbcb: boolean;
  tipoManejo: 'P' | 'E' | 'I';
}

/**
 * Resposta do POST /propriedades após criação bem-sucedida.
 * Inclui os dados da propriedade e o endereço vinculado.
 */
export interface CreatePropriedadeResponse {
  idPropriedade: string;
  nome: string;
  areaHectares: number;
  idEndereco: string;
  idUsuario: string;
  createdAt: string;
  endereco: {
    logradouro: string;
    cidade: string;
    estado: string;
  };
}

/**
 * Payload para atualizar uma propriedade existente.
 * Todos os campos são opcionais — envie apenas o que deseja alterar.
 */
export interface UpdatePropriedadeDTO {
  nome?: string;
  pAbcb?: boolean;
  tipoManejo?: 'P' | 'E' | 'I';
}

// ==========================================
// SERVIÇO DE PROPRIEDADES
// ==========================================

/**
 * Serviço centralizado para operações CRUD de propriedades rurais.
 * Todos os métodos retornam Promises e utilizam o apiClient customizado
 * que já injeta o token de autenticação e gerencia o refresh automático.
 */
export const propriedadesService = {
  /**
   * Lista todas as propriedades do usuário autenticado.
   * @returns Objeto com mensagem, total e array de propriedades.
   */
  async getAll(): Promise<PropriedadesListResponse> {
    const response = await apiClient.get<PropriedadesListResponse>('/propriedades');
    return response.data;
  },

  /**
   * Busca uma propriedade específica pelo seu UUID.
   * Retorna 404 se a propriedade não existir ou não pertencer ao usuário.
   * @param id UUID da propriedade
   * @returns Dados completos da propriedade.
   */
  async getById(id: string): Promise<Propriedade> {
    const response = await apiClient.get<Propriedade>(`/propriedades/${id}`);
    return response.data;
  },

  /**
   * Cria uma nova propriedade vinculada ao endereço informado.
   * IMPORTANTE: Apenas usuários com cargo PROPRIETARIO podem executar esta ação.
   * O campo idEndereco deve conter o UUID retornado pelo POST /enderecos (passo 2 do onboarding).
   * @param data Dados da propriedade a ser criada
   * @returns Dados da propriedade criada com o endereço vinculado.
   */
  async create(data: CreatePropriedadeDTO): Promise<CreatePropriedadeResponse> {
    const response = await apiClient.post<CreatePropriedadeResponse>('/propriedades', {
      nome: data.nome,
      cnpj: data.cnpj,
      idEndereco: data.idEndereco,
      p_abcb: data.pAbcb,
      tipoManejo: data.tipoManejo,
    });
    return response.data;
  },

  /**
   * Atualiza parcialmente uma propriedade existente.
   * Apenas o dono da propriedade pode atualizá-la.
   * Retorna 404 se a propriedade não existir ou não pertencer ao usuário.
   * @param id UUID da propriedade
   * @param data Campos a serem atualizados (nome, p_abcb, tipoManejo)
   */
  async update(id: string, data: UpdatePropriedadeDTO): Promise<void> {
    await apiClient.patch(`/propriedades/${id}`, {
      ...(data.nome && { nome: data.nome }),
      ...(data.pAbcb !== undefined && { p_abcb: data.pAbcb }),
      ...(data.tipoManejo && { tipoManejo: data.tipoManejo }),
    });
  },

  /**
   * Remove (soft delete) uma propriedade do sistema.
   * Apenas o dono da propriedade pode excluí-la.
   * Retorna 404 se a propriedade não existir ou não pertencer ao usuário.
   * @param id UUID da propriedade a ser removida
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/propriedades/${id}`);
  },
};
