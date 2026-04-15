'use client';

import React from 'react';
// Ajuste os caminhos de importação se necessário
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

// --- TIPAGENS ---
interface BuffsLayoutProps {
  children: React.ReactNode;
}

export default function BuffsLayout({ children }: BuffsLayoutProps) {
  return (
    <div className="flex h-screen w-full bg-[#f8fcfa] text-[#404040] font-sans">
      <Sidebar />

      {/* Wrapper flex para garantir altura e largura máximas */}
      <div className="flex flex-1 flex-col min-w-0 min-h-0 relative">
        <Header />

        {/* main ocupa todo o espaço restante, sem overflow */}
        <main className="flex-1 min-h-0 min-w-0 p-0 scrollbar-thin scrollbar-track-transparent overflow-auto flex flex-col">
          <div className="flex-1 flex flex-col mx-auto mt-6 mb-6 ml-6 mr-6 min-h-0 min-w-0">
            {children || (
              /* Conteúdo Placeholder Ajustado para Contraste */
              <div className="flex-1 rounded-2xl border-2 border-dashed border-[#ce7d0a]/10 bg-white/50 p-12 text-center flex flex-col items-center justify-center hover:bg-white/80 hover:border-[#ce7d0a]/20 transition-all">
                <div className="h-16 w-16 bg-[#ffcf78]/20 rounded-full flex items-center justify-center mb-4 text-[#ce7d0a]">
                  <div className="h-8 w-8 rounded bg-[#ffcf78] animate-pulse" />
                </div>
                <h2 className="text-xl font-bold text-[#404040]">
                  Área de Conteúdo
                </h2>
                <p className="text-[#404040]/60 mt-2 max-w-md">
                  Selecione um item no menu lateral para começar ou adicione
                  componentes aqui.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      <style jsx global>{`
        /* Scrollbar Refinada */
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #d4d4d8; 
          border-radius: 10px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #ce7d0a; 
        }
      `}</style>
    </div>
  );
}