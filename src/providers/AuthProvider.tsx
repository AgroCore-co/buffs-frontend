"use client";

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
const NotAuthorized = dynamic(() => import('@/app/not-authorized'), { ssr: false });
const NotAuthenticated = dynamic(() => import('@/app/not-authenticated'), { ssr: false });
import { useRouter, usePathname } from '@/i18n/routing';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth.store';
import { usuariosService } from '@/services/usuarios.service';
import { USUARIOS_QUERY_KEYS } from '@/hooks/useUsuarios';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import { CARGO_ROUTES } from '@/constants';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, profile, setProfile, clearAuth } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname(); // Retorna o path SEM o locale (ex: /proprietario)
  const t = useTranslations('General');

  // Importa isLoggingOut para blindar o efeito de roteamento durante o logout
  const { isLoggingOut } = useAuth();
  
  // Estado para controlar exibição da tela de não autorizado
  const [showNotAuthorized, setShowNotAuthorized] = useState(false);
  // Estado para controlar exibição da tela de não autenticado
  const [showNotAuthenticated, setShowNotAuthenticated] = useState(false);
  
  // Controle de hidratação do Next.js para evitar erros de renderização no servidor (SSR)
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  // ==========================================
  // 1. HIDRATAÇÃO DO PERFIL (Tratamento de F5)
  // ==========================================
  
  // Se o usuário tem o token (isAuthenticated) mas o Zustand perdeu o perfil (F5),
  // fazemos a busca automaticamente antes de renderizar a tela restrita.
  const { data: fetchedProfile, isLoading, isError } = useQuery({
    queryKey: USUARIOS_QUERY_KEYS.me,
    queryFn: usuariosService.getMe,
    // Roda APENAS se estiver logado, sem perfil, e NÃO durante o logout.
    // Isso evita o 401: quando clearAuth() seta isAuthenticated=false durante
    // o logout, o isLoggingOut=true impede que esta query seja re-agendada.
    enabled: isAuthenticated && !profile && !isLoggingOut,
    retry: 0, // Se der erro (ex: token fraudado/expirado), não tenta de novo, falha logo
  });

  // Sincroniza a busca acima com o Zustand
  useEffect(() => {
    if (fetchedProfile && !profile) {
      setProfile(fetchedProfile);
    }
    
    // Se a busca falhar (API retornou 401, etc) E não estamos no meio de um logout,
    // limpamos a sessão para forçar o login.
    // Durante o logout, o erro 401 é esperado e já tratado no useAuth.ts.
    if (isError && !isLoggingOut) {
      clearAuth();
    }
  }, [fetchedProfile, isError, isLoggingOut, profile, setProfile, clearAuth]);

  // ==========================================
  // 2. REGRAS DE ROTEAMENTO E PROTEÇÃO
  // ==========================================
  
  useEffect(() => {
    if (!isMounted) return;

    // Durante o logout, o useAuth.ts já cuida do redirecionamento.
    // Ignorar aqui evita que o AuthProvider mostre <NotAuthenticated />
    // no breve instante entre clearAuth() e router.replace('/auth/login').
    if (isLoggingOut) return;

    // O usePathname do next-intl retorna o path SEM o prefixo de locale
    // Ex: /auth/login, /proprietario, /gerente etc.
    const isAuthRoute = pathname.startsWith('/auth');
    
    // Lista de rotas que podem ser acessadas sem login
    const isPublicRoute = pathname === '/';

    if (!isAuthenticated && !isAuthRoute && !isPublicRoute) {
      // Não está logado e tentou acessar área restrita: mostra tela de não autenticado
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowNotAuthenticated(true);
    } 
    else if (isAuthenticated && profile) {
      // Protege para que o usuário só acesse a página do seu cargo
      const expectedPath = CARGO_ROUTES[profile.cargo];

      // Se está em rota de login/cadastro, sempre redireciona para a rota do cargo
      if (isAuthRoute) {
        router.replace(expectedPath);
      } else if (expectedPath && !pathname.toLowerCase().startsWith(expectedPath.toLowerCase())) {
        // Se está tentando acessar rota de outro cargo, exibe tela de não autorizado
        setShowNotAuthorized(true);
        setShowNotAuthenticated(false);
      } else {
        setShowNotAuthorized(false);
        setShowNotAuthenticated(false);
      }
    }
  }, [isAuthenticated, profile, pathname, isMounted, router, isLoggingOut]);

  // Previne erros de hidratação do Next.js
  if (!isMounted) return null;

  // ==========================================
  // 3. TELA DE CARREGAMENTO GLOBAL
  // ==========================================
  
  // Enquanto estiver validando o token no F5, bloqueia a renderização da aplicação.
  // Isso evita que a tela pisque ou componentes quebrem tentando ler 'profile.nome' que ainda é null.
  if (isAuthenticated && isLoading && !profile) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-white">
         <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-[#ffcf78] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-[#838181]">{t('loadingSession')}</p>
         </div>
      </div>
    );
  }

  // Durante o logout, não renderiza nada de especial — o redirect já está a caminho.
  if (isLoggingOut) {
    return <>{children}</>;
  }

  if (showNotAuthenticated) {
    return <NotAuthenticated />;
  }
  if (showNotAuthorized) {
    return <NotAuthorized />;
  }
  // Se passou por todas as validações, renderiza a aplicação
  return <>{children}</>;
}