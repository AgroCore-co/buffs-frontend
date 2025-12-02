import api from "@/lib/api";

class UsuarioService {
  /**
   * Busca o perfil do usuário logado via GET /usuarios/me
   */
  async getProfile() {
    try {
      const profile = await api.get("/usuarios/me");
      return profile;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return null; // Perfil não encontrado
      }
      throw error;
    }
  }
}

export const usuarioService = new UsuarioService();
export default usuarioService;
