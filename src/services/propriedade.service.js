import api from '@/lib/api';

class PropriedadeService {
  /**
   * Cria uma nova propriedade (POST /propriedades)
   * @param {object} data - Dados da nova propriedade
   */
  async createPropriedade(data) {
    try {
      const response = await api.post('/propriedades', data);
      return response;
    } catch (error) {
      if (error.response) {
        if (error.response.status === 400) return null; // Dados inválidos ou endereço não encontrado
        if (error.response.status === 403) return null; // Acesso negado
        if (error.response.status === 404) return null; // Perfil do usuário não encontrado
      }
      throw error;
    }
  }
  /**
   * Deleta uma propriedade pelo ID (DELETE /propriedades/{id})
   * @param {string} id - UUID da propriedade
   */
  async deletePropriedade(id) {
    try {
      await api.delete(`/propriedades/${id}`);
      return true; // Deletada com sucesso
    } catch (error) {
      if (error.response) {
        if (error.response.status === 401) return null; // Não autorizado
        if (error.response.status === 404) return null; // Não encontrada ou não pertence ao usuário
      }
      throw error;
    }
  }
  /**
   * Atualiza uma propriedade pelo ID (PATCH /propriedades/{id})
   * @param {string} id - UUID da propriedade
   * @param {object} data - Dados para atualização
   */
  async updatePropriedade(id, data) {
    try {
      const response = await api.patch(`/propriedades/${id}`, data);
      return response;
    } catch (error) {
      if (error.response) {
        if (error.response.status === 401) return null; // Não autorizado
        if (error.response.status === 404) return null; // Não encontrada ou não pertence ao usuário
      }
      throw error;
    }
  }
  /**
   * Lista todas as propriedades do usuário logado via GET /propriedades
   */
  async getPropriedades() {
    try {
      const response = await api.get('/propriedades');
      return response;
    } catch (error) {
      if (error.response && error.response.status === 401) {
        return null; // Não autorizado
      }
      throw error;
    }
  }

  /**
   * Alias para buscar todas as propriedades (compatibilidade com Context)
   */
  async getAllPropriedades() {
    return this.getPropriedades();
  }

  /**
   * Busca uma propriedade específica pelo ID (GET /propriedades/{id})
   * @param {string} id - UUID da propriedade
   */
  async getPropriedadeById(id) {
    try {
      const response = await api.get(`/propriedades/${id}`);
      return response;
    } catch (error) {
      if (error.response) {
        console.error('Erro ao buscar propriedade:', error.response.data);
        if (error.response.status === 400) return null; // ID inválido
        if (error.response.status === 401) return null; // Não autorizado
        if (error.response.status === 404) return null; // Não encontrada ou não pertence ao usuário
      }
      throw error;
    }
  }
}

export const propriedadeService = new PropriedadeService();
export default propriedadeService;
