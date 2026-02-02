import api from '@/lib/api';
import { apiCache, CACHE_TTL } from '@/lib/apiCache';

/**
 * Service para gerenciamento de Alertas
 */
export const alertasService = {
  /**
   * Cria um novo alerta com classificação automática de prioridade
   * @param {Object} data - Dados do alerta
   * @param {string} data.animal_id - ID do animal
   * @param {string} data.grupo - Grupo/Lote do animal
   * @param {string} data.localizacao - Localização
   * @param {string} data.id_propriedade - ID da propriedade (UUID)
   * @param {string} data.motivo - Motivo do alerta
   * @param {string} data.nicho - Tipo do alerta (CLINICO, SANITARIO, REPRODUCAO, MANEJO, PRODUCAO)
   * @param {string} data.data_alerta - Data do alerta (ISO string)
   * @param {string} [data.prioridade] - Prioridade (BAIXA, MEDIA, ALTA) - opcional se usar classificação IA
   * @param {string} [data.texto_ocorrencia_clinica] - Texto para classificação automática por IA
   * @param {string} [data.observacao] - Observações adicionais
   * @param {boolean} [data.visto] - Se o alerta foi visualizado
   * @param {string} [data.id_evento_origem] - ID do evento de origem
   * @param {string} [data.tipo_evento_origem] - Tipo do evento de origem
   * @returns {Promise<Object>}
   */
  async criarAlerta(data) {
    try {
      const response = await api.post('/alertas', data);
      return response;
    } catch (error) {
      console.error('Erro ao criar alerta:', error);
      throw error;
    }
  },

  /**
   * Lista alertas com filtros avançados
   * @param {Object} [params] - Parâmetros de filtro
   * @param {string} [params.tipo] - Tipo do alerta (CLINICO, SANITARIO, REPRODUCAO, MANEJO, PRODUCAO)
   * @param {string} [params.prioridade] - Prioridade (BAIXA, MEDIA, ALTA)
   * @param {number} [params.antecedencia] - Alertas nos próximos X dias
   * @param {boolean} [params.incluirVistos] - Incluir alertas visualizados
   * @param {number} [params.page] - Número da página
   * @param {number} [params.limit] - Itens por página
   * @returns {Promise<Object>}
   */
  async listarAlertas(params = {}) {
    try {
      const response = await apiCache.get(
        '/alertas',
        { params },
        CACHE_TTL.SHORT
      );
      return response;
    } catch (error) {
      console.error('Erro ao listar alertas:', error);
      throw error;
    }
  },

  /**
   * Lista alertas por propriedade com filtros opcionais
   * @param {string} idPropriedade - ID da propriedade
   * @param {Object} [params] - Parâmetros de filtro
   * @param {boolean} [params.incluirVistos] - Incluir alertas visualizados
   * @param {string} [params.prioridade] - Prioridade (BAIXA, MEDIA, ALTA)
   * @param {number} [params.page] - Número da página
   * @param {number} [params.limit] - Itens por página
   * @param {string[]} [params.nichos] - Nichos específicos para filtrar
   * @returns {Promise<Object>}
   */
  async listarAlertasPorPropriedade(idPropriedade, params = {}) {
    try {
      const response = await apiCache.get(
        `/alertas/propriedade/${idPropriedade}`,
        { params },
        CACHE_TTL.SHORT
      );
      return response;
    } catch (error) {
      console.error('Erro ao listar alertas da propriedade:', error);
      throw error;
    }
  },

  /**
   * Busca alerta específico com detalhes completos
   * @param {string} id - ID único do alerta
   * @returns {Promise<Object>}
   */
  async buscarAlerta(id) {
    try {
      const response = await apiCache.get(
        `/alertas/${id}`,
        {},
        CACHE_TTL.SHORT
      );
      return response;
    } catch (error) {
      console.error('Erro ao buscar alerta:', error);
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Remove alerta do sistema
   * @param {string} id - ID único do alerta
   * @returns {Promise<void>}
   */
  async deletarAlerta(id) {
    try {
      await api.delete(`/alertas/${id}`);
    } catch (error) {
      console.error('Erro ao deletar alerta:', error);
      throw error;
    }
  },

  /**
   * Gerencia status de visualização do alerta
   * @param {string} id - ID único do alerta
   * @param {boolean} status - true = visto, false = não visto
   * @returns {Promise<Object>}
   */
  async marcarVisto(id, status = true) {
    try {
      console.log('DEBUG marcarVisto - id:', id, 'status:', status);
      const response = await api.patch(`/alertas/${id}/visto?status=${status}`);
      return response;
    } catch (error) {
      console.error('Erro ao atualizar status de visualização:', error);
      console.error('Response data:', error.response?.data);
      throw error;
    }
  },

  /**
   * Verifica e cria alertas pendentes para uma propriedade específica
   * @param {string} idPropriedade - ID da propriedade
   * @param {string[]} [nichos] - Nichos específicos para verificar (opcional)
   * @returns {Promise<Object>}
   */
  async verificarAlertas(idPropriedade, nichos = []) {
    try {
      const params = nichos.length > 0 ? { nichos } : {};
      const response = await api.post(
        `/alertas/verificar/${idPropriedade}`,
        null,
        { params }
      );
      return response;
    } catch (error) {
      console.error('Erro ao verificar alertas:', error);
      throw error;
    }
  },
};

export default alertasService;
