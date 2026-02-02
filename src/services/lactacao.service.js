import api from '@/lib/api';
import { apiCache, CACHE_TTL } from '@/lib/apiCache';

export const lactacaoService = {
  /**
   * Busca estatísticas dos ciclos de lactação
   * @param {string} idPropriedade - UUID da propriedade
   * @returns {Promise<Object>}
   */
  async getEstatisticas(idPropriedade) {
    try {
      const response = await apiCache.get(
        `/lactacao/propriedade/${idPropriedade}/estatisticas`,
        {},
        CACHE_TTL.LONG
      );
      return response;
    } catch (error) {
      console.error('Erro ao buscar estatísticas de lactação:', error);
      if (error.response?.status === 401 || error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Lista búfalas disponíveis para ordenha (em lactação)
   * @param {string} idPropriedade
   * @returns {Promise<Array>}
   */
  async getBufalasEmLactacao(idPropriedade) {
    try {
      // Nota: Cache curto pois o status pode mudar com novas ordenhas/secagem
      const response = await apiCache.get(
        `/ordenhas/femeas/em-lactacao/${idPropriedade}`,
        {},
        CACHE_TTL.SHORT
      );
      return response;
    } catch (error) {
      console.error('Erro ao buscar búfalas em lactação:', error);
      if (error.response?.status === 404) return [];
      throw error;
    }
  },

  /**
   * Obtém resumo de produção detalhado de uma búfala
   * @param {string} idBufala
   * @returns {Promise<Object>}
   */
  async getResumoProducao(idBufala) {
    try {
      const response = await apiCache.get(
        `/ordenhas/bufala/${idBufala}/resumo-producao`,
        {},
        CACHE_TTL.SHORT
      );
      return response;
    } catch (error) {
      console.error('Erro ao buscar resumo de produção:', error);
      throw error;
    }
  },

  /**
   * Lista ordenhas de um ciclo específico
   * @param {string} idCiclo
   * @param {number} page
   * @param {number} limit
   * @returns {Promise<Object>}
   */
  async getOrdenhasPorCiclo(idCiclo, page = 1, limit = 20) {
    try {
      const response = await apiCache.get(
        `/ordenhas/ciclo/${idCiclo}`,
        { params: { page, limit } },
        CACHE_TTL.MEDIUM
      );
      return response;
    } catch (error) {
      console.error('Erro ao buscar ordenhas do ciclo:', error);
      throw error;
    }
  },
};
