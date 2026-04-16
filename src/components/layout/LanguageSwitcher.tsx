'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { routing } from '@/i18n/routing';
import { useState, useRef, useEffect } from 'react';
import { Globe } from 'lucide-react';

// Mapa de labels para cada locale
const localeLabels: Record<string, { flag: string; label: string }> = {
  pt: { flag: '🇧🇷', label: 'Português' },
  en: { flag: '🇺🇸', label: 'English' },
};

interface LanguageSwitcherProps {
  /** Variante visual: 'icon' mostra só o globo (para Header), 'pill' mostra bandeira + sigla (para Login) */
  variant?: 'icon' | 'pill';
}

export default function LanguageSwitcher({ variant = 'icon' }: LanguageSwitcherProps) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Fecha ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLocaleChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale as any });
    setIsOpen(false);
  };

  const current = localeLabels[locale] || localeLabels.pt;

  return (
    <div className="relative" ref={ref}>
      {/* Botão de trigger */}
      {variant === 'icon' ? (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`p-2 rounded-full transition-colors text-[#404040]/70 ${
            isOpen
              ? 'bg-[#f8fcfa] text-[#ce7d0a]'
              : 'hover:bg-[#f8fcfa] hover:text-[#ce7d0a]'
          }`}
          title="Language"
        >
          <Globe size={18} />
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#b0b0b0]/30 bg-white text-xs font-medium text-[#404040] hover:border-[#ffcf78] hover:bg-[#fffcf5] transition-all"
        >
          <span className="text-sm leading-none">{current.flag}</span>
          <span className="uppercase">{locale}</span>
          <svg
            className={`w-3 h-3 text-[#838181] transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
          </svg>
        </button>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl shadow-xl border border-[#ce7d0a]/10 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {routing.locales.map((loc) => {
            const item = localeLabels[loc] || { flag: '🌐', label: loc };
            const isActive = locale === loc;

            return (
              <button
                key={loc}
                onClick={() => handleLocaleChange(loc)}
                className={`flex items-center gap-3 w-full px-4 py-2.5 text-left text-sm transition-colors ${
                  isActive
                    ? 'bg-[#fffcf5] text-[#ce7d0a] font-semibold'
                    : 'text-[#404040] hover:bg-[#f8fcfa]'
                }`}
              >
                <span className="text-base leading-none">{item.flag}</span>
                <span>{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#ce7d0a]" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
