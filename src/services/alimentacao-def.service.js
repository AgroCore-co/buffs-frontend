import api from '@/lib/api';

const alimentacaoDefService = {
  // Lista todas as definições da propriedade
  getAlimentacoesDefByPropriedade: async (
    idPropriedade,
    page = 1,
    limit = 100
  ) => {
    try {
      const response = await api.get(
        `/alimentacoes-def/propriedade/${idPropriedade}`,
        {
          params: { page, limit },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar definições de alimentação:', error);
      throw error;
    }
  },

  // Busca uma definição por ID
  getAlimentacaoDefById: async (id) => {
    try {
      const response = await api.get(`/alimentacoes-def/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar definição de alimentação:', error);
      throw error;
    }
  },

  // Cria uma nova definição
  createAlimentacaoDef: async (data) => {
    try {
      const response = await api.post('/alimentacoes-def', data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar definição de alimentação:', error);
      throw error;
    }
  },

  // Atualiza uma definição
  updateAlimentacaoDef: async (id, data) => {
    try {
      const response = await api.patch(`/alimentacoes-def/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar definição de alimentação:', error);
      throw error;
    }
  },

  // Remove uma definição
  deleteAlimentacaoDef: async (id) => {
    try {
      const response = await api.delete(`/alimentacoes-def/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao excluir definição de alimentação:', error);
      throw error;
    }
  },
};

export default alimentacaoDefService;
