import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  authService,
  SigninDTO,
  SignupProprietarioDTO,
  SignupFuncionarioDTO,
  AuthSessionResponse
} from '@/services/auth.service';
import { useAuthStore } from '@/stores/auth.store';
import { useRouter } from '@/i18n/routing';
import { STORAGE_KEYS } from '@/constants';

export const AUTH_QUERY_KEYS = {
  session: ['auth', 'session'] as const,
};

/**
 * Hook de Autenticação
 * Gerencia o ciclo de vida da sessão: Login, Logout e Registros.
 */
export function useAuth() {
  const queryClient = useQueryClient();
  const router = useRouter();
  
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
    mutationFn: async () => {
      // PASSO 1: Cancela TODAS as queries em voo ANTES de qualquer coisa.
      await queryClient.cancelQueries();

      // PASSO 2: Chama a API de logout (token ainda está presente).
      try {
        await authService.signout();
      } catch {
        // Ignora erros da API de signout (ex: token já expirado no servidor).
      }

      // PASSO 3: Agora sim, remove a sessão do localStorage e o cookie de autenticação.
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEYS.SESSION);
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_PROPRIEDADE);
        document.cookie = 'buffs_auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }
    },
    onSettled: () => {
      // PASSO 4: Limpa o estado global do Zustand.
      clearAuth();

      // PASSO 5: Limpa o cache do React Query completamente.
      queryClient.clear();

      // PASSO 6: Redireciona para o login.
      router.replace('/auth/login');
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
    logout: logoutMutation.mutate, // mutate (não mutateAsync) para não propagar erro ao componente
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