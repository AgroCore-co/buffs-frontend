import api from '@/lib/api';

export const dashboardService = {
  /**
   * Busca estatísticas gerais da propriedade
   * @param {string} idPropriedade - UUID da propriedade
   * @returns {Promise<Object>}
   */
  async getDashboardStats(idPropriedade) {
    try {
      const response = await api.get(`/dashboard/${idPropriedade}`);
      return response;
    } catch (error) {
      console.error('Erro ao buscar estatísticas do dashboard:', error);
      if (error.response?.status === 401 || error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Busca métricas de produção mensal
   * @param {string} idPropriedade - UUID da propriedade
   * @param {number} ano - Ano de referência (opcional)
   * @returns {Promise<Object>}
   */
  async getProducaoMensal(idPropriedade, ano = new Date().getFullYear()) {
    try {
      const response = await api.get(
        `/dashboard/producao-mensal/${idPropriedade}`,
        { params: { ano } }
      );
      return response;
    } catch (error) {
      console.error('Erro ao buscar produção mensal:', error);
      if (error.response?.status === 401 || error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Busca métricas de reprodução
   * @param {string} idPropriedade - UUID da propriedade
   * @returns {Promise<Object>}
   */
  async getReproducao(idPropriedade) {
    try {
      const response = await api.get(`/dashboard/reproducao/${idPropriedade}`);
      return response;
    } catch (error) {
      console.error('Erro ao buscar métricas de reprodução:', error);
      if (error.response?.status === 401 || error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Busca métricas de lactação
   * @param {string} idPropriedade - UUID da propriedade
   * @param {number} ano - Ano de referência
   * @returns {Promise<Object>}
   */
  async getLactacao(idPropriedade, ano = new Date().getFullYear()) {
    try {
      const response = await api.get(`/dashboard/lactacao/${idPropriedade}`, {
        params: { ano },
      });
      return response;
    } catch (error) {
      console.error('Erro ao buscar métricas de lactação:', error);
      if (error.response?.status === 401 || error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },
};
