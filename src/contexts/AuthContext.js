"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation"; // App Router uses next/navigation
import { authService } from "@/services/auth.service"; // Ajuste o path conforme sua estrutura
import usuarioService from "@/services/usuario.service"; // Ajuste o path conforme sua estrutura
import { registerLogoutCallback, getAuthToken } from "@/lib/api"; // Ajuste o path conforme sua estrutura
import { getRedirectRoute, ROUTES } from "@/constants/routes";
import Cookies from "js-cookie"; // Recomendo: npm install js-cookie

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Função auxiliar para sincronizar LocalStorage com Cookies (Para o Middleware funcionar)
  const syncTokenToCookie = () => {
    const token = getAuthToken();
    if (token) {
      // Seta o cookie para o Middleware ler (validade de 1 dia, por exemplo)
      Cookies.set("access_token", token, { expires: 1, path: "/" });
    } else {
      Cookies.remove("access_token");
    }
  };

  const loadUser = async () => {
    // Verifica se há token antes de tentar carregar o perfil
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const profile = await usuarioService.getProfile();
      if (profile) {
        setUser(profile);
        syncTokenToCookie(); // Garante que o cookie existe se o user existe
      } else {
        setUser(null);
        Cookies.remove("access_token");
      }
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
      setUser(null);
      Cookies.remove("access_token");
      // Só redireciona se não estiver já na página de login
      if (pathname !== ROUTES.LOGIN) {
        router.push(ROUTES.LOGIN);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 1. Carrega usuário salvo ao iniciar
    loadUser();

    // 2. Registra callback para logout forçado vindo do interceptor do Axios
    registerLogoutCallback(() => {
      authService.logout();
      setUser(null);
      Cookies.remove("access_token");
      router.push(ROUTES.LOGIN);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function login(creds) {
    try {
      // 1. Login via API (Auth Service)
      await authService.login(creds);

      // 2. Sincroniza token para Cookie (Crítico para Middleware)
      syncTokenToCookie();

      // 3. Busca perfil atualizado para saber o cargo
      const profile = await usuarioService.getProfile();

      if (profile) {
        setUser(profile);

        // 4. Redirecionamento inteligente baseado no cargo
        const destination = getRedirectRoute(profile.cargo);
        router.push(destination);
      } else {
        // Fallback estranho (logou mas não tem perfil)
        router.push(ROUTES.HOME);
      }
    } catch (error) {
      throw error; // Repassa erro para o form de Login tratar
    }
  }

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      Cookies.remove("access_token");
      router.push(ROUTES.LOGIN);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        isAuthenticated: !!user,
        refreshUser: loadUser,
        getRedirectRoute, // Exposta caso precise usar em outros lugares
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};
