// ==========================================
// DTOs (Data Transfer Objects)
// ==========================================

export interface Endereco {
  id_endereco: string;
  estado: string;
  cidade: string;
  bairro: string;
  rua: string;
  numero: string;
  cep: string;
  ponto_referencia: string;
}

export type Cargo = 'PROPRIETARIO' | 'GERENTE' | 'FUNCIONARIO' | 'VETERINARIO';

export interface Usuario {
  id_usuario: string;
  auth_id: string;
  nome: string;
  email: string;
  telefone: string;
  cargo: Cargo;
  id_endereco: string | null;
  created_at: string;
  updated_at: string;
  endereco?: Endereco | null;
  propriedade?: string;
  id_propriedade?: string;
}

export interface UpdateUsuarioDTO {
  nome: string;
  telefone: string;
  idEndereco: string;
}

export interface UpdateCargoDTO {
  cargo: Exclude<Cargo, 'PROPRIETARIO'>;
}

// ==========================================
// Serviço de Usuários
// ==========================================

import apiClient from '@/lib/apiClient';

export const usuariosService = {
  /**
   * Busca o perfil do usuário logado.
   * @returns Dados do usuário autenticado.
   */
  async getMe(): Promise<Usuario> {
    const response = await apiClient.get<Usuario>('/usuarios/me');
    return response.data;
  },

  /**
   * Lista todos os usuários do escopo do solicitante (proprietário/gerente).
   * @returns Lista de usuários.
   */
  async getAll(): Promise<Usuario[]> {
    const response = await apiClient.get<Usuario[]>('/usuarios');
    return response.data;
  },

  /**
   * Lista todos os funcionários das propriedades do usuário logado.
   * @returns Lista de funcionários.
   */
  async getFuncionarios(): Promise<Usuario[]> {
    const response = await apiClient.get<Usuario[]>('/usuarios/funcionarios');
    return response.data;
  },

  /**
   * Lista funcionários de uma propriedade específica.
   * @param idPropriedade ID da propriedade
   * @returns Lista de funcionários da propriedade
   */
  async getFuncionariosByPropriedade(idPropriedade: string): Promise<Usuario[]> {
    const response = await apiClient.get<Usuario[]>(`/usuarios/funcionarios/propriedade/${idPropriedade}`);
    return response.data;
  },

  /**
   * Busca usuário por ID.
   * @param id ID do usuário
   * @returns Dados do usuário
   */
  async getById(id: string): Promise<Usuario> {
    const response = await apiClient.get<Usuario>(`/usuarios/${id}`);
    return response.data;
  },

  /**
   * Atualiza dados do usuário.
   * @param id ID do usuário
   * @param data Dados para atualização (nome, telefone, idEndereco)
   */
  async update(id: string, data: UpdateUsuarioDTO): Promise<void> {
    await apiClient.patch(`/usuarios/${id}`, data);
  },

  /**
   * Atualiza cargo do funcionário.
   * @param id ID do usuário
   * @param data Novo cargo (GERENTE, FUNCIONARIO, VETERINARIO)
   */
  async updateCargo(id: string, data: UpdateCargoDTO): Promise<void> {
    await apiClient.patch(`/usuarios/${id}/cargo`, data);
  },

  /**
   * Exclui um usuário do sistema.
   * @param id ID do usuário
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/usuarios/${id}`);
  },

  /**
   * Desvincula um funcionário de uma propriedade específica.
   * @param idUsuario ID do funcionário
   * @param idPropriedade ID da propriedade
   */
  async desvincularFuncionarioPropriedade(idUsuario: string, idPropriedade: string): Promise<void> {
    await apiClient.delete(`/usuarios/funcionarios/${idUsuario}/propriedade/${idPropriedade}`);
  },
};
