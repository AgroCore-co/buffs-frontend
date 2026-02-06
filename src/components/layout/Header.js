'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import {
  HelpCircle,
  Bell,
  LogOut,
  Maximize2,
  Minimize2,
  AlertCircle,
  Info,
  CheckCircle,
  FileText,
  MessageCircle,
  BookOpen,
  Clock,
  BellOff,
} from 'lucide-react';

export default function Header() {
  const router = useRouter();
  const { user, logout } = useAuth();

  // --- ESTADOS ---
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSupport, setShowSupport] = useState(false);

  // Estado para notificações (vazio por enquanto - será integrado com API)
  const [notifications, setNotifications] = useState([]);

  // Refs para fechar ao clicar fora
  const notificationRef = useRef(null);
  const supportRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // --- FUNÇÕES ---

  const getInitials = (name) => {
    if (!name) return 'US';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

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
    function handleClickOutside(event) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
      if (supportRef.current && !supportRef.current.contains(event.target)) {
        setShowSupport(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Renderiza ícone baseado no tipo de notificação
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'urgente':
        return <AlertCircle size={16} className="text-red-500" />;
      case 'aviso':
        return <AlertCircle size={16} className="text-amber-500" />;
      case 'success':
        return <CheckCircle size={16} className="text-green-500" />;
      default:
        return <Info size={16} className="text-blue-500" />;
    }
  };

  return (
    <header className="flex h-16 w-full items-center justify-end border-b border-[#ce7d0a]/10 bg-white px-6 text-sm text-[#404040] shrink-0 z-20 relative">
      {/* Lado Direito: Ações e Ferramentas */}
      <div className="flex items-center gap-4">
        <div className="h-6 w-px bg-[#ce7d0a]/10 mx-1" />

        {/* Ícones de Ação */}
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

            {/* Dropdown de Suporte */}
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
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-[#ce7d0a] border-2 border-white" />
              )}
            </button>

            {/* Dropdown de Notificações */}
            {showNotifications && (
              <div className="absolute right-0 top-full mt-3 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-[#ce7d0a]/10 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-[#f8fcfa]">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-[#404040]">Notificações</h3>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 bg-[#ce7d0a] text-white text-[10px] rounded-full font-bold">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button className="text-xs text-[#ce7d0a] hover:underline font-medium">
                      Marcar lidas
                    </button>
                  )}
                </div>

                <div className="max-h-[320px] overflow-y-auto custom-scrollbar">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer group ${!notif.read ? 'bg-amber-50/30' : ''}`}
                      >
                        <div className="flex gap-3">
                          <div
                            className={`mt-1 p-1.5 rounded-full shrink-0 h-fit ${
                              notif.type === 'urgente'
                                ? 'bg-red-100'
                                : notif.type === 'aviso'
                                  ? 'bg-amber-100'
                                  : notif.type === 'success'
                                    ? 'bg-green-100'
                                    : 'bg-blue-100'
                            }`}
                          >
                            {getNotificationIcon(notif.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-1">
                              <p
                                className={`text-sm font-semibold ${!notif.read ? 'text-gray-900' : 'text-gray-600'}`}
                              >
                                {notif.title}
                              </p>
                              {!notif.read && (
                                <span className="h-2 w-2 rounded-full bg-[#ce7d0a] mt-1.5" />
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mb-2 leading-relaxed">
                              {notif.desc}
                            </p>
                            <div className="flex items-center gap-1 text-[10px] text-gray-400">
                              <Clock size={10} />
                              <span>{notif.time}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    // Empty State
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
                  )}
                </div>

                {notifications.length > 0 && (
                  <button className="w-full py-3 text-center text-xs font-semibold text-gray-500 hover:bg-gray-50 hover:text-[#ce7d0a] border-t border-gray-100 transition-colors">
                    Ver todas as notificações
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Botão de modo fullscreen */}
          <button
            className="p-2 rounded-full hover:bg-[#f8fcfa] hover:text-[#ce7d0a] transition-colors text-[#404040]/70"
            title={isFullscreen ? 'Sair do modo tela cheia' : 'Modo tela cheia'}
            onClick={handleToggleFullscreen}
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>

        {/* Avatar do Usuário */}
        <div className="flex items-center gap-3 pl-2 cursor-pointer group relative">
          <div className="text-right hidden md:block">
            <p className="text-xs font-bold text-[#404040] leading-none">
              {user?.nome || 'Usuário'}
            </p>
            <p className="text-[10px] text-[#ce7d0a] font-medium leading-none mt-1">
              {user?.cargo || 'Admin'}
            </p>
          </div>

          <div className="relative">
            <button className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ffcf78] text-[#404040] shadow-sm border-2 border-white ring-1 ring-[#ce7d0a]/20 group-hover:ring-[#ffcf78] transition-all">
              <span className="text-xs font-bold">
                {user ? getInitials(user.nome) : 'US'}
              </span>
            </button>

            {/* Dropdown Menu Usuário */}
            <div className="absolute right-0 top-full mt-3 w-48 bg-white border border-[#ce7d0a]/10 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right z-50">
              <div className="p-1">
                <button
                  onClick={logout}
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
