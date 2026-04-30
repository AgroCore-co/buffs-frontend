'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import LanguageSwitcher from '@/components/layout/LanguageSwitcher';
import { useTranslations } from 'next-intl';
import { usePropriedades } from '@/hooks/usePropriedades';
import { usePropriedadeStore } from '@/stores/propriedade.store';
import { useAuthStore } from '@/stores/auth.store';
import { useAuth } from '@/hooks/useAuth';
import { Propriedade } from '@/services/propriedades.service';
import {
  HelpCircle,
  Bell,
  LogOut,
  Maximize2,
  Minimize2,
  BookOpen,
  MessageCircle,
  BellOff,
  Building2,
  ChevronDown,
  Check,
} from 'lucide-react';

export default function Header() {
  const router = useRouter();
  const t = useTranslations('Header');

  // --- STORES ---
  const profile = useAuthStore((s) => s.profile);
  const { activeId, activePropriedade, setActivePropriedade } = usePropriedadeStore();

  // Auth hook para logout
  const { logout, isLoggingOut } = useAuth();

  // --- PROPRIEDADES DO SERVIDOR (React Query) ---
  const { propriedades, isLoadingPropriedades } = usePropriedades();

  // Auto-seleção: se o usuário ainda não tem propriedade ativa mas já carregou a lista,
  // seleciona a primeira automaticamente para não deixar o sistema "vazio".
  useEffect(() => {
    if (!activeId && propriedades.length > 0) {
      setActivePropriedade(propriedades[0]);
    }
  }, [activeId, propriedades, setActivePropriedade]);

  // --- ESTADOS DE UI ---
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showSupport, setShowSupport] = useState<boolean>(false);
  const [showPropertySelector, setShowPropertySelector] = useState<boolean>(false);

  // Tipando as referências como elementos HTML Div
  const notificationRef = useRef<HTMLDivElement>(null);
  const supportRef = useRef<HTMLDivElement>(null);
  const propertySelectorRef = useRef<HTMLDivElement>(null);

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

  const handleSelectProperty = (propriedade: Propriedade) => {
    setActivePropriedade(propriedade);
    setShowPropertySelector(false);
  };

  // Fecha dropdowns ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      if (notificationRef.current && !notificationRef.current.contains(target)) {
        setShowNotifications(false);
      }
      if (supportRef.current && !supportRef.current.contains(target)) {
        setShowSupport(false);
      }
      if (propertySelectorRef.current && !propertySelectorRef.current.contains(target)) {
        setShowPropertySelector(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Helper para nome curto do manejo
  const getManejoShort = (tipo?: string) => {
    const map: Record<string, string> = { P: 'PEC', E: 'EXT', I: 'INT' };
    return tipo ? map[tipo] || tipo : '';
  };

  return (
    <header className="flex h-16 w-full items-center justify-between border-b border-[#ce7d0a]/10 bg-white px-6 text-sm text-[#404040] shrink-0 z-20 relative">

      {/* ===== LADO ESQUERDO: SELETOR DE PROPRIEDADE ===== */}
      <div className="relative" ref={propertySelectorRef}>
        <button
          onClick={() => {
            setShowPropertySelector(!showPropertySelector);
            setShowSupport(false);
            setShowNotifications(false);
          }}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border transition-all ${
            showPropertySelector
              ? 'border-[#ffcf78] bg-[#fffcf5] shadow-sm'
              : 'border-[#ce7d0a]/10 hover:border-[#ffcf78] hover:bg-[#fffcf5]'
          }`}
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#ffcf78]/30 text-[#ce7d0a]">
            <Building2 size={14} />
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-bold text-[#404040] leading-none max-w-[160px] truncate">
              {isLoadingPropriedades
                ? t('propertySelector.loading')
                : activePropriedade?.nome || t('propertySelector.select')
              }
            </p>
            {activePropriedade && (
              <p className="text-[10px] text-[#ce7d0a] font-medium leading-none mt-0.5">
                {getManejoShort(activePropriedade.tipoManejo)} • {activePropriedade.pAbcb ? 'ABCB' : 'Padrão'}
              </p>
            )}
          </div>
          <ChevronDown
            size={14}
            className={`text-[#838181] transition-transform ${showPropertySelector ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Dropdown de propriedades */}
        {showPropertySelector && (
          <div className="absolute left-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-[#ce7d0a]/10 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="p-3 bg-[#f8fcfa] border-b border-[#ce7d0a]/10">
              <p className="text-xs font-bold text-[#404040]">{t('propertySelector.select')}</p>
            </div>

            <div className="max-h-[240px] overflow-y-auto custom-scrollbar">
              {isLoadingPropriedades ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-5 h-5 border-2 border-[#ffcf78] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : propriedades.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 px-4">
                  <Building2 size={24} className="text-gray-300 mb-2" />
                  <p className="text-xs text-gray-400">{t('propertySelector.noProperties')}</p>
                </div>
              ) : (
                propriedades.map((prop) => {
                  const isSelected = activeId === prop.idPropriedade;
                  return (
                    <button
                      key={prop.idPropriedade}
                      onClick={() => handleSelectProperty(prop)}
                      className={`flex items-center gap-3 w-full px-4 py-3 text-left transition-colors border-b border-gray-50 last:border-0 ${
                        isSelected
                          ? 'bg-[#fffcf5]'
                          : 'hover:bg-[#f8fcfa]'
                      }`}
                    >
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 ${
                        isSelected
                          ? 'bg-[#ffcf78] text-[#404040]'
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        <Building2 size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold truncate ${
                          isSelected ? 'text-[#ce7d0a]' : 'text-[#404040]'
                        }`}>
                          {prop.nome}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {t('propertySelector.management')}: {getManejoShort(prop.tipoManejo)}
                          {prop.pAbcb && ' • ABCB'}
                        </p>
                      </div>
                      {isSelected && (
                        <Check size={14} className="text-[#ce7d0a] shrink-0" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* ===== LADO DIREITO: AÇÕES ===== */}
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
                setShowPropertySelector(false);
              }}
              title={t('support')}
            >
              <HelpCircle size={18} />
            </button>

            {showSupport && (
              <div className="absolute right-0 top-full mt-3 w-64 bg-white rounded-xl shadow-xl border border-[#ce7d0a]/10 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                <div className="p-4 bg-[#f8fcfa] border-b border-[#ce7d0a]/10">
                  <h3 className="font-bold text-[#404040]">{t('helpCenter')}</h3>
                  <p className="text-xs text-gray-500">{t('helpCenterDesc')}</p>
                </div>
                <div className="p-2">
                  <button
                    onClick={() => {
                      router.push('/suporte/documentacao' as any);
                      setShowSupport(false);
                    }}
                    className="flex items-center gap-3 w-full p-2.5 rounded-lg hover:bg-gray-50 text-left transition-colors group"
                  >
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                      <BookOpen size={16} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-700 text-sm">
                        {t('documentation')}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {t('documentationDesc')}
                      </p>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      router.push('/suporte/chat' as any);
                      setShowSupport(false);
                    }}
                    className="flex items-center gap-3 w-full p-2.5 rounded-lg hover:bg-gray-50 text-left transition-colors group"
                  >
                    <div className="p-2 bg-green-50 text-green-600 rounded-lg group-hover:bg-green-100 transition-colors">
                      <MessageCircle size={16} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-700 text-sm">
                        {t('talkSupport')}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {t('talkSupportDesc')}
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
                setShowPropertySelector(false);
              }}
            >
              <Bell size={18} />
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-full mt-3 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-[#ce7d0a]/10 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-[#f8fcfa]">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-[#404040]">{t('notifications')}</h3>
                  </div>
                </div>

                <div className="max-h-[320px] overflow-y-auto custom-scrollbar">
                  <div className="flex flex-col items-center justify-center py-12 px-4">
                    <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <BellOff size={24} className="text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-sm font-medium">
                      {t('noNotifications')}
                    </p>
                    <p className="text-gray-400 text-xs mt-1 text-center">
                      {t('noNotificationsDesc')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* --- IDIOMA --- */}
          <LanguageSwitcher variant="icon" />

          {/* --- TELA CHEIA --- */}
          <button
            className="p-2 rounded-full hover:bg-[#f8fcfa] hover:text-[#ce7d0a] transition-colors text-[#404040]/70"
            title={isFullscreen ? t('exitFullscreen') : t('fullscreen')}
            onClick={handleToggleFullscreen}
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>

        {/* --- PERFIL DO USUÁRIO --- */}
        <div className="flex items-center gap-3 pl-2 cursor-pointer group relative">
          <div className="text-right hidden md:block">
            <p className="text-xs font-bold text-[#404040] leading-none">
              {profile?.nome || t('user')}
            </p>
            <p className="text-[10px] text-[#ce7d0a] font-medium leading-none mt-1">
              {profile?.cargo || t('admin')}
            </p>
          </div>

          <div className="relative">
            <button className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ffcf78] text-[#404040] shadow-sm border-2 border-white ring-1 ring-[#ce7d0a]/20 group-hover:ring-[#ffcf78] transition-all">
              <span className="text-xs font-bold">
                {profile?.nome ? profile.nome.substring(0, 2).toUpperCase() : 'US'}
              </span>
            </button>

            <div className="absolute right-0 top-full mt-3 w-48 bg-white border border-[#ce7d0a]/10 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right z-50">
              <div className="p-1">
                <button
                  onClick={() => logout()}
                  disabled={isLoggingOut}
                  className={`flex items-center w-full px-3 py-2 text-sm rounded-lg transition-colors ${
                    isLoggingOut
                      ? 'opacity-60 cursor-not-allowed'
                      : 'text-[#404040] hover:bg-red-50 hover:text-red-600'
                  }`}
                >
                  <LogOut size={14} className="mr-2" />
                  {isLoggingOut ? t('loggingOut') ?? 'Saindo...' : t('logout')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}