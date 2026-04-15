"use client";

import React, { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
const NotAuthorized = dynamic(() => import('@/app/not-authorized'), { ssr: false });
import { useRouter, usePathname, useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth.store';
import { usuariosService } from '@/services/usuarios.service';
import { USUARIOS_QUERY_KEYS } from '@/hooks/useUsuarios';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, profile, setProfile, clearAuth } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const { locale } = useParams();
  // Estado para controlar exibição da tela de não autorizado
  const [showNotAuthorized, setShowNotAuthorized] = useState(false);
  
  // Controle de hidratação do Next.js para evitar erros de renderização no servidor (SSR)
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
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
    enabled: isAuthenticated && !profile, // Roda APENAS se estiver logado E sem perfil
    retry: 0, // Se der erro (ex: token fraudado/expirado), não tenta de novo, falha logo
  });

  // Sincroniza a busca acima com o Zustand
  useEffect(() => {
    if (fetchedProfile && !profile) {
      setProfile(fetchedProfile);
    }
    
    // Se a busca falhar (API retornou 401, etc), limpamos a sessão para forçar o login
    if (isError) {
      clearAuth();
    }
  }, [fetchedProfile, isError, profile, setProfile, clearAuth]);

  // ==========================================
  // 2. REGRAS DE ROTEAMENTO E PROTEÇÃO
  // ==========================================
  
  useEffect(() => {
    if (!isMounted) return;

    const isAuthRoute = pathname.match(/^\/(\w{2})(\/auth)/) || pathname.startsWith('/auth');
    
    // Lista de rotas que podem ser acessadas sem login (ex: landing page)
    const isPublicRoute = pathname === '/';

    if (!isAuthenticated && !isAuthRoute && !isPublicRoute) {
      // TENTATIVA DE INVASÃO: Não tá logado e tentou acessar área restrita
      router.replace(`/${locale}/auth/login`);
    } 
    else if (isAuthenticated && profile) {
      // Protege para que o usuário só acesse a página do seu cargo
      const cargoToPath: Record<string, string> = {
        PROPRIETARIO: `/${locale}/proprietario`,
        GERENTE: `/${locale}/gerente`,
        FUNCIONARIO: `/${locale}/funcionario`,
        VETERINARIO: `/${locale}/veterinario`,
      };

      // Extrai o segmento principal da rota atual (ex: /pt/proprietario)
      const pathLower = pathname.toLowerCase();
      const expectedPath = cargoToPath[profile.cargo];

      // Se está em rota de login/cadastro, sempre redireciona para a rota do cargo
      if (isAuthRoute) {
        router.replace(expectedPath);
      } else if (expectedPath && !pathLower.startsWith(expectedPath.toLowerCase())) {
        // Se está tentando acessar rota de outro cargo, exibe tela de não autorizado
        setShowNotAuthorized(true);
      } else {
        setShowNotAuthorized(false);
      }
    }
  }, [isAuthenticated, profile, pathname, isMounted, router]);

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
            <p className="text-sm text-[#838181]">Carregando sessão...</p>
         </div>
      </div>
    );
  }
  if (showNotAuthorized) {
    return <NotAuthorized />;
  }
  // Se passou por todas as validações, renderiza a aplicação
  return <>{children}</>;
}