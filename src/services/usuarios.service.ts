// ==========================================
// DTOs (Data Transfer Objects)
// ==========================================

export interface Endereco {
  idEndereco: string;
  estado: string;
  cidade: string;
  bairro: string;
  rua: string;
  numero: string;
  cep: string;
  pontoReferencia: string;
}

export type Cargo = 'PROPRIETARIO' | 'GERENTE' | 'FUNCIONARIO' | 'VETERINARIO';

export interface Usuario {
  idUsuario: string;
  authId: string;
  nome: string;
  email: string;
  telefone: string;
  cargo: Cargo;
  idEndereco: string | null;
  createdAt: string;
  updatedAt: string;
  endereco?: Endereco | null;
  propriedade?: string;
  idPropriedade?: string;
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
import { toCamelCase } from '@/lib/toCamelCase';

export const usuariosService = {
  async getMe(): Promise<Usuario> {
    const response = await apiClient.get<Usuario>('/usuarios/me');
    return toCamelCase<Usuario>(response.data);
  },

  async getAll(): Promise<Usuario[]> {
    const response = await apiClient.get<Usuario[]>('/usuarios');
    return toCamelCase<Usuario[]>(response.data);
  },

  async getFuncionarios(): Promise<Usuario[]> {
    const response = await apiClient.get<Usuario[]>('/usuarios/funcionarios');
    return toCamelCase<Usuario[]>(response.data);
  },

  async getFuncionariosByPropriedade(idPropriedade: string): Promise<Usuario[]> {
    const response = await apiClient.get<Usuario[]>(`/usuarios/funcionarios/propriedade/${idPropriedade}`);
    return toCamelCase<Usuario[]>(response.data);
  },

  async getById(id: string): Promise<Usuario> {
    const response = await apiClient.get<Usuario>(`/usuarios/${id}`);
    return toCamelCase<Usuario>(response.data);
  },

  async update(id: string, data: UpdateUsuarioDTO): Promise<void> {
    await apiClient.patch(`/usuarios/${id}`, data);
  },

  async updateCargo(id: string, data: UpdateCargoDTO): Promise<void> {
    await apiClient.patch(`/usuarios/${id}/cargo`, data);
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/usuarios/${id}`);
  },

  async desvincularFuncionarioPropriedade(idUsuario: string, idPropriedade: string): Promise<void> {
    await apiClient.delete(`/usuarios/funcionarios/${idUsuario}/propriedade/${idPropriedade}`);
  },
};
