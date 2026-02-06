import api from '../lib/api';
import { apiCache, CACHE_TTL } from '../lib/apiCache';

/**
 * Serviço para operações de cobertura/acasalamento
 */
const coberturaService = {
  /**
   * Retorna ranking de fêmeas recomendadas para acasalamento
   * @param {string} idPropriedade - ID da propriedade
   * @param {number} limit - Limitar quantidade de resultados
   */
  async getRecomendacoesFemeas(idPropriedade, limit) {
    try {
      const params = limit ? { limit } : {};
      const response = await apiCache.get(
        `/cobertura/recomendacoes/femeas/${idPropriedade}`,
        { params },
        CACHE_TTL.MEDIUM
      );
      // A API retorna um array direto
      return Array.isArray(response) ? response : [];
    } catch (error) {
      if (error.response?.status === 404) {
        return [];
      }
      throw error;
    }
  },

  /**
   * Retorna ranking de machos recomendados para acasalamento
   * @param {string} idPropriedade - ID da propriedade
   * @param {number} limit - Limitar quantidade de resultados
   */
  async getRecomendacoesMachos(idPropriedade, limit) {
    try {
      const params = limit ? { limit } : {};
      const response = await apiCache.get(
        `/cobertura/recomendacoes/machos/${idPropriedade}`,
        { params },
        CACHE_TTL.MEDIUM
      );
      // A API retorna um array direto
      return Array.isArray(response) ? response : [];
    } catch (error) {
      if (error.response?.status === 404) {
        return [];
      }
      throw error;
    }
  },
  /**
   * Simula um acasalamento e prevê o potencial genético da prole
   * @param {string} idMacho - ID do búfalo macho
   * @param {string} idFemea - ID da búfala fêmea
   */
  async simularAcasalamento(idMacho, idFemea) {
    try {
      const response = await api.post('/reproducao/simulacao', {
        idMacho,
        idFemea,
      });
      return response;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error('Macho ou fêmea não encontrado.');
      }
      throw error;
    }
  },

  /**
   * Realiza análise genealógica completa de um búfalo
   * Retorna ancestrais, descendentes e coeficiente de consanguinidade
   * @param {string} idBufalo - ID do búfalo
   */
  async getAnaliseGenealogica(idBufalo) {
    try {
      const response = await api.post(
        '/reproducao/simulacao/analise-genealogica',
        {
          idBufalo,
        }
      );
      return response;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error('Búfalo não encontrado.');
      }
      throw error;
    }
  },
};

export default coberturaService;
