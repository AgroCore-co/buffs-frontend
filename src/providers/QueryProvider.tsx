"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Instanciamos o QueryClient dentro do useState para garantir que 
  // ele não seja recriado a cada renderização do componente, 
  // e também para evitar o vazamento de cache entre usuários no SSR do Next.js.
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Opções globais: evita que a tela fique fazendo requisições 
        // repetidas caso o usuário mude de aba e volte.
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}