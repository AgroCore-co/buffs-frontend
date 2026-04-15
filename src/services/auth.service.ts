import apiClient from '@/lib/apiClient';

// ==========================================
// DTOs (Data Transfer Objects)
// ==========================================

/**
 * Payload para cadastro de proprietário.
 */
export interface SignupProprietarioDTO {
  email: string;
  password: string;
  nome: string;
  telefone: string;
  idEndereco: string;
}

/**
 * Payload para cadastro de funcionário.
 */
export interface SignupFuncionarioDTO {
  email: string;
  password: string;
  nome: string;
  telefone: string;
  cargo: 'GERENTE' | 'FUNCIONARIO' | 'VETERINARIO';
  idEndereco: string;
  idPropriedade?: string;
}

/**
 * Payload para login.
 */
export interface SigninDTO {
  email: string;
  password: string;
}

/**
 * Estrutura da resposta de sessão autenticada.
 */
export interface AuthSessionResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: {
    id: string;
    email: string;
    metadata: {
      email: string;
      email_verified: boolean;
      nome: string;
      phone_verified: boolean;
      sub: string;
      telefone: string;
    };
  };
}

// ==========================================
// SERVIÇO DE AUTENTICAÇÃO
// ==========================================

/**
 * Serviço centralizado para autenticação e gerenciamento de sessão do usuário.
 * Todos os métodos retornam Promises e utilizam o apiClient customizado.
 */
export const authService = {
  /**
   * Cria uma nova conta principal e perfil de proprietário.
   * Em caso de falha em qualquer etapa interna, ocorre rollback automático.
   * @param data Dados obrigatórios para cadastro do proprietário
   * @returns Dados do usuário criado
   */
  async signupProprietario(data: SignupProprietarioDTO) {
    const response = await apiClient.post('/auth/signup-proprietario', data);
    return response.data;
  },

  /**
   * Registra um novo funcionário e vincula às propriedades.
   * Exige que a requisição seja feita por um usuário com cargo PROPRIETARIO ou GERENTE.
   * @param data Dados do funcionário a ser cadastrado
   * @returns Dados do funcionário criado
   */
  async signupFuncionario(data: SignupFuncionarioDTO) {
    const response = await apiClient.post('/auth/signup-funcionario', data);
    return response.data;
  },

  /**
   * Autentica o usuário e retorna os tokens de acesso (JWT).
   * @param data Credenciais de login (email e senha)
   * @returns Estrutura de sessão autenticada
   */
  async signin(data: SigninDTO): Promise<AuthSessionResponse> {
    const response = await apiClient.post<AuthSessionResponse>('/auth/signin', data);
    return response.data;
  },

  /**
   * Solicita um novo access_token utilizando o refresh_token ativo.
   * @param refreshToken Token de atualização válido
   * @returns Nova estrutura de sessão autenticada
   */
  async refresh(refreshToken: string): Promise<AuthSessionResponse> {
    const response = await apiClient.post<AuthSessionResponse>('/auth/refresh', {
      refresh_token: refreshToken,
    });
    return response.data;
  },

  /**
   * Invalida a sessão atual no backend e limpa os dados locais do usuário.
   * @returns Confirmação de logout
   */
  async signout() {
    const response = await apiClient.post('/auth/signout');
    // Remove sessão local para garantir segurança
    if (typeof window !== 'undefined') {
      localStorage.removeItem('@Buffs:session');
    }
    return response.data;
  },

  // ==========================================
  // HELPERS DE SESSÃO LOCAL
  // ==========================================

  /**
   * Salva a sessão autenticada no localStorage do navegador.
   * @param sessionData Estrutura de sessão autenticada
   */
  setSession(sessionData: AuthSessionResponse) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('@Buffs:session', JSON.stringify(sessionData));
    }
  },

  /**
   * Recupera a sessão autenticada do localStorage, se existir.
   * @returns Estrutura de sessão autenticada ou null
   */
  getSession(): AuthSessionResponse | null {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem('@Buffs:session');
      return data ? JSON.parse(data) : null;
    }
    return null;
  },
};