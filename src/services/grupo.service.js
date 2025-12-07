import api from '@/lib/api';

class GrupoService {
  /**
   * Lista grupos por propriedade com paginação
   * @param {string} idPropriedade - UUID da propriedade
   * @param {number} [page=1] - Número da página (padrão: 1)
   * @param {number} [limit=10] - Itens por página (padrão: 10)
   * @returns {Promise<Object>} Retorna { data: Array, meta: Object }
   */
  async getGruposByPropriedade(idPropriedade, page = 1, limit = 10) {
    try {
      const response = await api.get(`/grupos/propriedade/${idPropriedade}`, {
        params: { page, limit },
      });
      return response;
    } catch (error) {
      if (error.response?.status === 404) {
        return {
          data: [],
          meta: {
            page: 1,
            limit,
            total: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPrevPage: false,
          },
        };
      }
      throw error;
    }
  }
}

export const grupoService = new GrupoService();
export default grupoService;
