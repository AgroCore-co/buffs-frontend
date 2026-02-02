import api from '@/lib/api';
import { apiCache, CACHE_TTL } from '@/lib/apiCache';

export const sanitarioService = {
  /**
   * Busca a frequência de doenças registradas na propriedade
   * @param {string} idPropriedade - UUID da propriedade
   * @param {boolean} agruparSimilares - Se true, agrupa doenças com nomes similares
   * @param {number} limiarSimilaridade - Limiar de similaridade para agrupamento (0-1)
   * @returns {Promise<Object>}
   */
  async getFrequenciaDoencas(
    idPropriedade,
    agruparSimilares = true,
    limiarSimilaridade = 0.8
  ) {
    try {
      const response = await apiCache.get(
        `/dados-sanitarios/propriedade/${idPropriedade}/frequencia-doencas`,
        {
          params: {
            agruparSimilares,
            limiarSimilaridade,
          },
        },
        CACHE_TTL.LONG
      );
      return response;
    } catch (error) {
      console.error('Erro ao buscar frequência de doenças:', error);
      if (error.response?.status === 401 || error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Busca os registros sanitários de um búfalo específico com paginação
   * @param {string} idBufalo - UUID do búfalo
   * @param {number} page - Número da página (default 1)
   * @param {number} limit - Itens por página (default 10)
   * @returns {Promise<Object>}
   */
  async getSanitaryDataByBuffalo(idBufalo, page = 1, limit = 10) {
    try {
      const response = await apiCache.get(
        `/dados-sanitarios/bufalo/${idBufalo}`,
        {
          params: {
            page,
            limit,
          },
        },
        CACHE_TTL.MEDIUM
      );
      return response;
    } catch (error) {
      console.error('Erro ao buscar dados sanitários:', error);
      if (error.response?.status === 404) {
        // Retorna e estrutura vazia para não quebrar a UI
        return { data: [], meta: { total: 0, page, limit } };
      }
      throw error;
    }
  },
};
