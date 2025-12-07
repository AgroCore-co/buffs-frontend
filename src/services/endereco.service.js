import api from '@/lib/api';

class EnderecoService {
  /**
   * Cadastra um novo endereço (POST /enderecos)
   * @param {object} data - Dados do novo endereço
   */
  async createEndereco(data) {
    try {
      const response = await api.post('/enderecos', data);
      return response;
    } catch (error) {
      if (error.response) {
        console.error('Erro na criação do endereço:', error.response.data);
        if (error.response.status === 400) {
          // Retorna objeto com informação do erro para melhor tratamento
          return {
            error: true,
            message: error.response.data?.message || 'Dados inválidos',
            status: 400,
          };
        }
        if (error.response.status === 401)
          return { error: true, message: 'Não autorizado', status: 401 };
      }
      throw error;
    }
  }
  /**
   * Remove um endereço específico do sistema pelo ID (DELETE /enderecos/{id})
   * @param {string} id - UUID do endereço
   */
  async deleteEndereco(id) {
    try {
      await api.delete(`/enderecos/${id}`);
      return true; // Removido com sucesso
    } catch (error) {
      if (error.response) {
        if (error.response.status === 401) return null; // Não autorizado
        if (error.response.status === 404) return null; // Endereço não encontrado
      }
      throw error;
    }
  }
  /**
   * Atualiza os dados de um endereço específico pelo ID (PATCH /enderecos/{id})
   * @param {string} id - UUID do endereço
   * @param {object} data - Dados para atualização
   */
  async updateEndereco(id, data) {
    try {
      const response = await api.patch(`/enderecos/${id}`, data);
      return response;
    } catch (error) {
      if (error.response) {
        if (error.response.status === 400) return null; // Dados inválidos
        if (error.response.status === 401) return null; // Não autorizado
        if (error.response.status === 404) return null; // Endereço não encontrado
      }
      throw error;
    }
  }
  /**
   * Busca um endereço específico pelo ID (GET /enderecos/{id})
   * @param {string} id - UUID do endereço
   */
  async getEnderecoById(id) {
    try {
      const response = await api.get(`/enderecos/${id}`);
      return response;
    } catch (error) {
      if (error.response) {
        if (error.response.status === 401) return null; // Não autorizado
        if (error.response.status === 404) return null; // Endereço não encontrado
      }
      throw error;
    }
  }
  /**
   * Lista todos os endereços cadastrados via GET /enderecos
   */
  async getEnderecos() {
    try {
      const response = await api.get('/enderecos');
      return response;
    } catch (error) {
      if (error.response && error.response.status === 401) {
        return null; // Não autorizado
      }
      throw error;
    }
  }
}

export const enderecoService = new EnderecoService();
export default enderecoService;
