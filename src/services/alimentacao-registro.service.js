import api from '@/lib/api';

const alimentacaoRegistroService = {
  // Lista registros da propriedade
  getRegistrosByPropriedade: async (idPropriedade, page = 1, limit = 100) => {
    try {
      const response = await api.get(
        `/alimentacao/registros/propriedade/${idPropriedade}`,
        {
          params: { page, limit },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar registros de alimentação:', error);
      throw error;
    }
  },

  // Busca um registro por ID
  getRegistroById: async (id) => {
    try {
      const response = await api.get(`/alimentacao/registros/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar registro de alimentação:', error);
      throw error;
    }
  },

  // Cria um novo registro
  createRegistro: async (data) => {
    try {
      const response = await api.post('/alimentacao/registros', data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar registro de alimentação:', error);
      throw error;
    }
  },

  // Atualiza um registro
  updateRegistro: async (id, data) => {
    try {
      const response = await api.patch(`/alimentacao/registros/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar registro de alimentação:', error);
      throw error;
    }
  },

  // Remove um registro
  deleteRegistro: async (id) => {
    try {
      const response = await api.delete(`/alimentacao/registros/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao excluir registro de alimentação:', error);
      throw error;
    }
  },
};

export default alimentacaoRegistroService;
