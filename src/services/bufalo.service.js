import api from '../lib/api';
import { apiCache, CACHE_TTL } from '../lib/apiCache';

/**
 * Serviço para operações com búfalos
 */
const bufaloService = {
  /**
   * Lista todos os búfalos de uma propriedade
   * @param {string} idPropriedade - ID da propriedade
   * @param {number} page - Número da página
   * @param {number} limit - Limite por página
   */
  async getBufalosByPropriedade(idPropriedade, page = 1, limit = 100) {
    try {
      const response = await apiCache.get(
        `/bufalos/propriedade/${idPropriedade}`,
        { params: { page, limit } },
        CACHE_TTL.MEDIUM
      );
      return response;
    } catch (error) {
      if (error.response?.status === 404) {
        return { data: [], meta: { total: 0 } };
      }
      throw error;
    }
  },

  /**
   * Lista búfalos de um grupo específico
   * @param {string} idPropriedade - ID da propriedade
   * @param {string} idGrupo - ID do grupo
   * @param {number} page - Número da página
   * @param {number} limit - Limite por página
   */
  async getBufalosByGrupo(idPropriedade, idGrupo, page = 1, limit = 100) {
    try {
      const response = await apiCache.get(
        `/bufalos/propriedade/${idPropriedade}`,
        { params: { page, limit } },
        CACHE_TTL.MEDIUM
      );

      // Filtra localmente por grupo
      if (response?.data) {
        const bufalosDoGrupo = response.data.filter(
          (bufalo) => bufalo.idGrupo === idGrupo
        );
        return {
          data: bufalosDoGrupo,
          meta: {
            ...response.meta,
            total: bufalosDoGrupo.length,
          },
        };
      }

      return { data: [], meta: { total: 0 } };
    } catch (error) {
      if (error.response?.status === 404) {
        return { data: [], meta: { total: 0 } };
      }
      throw error;
    }
  },

  /**
   * Lista búfalos por categoria (PO, PA, PC, etc)
   * @param {string} categoria - Categoria ABCB
   */
  async getBufalosByCategoria(categoria) {
    try {
      const response = await apiCache.get(
        `/bufalos/categoria/${categoria}`,
        {},
        CACHE_TTL.MEDIUM
      );
      // A API retorna um array direto, normalizamos para o padrão { data: [], meta: {} }
      return {
        data: response.data || response || [],
        meta: {
          total: (response.data || response || []).length,
        },
      };
    } catch (error) {
      if (error.response?.status === 404) {
        return { data: [], meta: { total: 0 } };
      }
      throw error;
    }
  },

  /**
   * Busca um búfalo pelo microchip
   * @param {string} microchip - Número do microchip
   */
  async getBufaloByMicrochip(microchip) {
    try {
      const response = await apiCache.get(
        `/bufalos/microchip/${microchip}`,
        {},
        CACHE_TTL.MEDIUM
      );
      // A API retorna o objeto do búfalo diretamente (graças ao interceptor que faz response.data)
      if (response && response.idBufalo) {
        return {
          data: [response],
          meta: { total: 1 },
        };
      }
      return { data: [], meta: { total: 0 } };
    } catch (error) {
      if (error.response?.status === 404) {
        return { data: [], meta: { total: 0 } };
      }
      throw error;
    }
  },

  /**
   * Registra um novo búfalo
   * @param {Object} bufaloData
   */
  async createBufalo(bufaloData) {
    try {
      const response = await api.post('/bufalos', bufaloData);
      return response;
    } catch (error) {
      if (error.response?.status === 400) {
        throw new Error(error.response.data?.message || 'Dados inválidos');
      }
      throw error;
    }
  },

  /**
   * Busca um búfalo pelo ID
   * @param {string} id - ID do búfalo
   */
  async getBufaloById(id) {
    try {
      const response = await apiCache.get(
        `/bufalos/${id}`,
        {},
        CACHE_TTL.MEDIUM
      );
      return response;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },
};

export default bufaloService;
