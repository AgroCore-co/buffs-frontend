import api from '@/lib/api';

class MovimentacaoService {
  /**
   * Registra movimentação física de um grupo para novo lote
   * @param {Object} data - Dados da movimentação (id_propriedade, id_grupo, id_lote_anterior, id_lote_atual, dt_entrada, dt_saida)
   * @returns {Promise<Object>} Retorna a movimentação criada
   */
  async registrarMovimentacao(data) {
    try {
      const response = await api.post('/mov-lote', data);
      return response;
    } catch (error) {
      if (error.response?.status === 400) {
        return {
          error: true,
          message: error.response.data?.message || 'Dados inválidos',
          status: 400,
        };
      }
      throw error;
    }
  }

  /**
   * Verifica o status atual de localização de um grupo
   * @param {string} idGrupo - UUID do grupo
   * @returns {Promise<Object>|null} Retorna o status ou null se não encontrado
   */
  async getStatusAtualByGrupo(idGrupo) {
    try {
      const response = await api.get(`/mov-lote/status/grupo/${idGrupo}`);
      return response;
    } catch (error) {
      if (error.response?.status === 404) return null;
      throw error;
    }
  }

  /**
   * Busca o histórico completo de movimentações de um grupo
   * @param {string} idGrupo - UUID do grupo
   * @returns {Promise<Object>|null} Retorna o histórico ou null se não encontrado
   */
  async getHistoricoByGrupo(idGrupo) {
    try {
      const response = await api.get(`/mov-lote/historico/grupo/${idGrupo}`);
      return response;
    } catch (error) {
      if (error.response?.status === 404) return null;
      throw error;
    }
  }
  /**
   * Lista movimentações de lotes por propriedade com paginação
   * @param {string} idPropriedade - UUID da propriedade
   * @param {number} [page=1] - Número da página (padrão: 1)
   * @param {number} [limit=10] - Itens por página (padrão: 10)
   * @returns {Promise<Object>} Retorna { data: Array, meta: Object }
   */
  async getMovimentacoesByPropriedade(idPropriedade, page = 1, limit = 10) {
    try {
      const response = await api.get(`/mov-lote/propriedade/${idPropriedade}`, {
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

  /**
   * Busca uma movimentação pelo ID
   * @param {string} idMovimentacao - UUID da movimentação
   * @returns {Promise<Object>|null}
   */
  async getMovimentacaoById(idMovimentacao) {
    try {
      const response = await api.get(`/mov-lote/${idMovimentacao}`);
      return response;
    } catch (error) {
      if (error.response?.status === 404) return null;
      throw error;
    }
  }
}

export const movimentacaoService = new MovimentacaoService();
export default movimentacaoService;
