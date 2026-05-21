'use client';

import { useState } from 'react';
import { Link, usePathname } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { proprietarioNavigation, type NavSection } from '@/constants/navigation';

export default function Sidebar() {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const pathname = usePathname(); // Já retorna sem o prefixo de locale
  const t = useTranslations('Sidebar');

  const menuItems: NavSection[] = proprietarioNavigation;

  return (
    <aside
      className={`
        relative flex flex-col border-r border-[#ce7d0a]/10 bg-white 
        transition-all duration-300 ease-in-out z-20 text-[#404040] shadow-[4px_0_24px_-12px_rgba(0,0,0,0.05)]
        ${isExpanded ? 'w-64' : 'w-16'}
      `}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Logo / Brand Area */}
      <div className="flex h-16 items-center justify-center border-b border-[#ce7d0a]/10 shrink-0 bg-[#f8fcfa]"></div>

      <nav role="navigation" aria-label="Menu principal" className="flex-1 overflow-y-auto overflow-x-hidden py-4 custom-scrollbar">
        {menuItems.map((group, groupIndex) => (
          <div key={groupIndex}>
            {groupIndex > 0 && (
              <div className="mx-4 my-2 border-t border-[#ce7d0a]/10" />
            )}
            {isExpanded && (
              <div className="px-4 py-1 text-[10px] uppercase tracking-wider font-semibold text-[#ce7d0a]/70">
                {t(group.sectionKey)}
              </div>
            )}
            <ul className="flex flex-col gap-1 px-2">
              {group.items.map((item, itemIndex) => {
                const isActive = item.href !== '#' && pathname === item.href;

                return (
                  <li key={itemIndex}>
                    <Link
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      className={`
                        group flex h-10 items-center rounded-md px-2 text-sm font-medium transition-all duration-200
                        ${
                          isActive
                            ? 'bg-[#ffcf78] text-[#404040] shadow-sm font-semibold'
                            : 'text-[#404040]/80 hover:bg-[#f8fcfa] hover:text-[#ce7d0a]'
                        }
                      `}
                    >
                      <div className="flex min-w-[24px] items-center justify-center">
                        <item.icon
                          size={18}
                          className={`transition-colors duration-200 ${
                            isActive
                              ? 'text-[#404040]'
                              : 'text-[#404040]/60 group-hover:text-[#ce7d0a]'
                          }`}
                        />
                      </div>
                      <span
                        className={`
                          ml-3 whitespace-nowrap transition-all duration-300
                          ${
                            isExpanded
                              ? 'opacity-100 translate-x-0'
                              : 'opacity-0 -translate-x-2 hidden'
                          }
                        `}
                      >
                        {t(item.labelKey)}
                      </span>
                      {isActive && isExpanded && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#ce7d0a]" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e5e5;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #ce7d0a;
        }
      `}</style>
    </aside>
  );
}