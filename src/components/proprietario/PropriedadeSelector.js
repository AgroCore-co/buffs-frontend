'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { usePropriedade } from '@/contexts/PropriedadeContext';
import { FiChevronDown, FiCheck, FiPlus } from 'react-icons/fi';
import { Building2 } from 'lucide-react';

export default function PropriedadeSelector() {
  const router = useRouter();
  const {
    propriedades,
    loading,
    propriedadeSelecionada,
    selecionarPropriedade,
  } = usePropriedade();
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const dropdownRef = useRef(null);
  const hoverTimeoutRef = useRef(null);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    // Delay de 150ms antes de expandir
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(true);
    }, 150);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    // Delay de 300ms antes de recolher
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 300);
  };

  // Fecha ao clicar fora
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Determina propriedade ativa pela URL se não estiver setada no contexto
  useEffect(() => {
    if (router.query.propriedade && propriedades.length > 0) {
      const currentId = router.query.propriedade;
      if (
        (propriedadeSelecionada?.idPropriedade ||
          propriedadeSelecionada?.id_propriedade) !== currentId
      ) {
        selecionarPropriedade(currentId);
      }
    }
  }, [
    router.query.propriedade,
    propriedades,
    propriedadeSelecionada,
    selecionarPropriedade,
  ]);

  const handleSelect = (prop) => {
    const id = prop.idPropriedade || prop.id_propriedade;
    selecionarPropriedade(id);
    setIsOpen(false);
  };

  const currentLabel =
    propriedadeSelecionada?.nome || 'Selecione uma propriedade';

  // Pega as iniciais da propriedade (ex: "Fazenda Buffs" -> "FB")
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .slice(0, 2)
      .map((word) => word[0])
      .join('')
      .toUpperCase();
  };

  const isExpanded = isOpen || isHovered;

  // Ocultar seletor nas telas de listagem e detalhes da propriedade e detalhes do prontuário
  const hiddenRoutes = [
    '/proprietario/propriedades',
    '/proprietario/propriedade/[propriedade]',
    '/proprietario/rebanho/[prontuario]',
  ];
  if (hiddenRoutes.includes(router.pathname)) {
    return null;
  }

  if (loading) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <div className="h-12 w-12 bg-gray-100 animate-pulse rounded-full" />
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50" ref={dropdownRef}>
      {/* Dropdown de propriedades */}
      {isOpen && (
        <div className="absolute bottom-full right-0 mb-3 w-72 bg-white rounded-xl shadow-2xl border border-[#ce7d0a]/20 overflow-hidden">
          <div className="p-3 border-b border-[#ce7d0a]/10 bg-[#f8fcfa]">
            <p className="text-xs font-bold text-[#ce7d0a] uppercase tracking-wider">
              Minhas Propriedades
            </p>
          </div>

          <div className="max-h-64 overflow-y-auto custom-scrollbar p-1">
            {propriedades.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-gray-500">
                  Nenhuma propriedade encontrada.
                </p>
              </div>
            ) : (
              propriedades.map((prop) => {
                const id = prop.idPropriedade || prop.id_propriedade;
                const isSelected =
                  (propriedadeSelecionada?.idPropriedade ||
                    propriedadeSelecionada?.id_propriedade) === id;

                return (
                  <button
                    key={id}
                    onClick={() => handleSelect(prop)}
                    className={`
                      w-full flex items-center justify-between px-3 py-3 rounded-lg text-sm transition-all border border-transparent
                      ${
                        isSelected
                          ? 'bg-[#ffcf78]/20 text-[#ce7d0a] font-bold border-[#ce7d0a]/10'
                          : 'text-[#404040] hover:bg-gray-50 hover:pl-4'
                      }
                    `}
                  >
                    <span className="truncate text-left">{prop.nome}</span>
                    {isSelected && <FiCheck className="w-4 h-4 shrink-0" />}
                  </button>
                );
              })
            )}
          </div>

          <div className="p-2 border-t border-[#ce7d0a]/10 bg-gray-50">
            <button
              onClick={() => router.push('/proprietario/propriedades')}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold text-[#404040] hover:bg-white hover:text-[#ce7d0a] hover:shadow-sm border border-transparent hover:border-[#ce7d0a]/10 transition-all uppercase tracking-wide"
            >
              <FiPlus className="w-3 h-3" />
              Gerenciar Propriedades
            </button>
          </div>
        </div>
      )}

      {/* Botão - Minimizado ou Expandido */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`
          flex items-center bg-white border border-[#ce7d0a]/20
          shadow-lg hover:shadow-xl rounded-full
          ${isExpanded ? 'gap-3 pl-3 pr-5 py-2' : 'w-12 h-12 justify-center'}
          ${isOpen ? 'ring-2 ring-[#ce7d0a]/20' : ''}
        `}
        style={{
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white"
          style={{
            backgroundColor: isExpanded ? '#ce7d0a' : '#404040',
            transition: 'background-color 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <Building2 size={18} />
        </div>

        {/* Conteúdo expandido */}
        <div
          style={{
            overflow: 'hidden',
            opacity: isExpanded ? 1 : 0,
            maxWidth: isExpanded ? '180px' : '0px',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-none mb-1 whitespace-nowrap">
            Propriedade Atual
          </p>
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-[#404040] leading-none max-w-[130px] truncate">
              {currentLabel}
            </p>
            <FiChevronDown
              className="w-4 h-4 text-gray-400 flex-shrink-0"
              style={{
                transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            />
          </div>
        </div>
      </button>
    </div>
  );
}
