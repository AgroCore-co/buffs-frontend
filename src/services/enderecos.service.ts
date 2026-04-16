import apiClient from '@/lib/apiClient';

// ==========================================
// DTOs (Data Transfer Objects)
// ==========================================

/**
 * Estrutura de um endereço retornado pela API.
 */
export interface Endereco {
  idEndereco: string;
  pais: string;
  estado: string;
  cidade: string;
  bairro: string;
  rua: string;
  cep: string;
  numero: string;
  pontoReferencia: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

/**
 * Payload para criar um novo endereço.
 */
export interface CreateEnderecoDTO {
  pais: string;
  estado: string;
  cidade: string;
  bairro?: string;
  rua?: string;
  cep: string;
  numero: string;
  ponto_referencia?: string;
}

/**
 * Resposta do POST /enderecos após criação bem-sucedida.
 */
export interface CreateEnderecoResponse {
  idEndereco: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  created_at: string;
}

/**
 * Payload para atualizar um endereço existente.
 * Todos os campos são opcionais — envie apenas o que deseja alterar.
 */
export interface UpdateEnderecoDTO {
  pais?: string;
  estado?: string;
  cidade?: string;
  bairro?: string;
  rua?: string;
  cep?: string;
  numero?: string;
  ponto_referencia?: string;
}

// ==========================================
// SERVIÇO DE ENDEREÇOS
// ==========================================

/**
 * Serviço centralizado para operações CRUD de endereços.
 * Todos os métodos retornam Promises e utilizam o apiClient customizado
 * que já injeta o token de autenticação e gerencia o refresh automático.
 */
export const enderecosService = {
  /**
   * Lista todos os endereços cadastrados no sistema.
   * @returns Array de endereços.
   */
  async getAll(): Promise<Endereco[]> {
    const response = await apiClient.get<Endereco[]>('/enderecos');
    return response.data;
  },

  /**
   * Busca um endereço específico pelo seu UUID.
   * Retorna 404 se o endereço não existir.
   * @param id UUID do endereço
   * @returns Dados completos do endereço.
   */
  async getById(id: string): Promise<Endereco> {
    const response = await apiClient.get<Endereco>(`/enderecos/${id}`);
    return response.data;
  },

  /**
   * Cria um novo endereço.
   * O campo idEndereco retornado deve ser usado para criar a propriedade.
   * @param data Dados do endereço a ser criado
   * @returns Dados do endereço criado.
   */
  async create(data: CreateEnderecoDTO): Promise<CreateEnderecoResponse> {
    const response = await apiClient.post<CreateEnderecoResponse>('/enderecos', data);
    return response.data;
  },

  /**
   * Atualiza parcialmente um endereço existente.
   * Retorna 404 se o endereço não existir.
   * @param id UUID do endereço
   * @param data Campos a serem atualizados
   */
  async update(id: string, data: UpdateEnderecoDTO): Promise<void> {
    await apiClient.patch(`/enderecos/${id}`, data);
  },

  /**
   * Remove um endereço do sistema.
   * Retorna 404 se o endereço não existir.
   * @param id UUID do endereço a ser removido
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/enderecos/${id}`);
  },
};
