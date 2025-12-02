'use client';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getRedirectRoute } from '@/constants/routes';
import { useRouter } from 'next/navigation'; // ou "next/router" dependendo da sua versão do Next.js
import { FiShield, FiLock, FiArrowLeft, FiAlertTriangle } from 'react-icons/fi';
import Head from 'next/head';

export default function AcessoNegadoPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [countdown, setCountdown] = useState(3);

  // Redireciona automaticamente após a contagem e atualiza contador
  useEffect(() => {
    if (user?.cargo) {
      const interval = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);

      const timer = setTimeout(() => {
        router.push(getRedirectRoute(user.cargo));
      }, 3000);

      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    }
  }, [user, router]);

  const handleGoBack = () => {
    if (user?.cargo) {
      const destination = getRedirectRoute(user.cargo);
      router.push(destination);
    } else {
      router.push('/auth/login');
    }
  };

  return (
    <>
      <Head>
        <title>Acesso Negado | Buffs</title>
      </Head>

      <div className="min-h-screen bg-[#F8FCFA] flex flex-col items-center justify-center p-4 animate-in fade-in duration-500">
        <div className="max-w-md w-full bg-white shadow-sm rounded-xl overflow-hidden border border-[#CE7D0A]/10">
          {/* Header Colorido - Usando tons de alerta mas mantendo suavidade */}
          <div className="bg-red-50 p-8 flex justify-center border-b border-red-100">
            <div className="bg-white p-4 rounded-full shadow-sm border border-red-100">
              <FiShield className="w-12 h-12 text-red-500" />
            </div>
          </div>

          {/* Conteúdo */}
          <div className="p-8 text-center">
            <h1 className="text-2xl font-bold text-[#404040] mb-3">
              Acesso Negado
            </h1>

            <p className="text-[#404040]/70 mb-8 leading-relaxed text-sm">
              Você não possui as permissões necessárias para acessar esta
              página. Caso acredite que isso seja um erro, contate o
              administrador.
              <span className="block mt-3 text-sm text-[#CE7D0A] font-semibold bg-[#CE7D0A]/5 py-1 px-3 rounded-full inline-block">
                Redirecionando em {countdown}s...
              </span>
            </p>

            {/* Card de Informação do Usuário */}
            <div className="bg-[#F8FCFA] rounded-lg p-4 mb-8 border border-[#CE7D0A]/10 flex flex-col items-center gap-2">
              <div className="flex items-center space-x-2 text-sm text-[#404040]/80">
                <FiLock className="w-4 h-4 text-[#CE7D0A]" />
                <span>Cargo atual identificado:</span>
              </div>
              <span className="font-bold text-[#404040] bg-white px-3 py-1 rounded border border-gray-100 shadow-sm text-sm">
                {user?.cargo || 'Visitante / Desconhecido'}
              </span>
            </div>

            {/* Botão de Ação - Estilo "Buffs" (Amarelo/Laranja) */}
            <button
              onClick={handleGoBack}
              className="w-full inline-flex items-center justify-center px-4 py-3 bg-[#FFCF78] hover:bg-[#F2B84D] text-[#404040] font-bold rounded-lg transition-colors focus:ring-4 focus:ring-[#FFCF78]/30 focus:outline-none"
            >
              <FiArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao meu Dashboard
            </button>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-[#404040]/40">
          &copy; {new Date().getFullYear()} Buffs Sistema de Gestão. Todos os
          direitos reservados.
        </p>
      </div>
    </>
  );
}
