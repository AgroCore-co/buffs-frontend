"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { usePathname } from "next/navigation"; // CORREÇÃO: Usar next/navigation no App Router
import {
  Home,
  Building2,
  PawPrint,
  Milk,
  CalendarCheck2,
  Factory,
  Columns,
} from "lucide-react";

// Função utilitária para normalizar strings (remove acentos e deixa minúsculo)
const normalize = (str) =>
  str ? str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "";

// Função para gerar rotas dinâmicas conforme cargo
function getRoute(cargo, path) {
  const cargoLimpo = normalize(cargo);
  
  // Se não tiver cargo (ainda carregando), retorna apenas o path base ou um link neutro
  if (!cargoLimpo) return "#"; 

  // Mapeamento de prefixos por cargo
  if (cargoLimpo === "proprietario") {
    return `/proprietario${path}`;
  }
  
  if (cargoLimpo === "admin") {
    return `/admin${path}`;
  }

  // Se for funcionário ou outro cargo que usa a rota base, retorna o path original
  return path || "/";
}

export default function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const pathname = usePathname(); // Hook correto para pegar rota atual
  const { user, loading } = useAuth(); // Pegue o loading do contexto

  // Garante que o cargo só é lido se o user existir, senão fica vazio para evitar rotas erradas
  const cargo = user?.cargo || ""; 

  const menuItems = [
    {
      section: "main",
      items: [
        { icon: Home, label: "Dashboard", href: getRoute(cargo, "") }, // Rota vazia vira /proprietario
      ],
    },
    {
      section: "propriedades",
      items: [
        { icon: Building2, label: "Propriedades", href: getRoute(cargo, "/propriedades") },
      ],
    },
    {
      section: "rebanho",
      items: [
        { icon: PawPrint, label: "Rebanho", href: getRoute(cargo, "/rebanho") },
      ],
    },
    {
      section: "lactacao",
      items: [
        { icon: Milk, label: "Lactação", href: getRoute(cargo, "/lactacao") },
      ],
    },
    {
      section: "controle",
      items: [
        { icon: CalendarCheck2, label: "Controle Reprodução", href: getRoute(cargo, "/controle-reproducao") },
      ],
    },
    {
      section: "industria",
      items: [
        { icon: Factory, label: "Indústria", href: getRoute(cargo, "/industria") },
      ],
    },
  ];

  // Se estiver carregando o usuário, você pode optar por renderizar um esqueleto ou nada
  // Aqui deixei renderizar, mas os links ficarão como "#" até carregar
  
  return (
    <aside
      className={`
        relative flex flex-col border-r border-[#ce7d0a]/10 bg-white 
        transition-all duration-300 ease-in-out z-20 text-[#404040] shadow-[4px_0_24px_-12px_rgba(0,0,0,0.05)]
        ${isExpanded ? "w-64" : "w-16"}
      `}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Logo / Brand Area */}
      <div className="flex h-16 items-center justify-center border-b border-[#ce7d0a]/10 shrink-0 bg-[#f8fcfa]">
        <div className="h-7 w-7 rounded-lg bg-[#ffcf78] shrink-0 shadow-sm flex items-center justify-center text-[#404040]">
           <span className="font-bold text-xs">B</span>
        </div>
        <span
          className={`
             ml-3 font-bold text-sm text-[#404040] transition-all duration-200 tracking-tight
             ${isExpanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 hidden"}
           `}
        >
          BUFFS System
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 custom-scrollbar">
        {menuItems.map((group, groupIndex) => (
          <div key={groupIndex}>
            {groupIndex > 0 && (
              <div className="mx-4 my-2 border-t border-[#ce7d0a]/10" />
            )}
            {isExpanded && (
               <div className="px-4 py-1 text-[10px] uppercase tracking-wider font-semibold text-[#ce7d0a]/70">
                 {group.section}
               </div>
            )}
            <ul className="flex flex-col gap-1 px-2">
              {group.items.map((item, itemIndex) => {
                // Verificação de rota ativa atualizada para usar pathname
                // Verifica se item.href não é "#" e se o pathname começa com ele
                const isActive = item.href !== "#" && pathname === item.href;
                
                return (
                  <li key={itemIndex}>
                    <Link
                      href={item.href}
                      className={`
                        group flex h-10 items-center rounded-md px-2 text-sm font-medium transition-all duration-200
                        ${
                          isActive
                            ? "bg-[#ffcf78] text-[#404040] shadow-sm font-semibold" 
                            : "text-[#404040]/80 hover:bg-[#f8fcfa] hover:text-[#ce7d0a]"
                        }
                      `}
                    >
                      <div className="flex min-w-[24px] items-center justify-center">
                        <item.icon
                          size={18}
                          className={`transition-colors duration-200 ${
                            isActive
                              ? "text-[#404040]"
                              : "text-[#404040]/60 group-hover:text-[#ce7d0a]"
                          }`}
                        />
                      </div>
                      <span
                        className={`
                          ml-3 whitespace-nowrap transition-all duration-300
                          ${
                            isExpanded
                              ? "opacity-100 translate-x-0"
                              : "opacity-0 -translate-x-2 hidden"
                          }
                        `}
                      >
                        {item.label}
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

      {/* Footer / Layout Options */}
      <div className="border-t border-[#ce7d0a]/10 p-2 shrink-0 bg-[#f8fcfa]">
        <button className="group flex h-10 w-full items-center rounded-md px-2 text-[#404040]/70 hover:bg-white hover:text-[#ce7d0a] hover:shadow-sm transition-all border border-transparent hover:border-[#ce7d0a]/10">
          <div className="flex min-w-[24px] items-center justify-center">
            <Columns size={18} />
          </div>
          <span
            className={`
                ml-3 whitespace-nowrap text-sm font-medium transition-all duration-300
                ${
                  isExpanded
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-2 hidden"
                }
              `}
          >
            Layout Options
          </span>
        </button>
      </div>

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