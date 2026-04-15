import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  authService, 
  SigninDTO, 
  SignupProprietarioDTO, 
  SignupFuncionarioDTO,
  AuthSessionResponse 
} from '@/services/auth.service';
import { useAuthStore } from '@/stores/auth.store';

export const AUTH_QUERY_KEYS = {
  session: ['auth', 'session'] as const,
};

/**
 * Hook de Autenticação
 * Gerencia o ciclo de vida da sessão: Login, Logout e Registros.
 */
export function useAuth() {
  const queryClient = useQueryClient();
  
  // Aceder ao estado e acções do Zustand
  const { session, profile, isAuthenticated, setSession, clearAuth } = useAuthStore();

  // ==========================================
  // MUTAÇÕES
  // ==========================================

  // Mutação de Login
  const loginMutation = useMutation({
    mutationFn: (credentials: SigninDTO) => authService.signin(credentials),
    onSuccess: (sessionData: AuthSessionResponse) => {
      // 1. Persistência no LocalStorage (para o interceptor do axios e F5)
      authService.setSession(sessionData);
      
      // 2. Atualiza o Estado Global (Zustand)
      setSession(sessionData);
      
      // 3. Atualiza o cache do React Query
      queryClient.setQueryData(AUTH_QUERY_KEYS.session, sessionData);
    },
  });

  // Mutação de Logout
  const logoutMutation = useMutation({
    mutationFn: () => authService.signout(),
    onSettled: () => {
      // Limpa tudo: Zustand, LocalStorage e Cache do React Query
      authService.signout(); // Limpa local no service
      clearAuth();
      queryClient.setQueryData(AUTH_QUERY_KEYS.session, null);
      queryClient.clear(); 
    },
  });

  // Mutação de Registo de Proprietário
  const signupProprietarioMutation = useMutation({
    mutationFn: (data: SignupProprietarioDTO) => authService.signupProprietario(data),
    onSuccess: (response) => {
      // Se o signup já retorna sessão, podemos logar o utilizador aqui
      if (response.session) {
        authService.setSession(response.session);
        setSession(response.session);
      }
    }
  });

  // Mutação de Registo de Funcionário
  const signupFuncionarioMutation = useMutation({
    mutationFn: (data: SignupFuncionarioDTO) => authService.signupFuncionario(data),
  });

  // ==========================================
  // RETORNO DO HOOK
  // ==========================================

  return {
    // Dados da Sessão
    session,
    profile,
    isAuthenticated,
    user: session?.user ?? null,

    // Métodos de Acção
    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    signupProprietario: signupProprietarioMutation.mutateAsync,
    signupFuncionario: signupFuncionarioMutation.mutateAsync,

    // Estados de Carregamento
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isSigningUp: signupProprietarioMutation.isPending || signupFuncionarioMutation.isPending,
    
    // Erros das mutações (opcional, podes tratar no try/catch do componente)
    loginError: loginMutation.error,
  };
}