'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  HelpCircle,
  Bell,
  LogOut,
  Maximize2,
  Minimize2,
  BookOpen,
  MessageCircle,
  BellOff,
} from 'lucide-react';

export default function Header() {
  const router = useRouter();

  // --- ESTADOS DE UI ---
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showSupport, setShowSupport] = useState<boolean>(false);

  // Tipando as referências como elementos HTML Div
  const notificationRef = useRef<HTMLDivElement>(null);
  const supportRef = useRef<HTMLDivElement>(null);

  // --- FUNÇÕES DE UI ---
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Fecha dropdowns ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // O event.target precisa ser tratado como Node para a função .contains()
      const target = event.target as Node;

      if (
        notificationRef.current &&
        !notificationRef.current.contains(target)
      ) {
        setShowNotifications(false);
      }
      if (supportRef.current && !supportRef.current.contains(target)) {
        setShowSupport(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="flex h-16 w-full items-center justify-end border-b border-[#ce7d0a]/10 bg-white px-6 text-sm text-[#404040] shrink-0 z-20 relative">
      <div className="flex items-center gap-4">
        <div className="h-6 w-px bg-[#ce7d0a]/10 mx-1" />

        <div className="flex items-center gap-2 text-[#404040]">
          {/* --- SUPORTE --- */}
          <div className="relative" ref={supportRef}>
            <button
              className={`p-2 rounded-full transition-colors text-[#404040]/70 ${showSupport ? 'bg-[#f8fcfa] text-[#ce7d0a]' : 'hover:bg-[#f8fcfa] hover:text-[#ce7d0a]'}`}
              onClick={() => {
                setShowSupport(!showSupport);
                setShowNotifications(false);
              }}
              title="Suporte e Ajuda"
            >
              <HelpCircle size={18} />
            </button>

            {showSupport && (
              <div className="absolute right-0 top-full mt-3 w-64 bg-white rounded-xl shadow-xl border border-[#ce7d0a]/10 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                <div className="p-4 bg-[#f8fcfa] border-b border-[#ce7d0a]/10">
                  <h3 className="font-bold text-[#404040]">Central de Ajuda</h3>
                  <p className="text-xs text-gray-500">Como podemos ajudar?</p>
                </div>
                <div className="p-2">
                  <button
                    onClick={() => {
                      router.push('/suporte/documentacao');
                      setShowSupport(false);
                    }}
                    className="flex items-center gap-3 w-full p-2.5 rounded-lg hover:bg-gray-50 text-left transition-colors group"
                  >
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                      <BookOpen size={16} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-700 text-sm">
                        Documentação
                      </p>
                      <p className="text-[10px] text-gray-400">
                        Guia do sistema
                      </p>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      router.push('/suporte/chat');
                      setShowSupport(false);
                    }}
                    className="flex items-center gap-3 w-full p-2.5 rounded-lg hover:bg-gray-50 text-left transition-colors group"
                  >
                    <div className="p-2 bg-green-50 text-green-600 rounded-lg group-hover:bg-green-100 transition-colors">
                      <MessageCircle size={16} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-700 text-sm">
                        Falar com Suporte
                      </p>
                      <p className="text-[10px] text-gray-400">
                        Chat em tempo real
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* --- NOTIFICAÇÕES --- */}
          <div className="relative" ref={notificationRef}>
            <button
              className={`relative p-2 rounded-full transition-colors text-[#404040]/70 ${showNotifications ? 'bg-[#f8fcfa] text-[#ce7d0a]' : 'hover:bg-[#f8fcfa] hover:text-[#ce7d0a]'}`}
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowSupport(false);
              }}
            >
              <Bell size={18} />
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-full mt-3 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-[#ce7d0a]/10 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-[#f8fcfa]">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-[#404040]">Notificações</h3>
                  </div>
                </div>

                <div className="max-h-[320px] overflow-y-auto custom-scrollbar">
                  <div className="flex flex-col items-center justify-center py-12 px-4">
                    <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <BellOff size={24} className="text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-sm font-medium">
                      Nenhuma notificação
                    </p>
                    <p className="text-gray-400 text-xs mt-1 text-center">
                      Você será notificado sobre eventos importantes
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* --- TELA CHEIA --- */}
          <button
            className="p-2 rounded-full hover:bg-[#f8fcfa] hover:text-[#ce7d0a] transition-colors text-[#404040]/70"
            title={isFullscreen ? 'Sair do modo tela cheia' : 'Modo tela cheia'}
            onClick={handleToggleFullscreen}
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>

        {/* --- PERFIL DO USUÁRIO --- */}
        <div className="flex items-center gap-3 pl-2 cursor-pointer group relative">
          <div className="text-right hidden md:block">
            <p className="text-xs font-bold text-[#404040] leading-none">
              Usuário
            </p>
            <p className="text-[10px] text-[#ce7d0a] font-medium leading-none mt-1">
              Admin
            </p>
          </div>

          <div className="relative">
            <button className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ffcf78] text-[#404040] shadow-sm border-2 border-white ring-1 ring-[#ce7d0a]/20 group-hover:ring-[#ffcf78] transition-all">
              <span className="text-xs font-bold">
                US
              </span>
            </button>

            <div className="absolute right-0 top-full mt-3 w-48 bg-white border border-[#ce7d0a]/10 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right z-50">
              <div className="p-1">
                <button
                  onClick={() => router.push('/login')}
                  className="flex items-center w-full px-3 py-2 text-sm text-[#404040] rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <LogOut size={14} className="mr-2" /> Sair
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}