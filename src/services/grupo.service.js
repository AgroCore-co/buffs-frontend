import api from '../lib/api';

/**
 * Serviço para operações com grupos de manejo
 */
const grupoService = {
  /**
   * Lista grupos por propriedade com paginação
   */
  async getGruposByPropriedade(idPropriedade, page = 1, limit = 100) {
    try {
      const response = await api.get(
        `/grupos/propriedade/${idPropriedade}?page=${page}&limit=${limit}`
      );
      // Filtra grupos que foram soft-deleted
      if (response?.data) {
        response.data = response.data.filter((g) => !g.deleted_at);
      }
      return response;
    } catch (error) {
      if (error.response?.status === 404) {
        return { data: [], meta: { total: 0 } };
      }
      throw error;
    }
  },

  /**
   * Busca um grupo pelo ID
   */
  async getGrupoById(idGrupo) {
    try {
      const response = await api.get(`/grupos/${idGrupo}`);
      return response;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Cria um novo grupo
   * @param {Object} grupoData - { nome_grupo, id_propriedade, color }
   */
  async createGrupo(grupoData) {
    try {
      const response = await api.post('/grupos', grupoData);
      return response;
    } catch (error) {
      if (error.response?.status === 400) {
        throw new Error(error.response.data?.message || 'Dados inválidos');
      }
      throw error;
    }
  },

  /**
   * Atualiza um grupo existente
   * @param {string} idGrupo - ID do grupo
   * @param {Object} grupoData - { nome_grupo, color }
   */
  async updateGrupo(idGrupo, grupoData) {
    try {
      const response = await api.patch(`/grupos/${idGrupo}`, grupoData);
      return response;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error('Grupo não encontrado');
      }
      if (error.response?.status === 400) {
        throw new Error(error.response.data?.message || 'Dados inválidos');
      }
      throw error;
    }
  },

  /**
   * Remove um grupo (soft delete)
   */
  async deleteGrupo(idGrupo) {
    try {
      const response = await api.delete(`/grupos/${idGrupo}`);
      return response;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error('Grupo não encontrado');
      }
      throw error;
    }
  },

  /**
   * Restaura um grupo removido
   */
  async restoreGrupo(idGrupo) {
    try {
      const response = await api.post(`/grupos/${idGrupo}/restore`);
      return response;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error('Grupo não encontrado');
      }
      if (error.response?.status === 400) {
        throw new Error('Grupo não está removido');
      }
      throw error;
    }
  },

  /**
   * Lista todos os grupos (incluindo removidos)
   */
  async getDeletedGrupos() {
    try {
      const response = await api.get('/grupos/deleted/all');
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default grupoService;
