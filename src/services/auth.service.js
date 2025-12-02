import api, {
  setAuthTokens,
  clearAuthTokens,
  getRefreshToken,
  getAuthToken,
} from "@/lib/api";

const USER_STORAGE_KEY = "user_data";

class AuthService {
  /**
   * Registra um novo usuário.
   */
  async signup(data) {
    return await api.post("/auth/signup", data);
  }

  /**
   * Realiza o login, salva tokens E salva os dados do usuário no LocalStorage.
   */
  async login(credentials) {
    const data = await api.post("/auth/signin", credentials);

    // 1. Salva Tokens (Access e Refresh)
    if (data.access_token && data.refresh_token) {
      setAuthTokens(data.access_token, data.refresh_token);
    }

    // 2. Salva os dados do usuário (ID, Email, Metadata) no LocalStorage
    // A API retorna o objeto "user" na raiz da resposta, conforme seu JSON
    if (data.user) {
      this.setStoredUser(data.user);
    }

    return data;
  }

  /**
   * Recupera o usuário salvo no LocalStorage (simulando um /me).
   * Verifica também se temos um token válido antes de retornar o usuário.
   */
  async getMe() {
    // Se não tiver token, não adianta ter usuário salvo, a sessão é inválida.
    const token = getAuthToken();
    if (!token) return null;

    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (!storedUser) return null;

    try {
      return JSON.parse(storedUser);
    } catch (error) {
      console.error("Erro ao fazer parse do usuário:", error);
      return null;
    }
  }

  /**
   * Salva o objeto de usuário no localStorage
   */
  setStoredUser(user) {
    if (typeof window !== "undefined") {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    }
  }

  /**
   * Renovação manual do token.
   */
  async refresh() {
    const currentRefreshToken = getRefreshToken();

    if (!currentRefreshToken) {
      throw new Error("No refresh token found");
    }

    const data = await api.post("/auth/refresh", {
      refresh_token: currentRefreshToken,
    });

    if (data.access_token && data.refresh_token) {
      setAuthTokens(data.access_token, data.refresh_token);
    }
    
    // Se o refresh retornar um user atualizado, salvamos novamente
    if (data.user) {
      this.setStoredUser(data.user);
    }

    return data;
  }

  /**
   * Logout completo: limpa API, Tokens e Dados do Usuário.
   */
  async logout() {
    try {
      await api.post("/auth/signout");
    } catch (e) {
      console.warn("Aviso: Falha ao notificar logout ao backend", e);
    } finally {
      // Limpa tokens
      clearAuthTokens();
      // Limpa dados do usuário
      if (typeof window !== "undefined") {
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    }
  }
}

export const authService = new AuthService();
export default authService;