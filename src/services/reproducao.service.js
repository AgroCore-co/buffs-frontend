import { api } from '@/lib/api';
import { apiCache, CACHE_TTL } from '@/lib/apiCache';

class ReproducaoService {
  async getReproducoesPorPropriedade(idPropriedade, page = 1, limit = 10) {
    try {
      const response = await apiCache.get(
        `/cobertura/propriedade/${idPropriedade}`,
        { params: { page, limit } },
        CACHE_TTL.SHORT
      );
      return response;
    } catch (error) {
      console.error('Erro ao buscar reproduções:', error);
      throw error;
    }
  }

  async getReproducaoById(id) {
    try {
      const response = await apiCache.get(
        `/cobertura/${id}`,
        {},
        CACHE_TTL.SHORT
      );
      return response;
    } catch (error) {
      console.error('Erro ao buscar detalhe da reprodução:', error);
      throw error;
    }
  }

  async getDashboardMetrics(idPropriedade) {
    try {
      const response = await apiCache.get(
        `/dashboard/reproducao/${idPropriedade}`,
        {},
        CACHE_TTL.SHORT
      );
      return response;
    } catch (error) {
      console.error('Erro ao buscar métricas do dashboard:', error);
      throw error;
    }
  }

  // Adicionar outros metodos conforme necessario...
}

export const reproducaoService = new ReproducaoService();
