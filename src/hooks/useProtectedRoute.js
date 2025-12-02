'use client';
import React from 'react';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ROUTES, getRedirectRoute } from '@/constants/routes'; // Importamos getRedirectRoute

/**
 * Hook para proteger componentes/páginas no Client Side.
 * @param {string[]} allowedRoles - Array de cargos permitidos (ex: ['ADMIN', 'PROPRIETARIO']). Se vazio, permite qualquer logado.
 */
export function useProtectedRoute(allowedRoles = []) {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // 1. Se não estiver autenticado -> Login
    if (!isAuthenticated) {
      router.push(ROUTES.LOGIN);
      return;
    }

    // 2. Se autenticado mas não tem cargo permitido -> acesso negado
    if (
      allowedRoles.length > 0 &&
      user?.cargo &&
      !allowedRoles.includes(user.cargo)
    ) {
      router.push(ROUTES.DENIED);
      return;
    }
  }, [user, isAuthenticated, loading, router, allowedRoles]);

  // Calcula dinamicamente se o acesso é negado
  const isDenied =
    !loading &&
    isAuthenticated &&
    allowedRoles.length > 0 &&
    user?.cargo &&
    !allowedRoles.includes(user.cargo);

  return { user, loading, isAuthenticated, isDenied };
}
