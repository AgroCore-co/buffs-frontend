import api from '@/lib/api';

export const zootecnicoService = {
  /**
   * Busca o histórico zootécnico de um búfalo específico
   * @param {string} id_bufalo
   * @param {number} page
   * @param {number} limit
   * @returns {Promise<{ data: any[], meta: any }>}
   */
  getZootecnicoDataByBuffalo: async (id_bufalo, page = 1, limit = 10) => {
    try {
      const response = await api.get(
        `/dados-zootecnicos/bufalo/${id_bufalo}?page=${page}&limit=${limit}`
      );
      // O interceptor já retorna response.data, mas vamos garantir o formato
      return response;
    } catch (error) {
      console.error('Erro ao buscar dados zootécnicos:', error);
      throw error;
    }
  },
};
