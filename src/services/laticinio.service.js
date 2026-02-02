import api from '@/lib/api';
import { apiCache, CACHE_TTL } from '@/lib/apiCache';

class LaticinioService {
  /**
   * Cria uma nova indústria
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async create(data) {
    try {
      const response = await api.post('/laticinios', data);
      // Invalida o cache da lista de indústrias da propriedade
      if (data.id_propriedade) {
        apiCache.invalidate(`/laticinios/propriedade/${data.id_propriedade}`);
      }
      return response.data;
    } catch (error) {
      console.error('Erro ao criar laticínio:', error);
      throw error;
    }
  }

  /**
   * Lista todas as indústrias cadastradas
   * @returns {Promise<Array>}
   */
  async getAll() {
    try {
      const response = await apiCache.get('/laticinios', {}, CACHE_TTL.MEDIUM);
      return response;
    } catch (error) {
      console.error('Erro ao listar laticínios:', error);
      throw error;
    }
  }

  /**
   * Lista as indústrias associadas a uma propriedade específica
   * @param {string} idPropriedade
   * @returns {Promise<Array>}
   */
  async getLaticiniosPorPropriedade(idPropriedade) {
    try {
      const response = await apiCache.get(
        `/laticinios/propriedade/${idPropriedade}`,
        {},
        CACHE_TTL.MEDIUM
      );
      return response;
    } catch (error) {
      console.error('Erro ao buscar indústrias da propriedade:', error);
      throw error;
    }
  }

  /**
   * Busca uma indústria pelo ID
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async getLaticinioById(id) {
    try {
      const response = await apiCache.get(
        `/laticinios/${id}`,
        {},
        CACHE_TTL.LONG
      );
      return response;
    } catch (error) {
      console.error('Erro ao buscar indústria:', error);
      throw error;
    }
  }

  /**
   * Atualiza os dados de uma indústria
   * @param {string} id
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async update(id, data) {
    try {
      const response = await api.patch(`/laticinios/${id}`, data);
      // Invalida caches
      apiCache.invalidate(`/laticinios/${id}`);
      if (data.id_propriedade) {
        apiCache.invalidate(`/laticinios/propriedade/${data.id_propriedade}`);
      }
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar laticínio:', error);
      throw error;
    }
  }

  /**
   * Remover indústria (soft delete)
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async delete(id) {
    try {
      const response = await api.delete(`/laticinios/${id}`);
      // Invalida caches
      apiCache.invalidate(`/laticinios/${id}`);
      // Como não temos o id_propriedade aqui, talvez precise invalidar geral ou o componente lidar com refetch
      return response.data;
    } catch (error) {
      console.error('Erro ao remover laticínio:', error);
      throw error;
    }
  }

  /**
   * Restaurar indústria removida
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async restore(id) {
    try {
      const response = await api.post(`/laticinios/${id}/restore`);
      apiCache.invalidate(`/laticinios/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao restaurar laticínio:', error);
      throw error;
    }
  }

  /**
   * Listar todas as indústrias incluindo removidas
   * @returns {Promise<Array>}
   */
  async getDeletedAll() {
    try {
      const response = await api.get('/laticinios/deleted/all');
      return response.data;
    } catch (error) {
      console.error('Erro ao listar indústrias removidas:', error);
      throw error;
    }
  }
}

export const laticinioService = new LaticinioService();
