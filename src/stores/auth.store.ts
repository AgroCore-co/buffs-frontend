import { create } from 'zustand';
import { AuthSessionResponse, authService } from '@/services/auth.service';
import { Usuario } from '@/services/usuarios.service';

interface AuthState {
  // Dados
  session: AuthSessionResponse | null;
  profile: Usuario | null;
  isAuthenticated: boolean;

  // Ações
  setSession: (session: AuthSessionResponse) => void;
  setProfile: (profile: Usuario) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // Inicialização síncrona: verifica se já existe sessão salva ao carregar a aplicação
  const initialSession = authService.getSession();

  return {
    // Estado inicial
    session: initialSession,
    profile: null, // O perfil sempre começa nulo até a query de /usuarios/me rodar
    isAuthenticated: !!initialSession?.access_token,

    // Ações para mutar o estado
    setSession: (session) => set({ 
      session, 
      isAuthenticated: !!session?.access_token 
    }),

    setProfile: (profile) => set({ profile }),

    clearAuth: () => set({ 
      session: null, 
      profile: null, 
      isAuthenticated: false 
    }),
  };
});