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
  const dropdownRef = useRef(null);

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
  // (Ou sincroniza se a URL mudar)
  useEffect(() => {
    if (router.query.propriedade && propriedades.length > 0) {
      const currentId = router.query.propriedade;
      // Se a propriedade selecionada for diferente da URL, atualiza
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
    // NAVEGAÇÃO REMOVIDA: router.push(`/proprietario/propriedade/${id}`);
  };

  const currentLabel =
    propriedadeSelecionada?.nome || 'Selecione uma propriedade';

  // Ocultar seletor nas telas de listagem e detalhes da propriedade e detalhes do prontuário
  // Apenas oculta o componente visual, o contexto e a seleção continuam ativos
  const hiddenRoutes = [
    '/proprietario/propriedades',
    '/proprietario/propriedade/[propriedade]',
    '/proprietario/rebanho/[prontuario]',
  ];
  if (hiddenRoutes.includes(router.pathname)) {
    return null;
  }

  if (loading) {
    return <div className="h-9 w-48 bg-gray-100 animate-pulse rounded-md" />;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50" ref={dropdownRef}>
      {isOpen && (
        <div className="absolute bottom-full right-0 mb-3 w-72 bg-white rounded-xl shadow-2xl border border-[#ce7d0a]/20 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
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

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-3 pl-4 pr-5 py-3 rounded-full shadow-lg transition-all duration-300
          border border-[#ce7d0a]/20 bg-white hover:shadow-xl hover:-translate-y-1
          ${isOpen ? 'ring-2 ring-[#ce7d0a]/20' : ''}
        `}
      >
        <div
          className={`
            p-2 rounded-full text-white transition-colors duration-300
            ${isOpen ? 'bg-[#ce7d0a]' : 'bg-[#404040]'}
        `}
        >
          <Building2 size={20} />
        </div>

        <div className="text-left">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-none mb-1">
            Propriedade Atual
          </p>
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-[#404040] leading-none max-w-[150px] truncate">
              {currentLabel}
            </p>
            <FiChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
            />
          </div>
        </div>
      </button>
    </div>
  );
}
