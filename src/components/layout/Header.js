'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Search,
  HelpCircle,
  Bell,
  TerminalSquare,
  Slash,
  Box,
  Hexagon,
  Plug,
  Command,
  LogOut,
  ChevronDown,
  Maximize2,
  Minimize2,
} from 'lucide-react';

export default function Header() {
  const { user, logout } = useAuth();

  const getInitials = (name) => {
    if (!name) return 'US';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Estado para fullscreen
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  // Função para alternar fullscreen
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <header className="flex h-16 w-full items-center justify-end border-b border-[#ce7d0a]/10 bg-white px-6 text-sm text-[#404040] shrink-0 z-10">
      {/* Lado Esquerdo removido, conteúdo agora só à direita */}

      {/* Lado Direito: Ações e Ferramentas */}
      <div className="flex items-center gap-4">
        <div className="h-6 w-px bg-[#ce7d0a]/10 mx-1" />

        {/* Lado Esquerdo: Breadcrumbs e Info do Projeto */}
        {/* <div className="flex items-center gap-3">
        <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-[#f8fcfa] border border-[#ce7d0a]/20 text-[#ce7d0a]">
          <Hexagon size={18} />
        </div>

        <div className="flex flex-col leading-tight">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#404040]">AgroCore</span>
            <Slash className="h-3 w-3 text-[#ce7d0a]/30" strokeWidth={3} />
            <span className="font-medium text-[#404040]/80">BUFFS</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] text-[#ce7d0a] bg-[#ffcf78]/20 px-1.5 py-0.5 rounded font-semibold uppercase tracking-wide">
              Production
            </span>
            <span className="text-[10px] text-gray-400">v2.4.0</span>
          </div>
        </div>
      </div> */}

        {/* Ícones de Ação */}
        <div className="flex items-center gap-1 text-[#404040]">
          <button className="p-2 rounded-full hover:bg-[#f8fcfa] hover:text-[#ce7d0a] transition-colors text-[#404040]/70">
            <HelpCircle size={18} />
          </button>

          <button className="relative p-2 rounded-full hover:bg-[#f8fcfa] hover:text-[#ce7d0a] transition-colors text-[#404040]/70">
            <Bell size={18} />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#ce7d0a] border-2 border-white" />
          </button>

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
        <div className="flex items-center gap-3 pl-2 cursor-pointer group">
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
            {/* Dropdown Menu (Simplificado para o exemplo) */}
            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-[#ce7d0a]/10 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right z-50">
              <div className="p-1">
                <button
                  onClick={logout}
                  className="flex items-center w-full px-3 py-2 text-sm text-[#404040] rounded hover:bg-[#f8fcfa] hover:text-[#ce7d0a]"
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
