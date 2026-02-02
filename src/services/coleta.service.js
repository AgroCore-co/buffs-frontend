import { apiCache, CACHE_TTL } from '@/lib/apiCache';

class ColetaService {
  /**
   * Busca coletas por propriedade com paginação
   * @param {string} idPropriedade
   * @param {number} page
   * @param {number} limit
   * @returns {Promise<Object>}
   */
  async getColetasPorPropriedade(idPropriedade, page = 1, limit = 10) {
    try {
      const response = await apiCache.get(
        `/retiradas/propriedade/${idPropriedade}`,
        { params: { page, limit } },
        CACHE_TTL.SHORT
      );
      return response;
    } catch (error) {
      console.error('Erro ao buscar coletas:', error);
      throw error;
    }
  }

  /**
   * Busca detalhes de uma coleta específica
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async getColetaById(id) {
    try {
      const response = await apiCache.get(
        `/retiradas/${id}`,
        {},
        CACHE_TTL.MEDIUM
      );
      return response;
    } catch (error) {
      console.error('Erro ao buscar detalhes da coleta:', error);
      throw error;
    }
  }
}

export const coletaService = new ColetaService();
