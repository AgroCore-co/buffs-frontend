import api from '@/lib/api';

class UsuarioService {
  /**
   * Busca o perfil do usuário logado via GET /usuarios/me
   */
  async getProfile() {
    try {
      const profile = await api.get('/usuarios/me');
      return profile;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return null; // Perfil não encontrado
      }
      throw error;
    }
  }

  /**
   * Busca um usuário específico pelo ID (GET /usuarios/{id})
   * @param {string} id - UUID do usuário
   */
  async getUsuarioById(id) {
    try {
      const usuario = await api.get(`/usuarios/${id}`);
      return usuario;
    } catch (error) {
      if (error.response) {
        console.error('Erro ao buscar usuário:', error.response.data);
        if (error.response.status === 401) return null; // Não autorizado
        if (error.response.status === 404) return null; // Usuário não encontrado
      }
      throw error;
    }
  }
}

export const usuarioService = new UsuarioService();
export default usuarioService;
