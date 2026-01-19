import api from '../lib/api';

/**
 * Serviço para gerenciar alimentações (definições e registros)
 */
const alimentacaoService = {
  // ==================== DEFINIÇÕES DE ALIMENTAÇÃO ====================

  /**
   * Lista todas as definições de alimentação
   */
  getAllDefinicoes: async () => {
    const response = await api.get('/alimentacoes-def');
    return response.data;
  },

  /**
   * Lista definições de alimentação por propriedade
   */
  getDefinicoesByPropriedade: async (idPropriedade) => {
    const response = await api.get(
      `/alimentacoes-def/propriedade/${idPropriedade}`
    );
    return response.data;
  },

  /**
   * Busca uma definição específica por ID
   */
  getDefinicaoById: async (id) => {
    const response = await api.get(`/alimentacoes-def/${id}`);
    return response.data;
  },

  /**
   * Cria uma nova definição de alimentação
   */
  createDefinicao: async (data) => {
    const response = await api.post('/alimentacoes-def', data);
    return response.data;
  },

  /**
   * Atualiza uma definição de alimentação
   */
  updateDefinicao: async (id, data) => {
    const response = await api.patch(`/alimentacoes-def/${id}`, data);
    return response.data;
  },

  /**
   * Remove uma definição de alimentação
   */
  deleteDefinicao: async (id) => {
    const response = await api.delete(`/alimentacoes-def/${id}`);
    return response.data;
  },

  // ==================== REGISTROS DE ALIMENTAÇÃO ====================

  /**
   * Lista todos os registros de alimentação
   */
  getAllRegistros: async () => {
    const response = await api.get('/alimentacao/registros');
    return response.data;
  },

  /**
   * Lista registros de alimentação por propriedade
   */
  getRegistrosByPropriedade: async (idPropriedade) => {
    const response = await api.get(
      `/alimentacao/registros/propriedade/${idPropriedade}`
    );
    return response.data;
  },

  /**
   * Busca um registro específico por ID
   */
  getRegistroById: async (id) => {
    const response = await api.get(`/alimentacao/registros/${id}`);
    return response.data;
  },

  /**
   * Cria um novo registro de alimentação
   */
  createRegistro: async (data) => {
    const response = await api.post('/alimentacao/registros', data);
    return response.data;
  },

  /**
   * Atualiza um registro de alimentação
   */
  updateRegistro: async (id, data) => {
    const response = await api.patch(`/alimentacao/registros/${id}`, data);
    return response.data;
  },

  /**
   * Remove um registro de alimentação
   */
  deleteRegistro: async (id) => {
    const response = await api.delete(`/alimentacao/registros/${id}`);
    return response.data;
  },
};

export default alimentacaoService;
