import api from '@/lib/api';

class LoteService {
  /**
   * Lista todos os lotes de uma propriedade específica
   * @param {string} idPropriedade - UUID da propriedade
   * @returns {Promise<Array>|null}
   */
  async getLotesByPropriedade(idPropriedade) {
    try {
      const response = await api.get(`/lotes/propriedade/${idPropriedade}`);
      return response;
    } catch (error) {
      if (error.response) {
        if (error.response.status === 404) return null;
      }
      throw error;
    }
  }

  /**
   * Cria um novo lote (piquete) com dados geográficos
   * @param {Object} loteData - Dados do lote
   * @param {string} loteData.nome_lote - Nome do lote
   * @param {string} loteData.id_propriedade - UUID da propriedade
   * @param {string} loteData.id_grupo - UUID do grupo
   * @param {string} [loteData.tipo_lote] - Tipo do lote (ex: "Pasto")
   * @param {string} [loteData.status] - Status do lote (padrão: "ativo")
   * @param {string} [loteData.descricao] - Descrição do lote
   * @param {number} [loteData.qtd_max] - Quantidade máxima de animais
   * @param {number} loteData.area_m2 - Área em metros quadrados
   * @param {Object} loteData.geo_mapa - Dados geográficos (GeoJSON Polygon)
   * @returns {Promise<Object>}
   */
  async createLote(loteData) {
    try {
      const response = await api.post('/lotes', loteData);
      return response;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error(
          'Propriedade não encontrada ou não pertence ao usuário'
        );
      }
      throw error;
    }
  }

  /**
   * Busca um lote específico
   * @param {string} idLote - UUID do lote
   * @returns {Promise<Object>|null}
   */
  async getLoteById(idLote) {
    try {
      const response = await api.get(`/lotes/${idLote}`);
      return response;
    } catch (error) {
      if (error.response?.status === 404) return null;
      throw error;
    }
  }

  /**
   * Atualiza um lote
   * @param {string} idLote - UUID do lote
   * @param {Object} loteData - Dados do lote para atualizar
   * @returns {Promise<Object>}
   */
  async updateLote(idLote, loteData) {
    try {
      const response = await api.patch(`/lotes/${idLote}`, loteData);
      return response;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error('Lote não encontrado ou não pertence ao usuário');
      }
      throw error;
    }
  }

  /**
   * Remove um lote
   * @param {string} idLote - UUID do lote
   * @returns {Promise<void>}
   */
  async deleteLote(idLote) {
    try {
      await api.delete(`/lotes/${idLote}`);
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error('Lote não encontrado ou não pertence ao usuário');
      }
      throw error;
    }
  }
}

export const loteService = new LoteService();
export default loteService;
