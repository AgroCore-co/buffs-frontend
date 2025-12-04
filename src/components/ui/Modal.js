import React, { useEffect, useRef } from 'react';
import Button from './Button';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

/**
 * Componente Modal Reutilizável
 * * @param {boolean} isOpen - Controla a visibilidade
 * @param {function} onClose - Função disparada ao fechar
 * @param {string} title - Título do modal
 * @param {string} description - Descrição auxiliar (opcional)
 * @param {node} children - Conteúdo principal
 * @param {node} footer - Conteúdo do rodapé (botões de ação)
 * @param {string} size - Largura: 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', 'full'
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
}) {
  const modalRef = useRef(null);

  // Mapeamento de tamanhos expandido para permitir modais maiores
  const sizes = {
    sm: 'max-w-sm', // ~384px
    md: 'max-w-lg', // ~512px (Padrão)
    lg: 'max-w-2xl', // ~672px
    xl: 'max-w-4xl', // ~896px
    '2xl': 'max-w-5xl', // ~1024px (Novo)
    '3xl': 'max-w-6xl', // ~1152px (Novo)
    '4xl': 'max-w-7xl', // ~1280px (Novo)
    full: 'max-w-[95vw]', // Quase tela cheia
  };

  // Fecha ao pressionar ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  // Renderiza via Portal para garantir que o modal fique acima de tudo (z-index)
  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop com Blur e Fade */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Painel do Modal */}
      <div
        ref={modalRef}
        className={`
          relative w-full ${sizes[size] || sizes.md}
          bg-white rounded-xl shadow-2xl 
          border border-slate-200
          flex flex-col max-h-[90vh]
          transform transition-all animate-in fade-in zoom-in-95 duration-200 slide-in-from-bottom-4
        `}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-slate-100">
          <div className="pr-4">
            {title && (
              <h3 className="text-lg font-bold text-slate-800 leading-6">
                {title}
              </h3>
            )}
            {description && (
              <p className="mt-1 text-sm text-slate-500">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:text-slate-500 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
          >
            <span className="sr-only">Fechar</span>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body (Com scroll se necessário) */}
        <div className="p-6 overflow-y-auto custom-scrollbar">{children}</div>

        {/* Footer (Opcional) */}
        {footer && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 rounded-b-xl flex justify-end gap-3">
            {/* Se o footer for uma função, injeta o Button padrão */}
            {typeof footer === 'function' ? footer({ Button }) : footer}
          </div>
        )}
      </div>
    </div>
  );

  // Verifica se estamos no navegador para usar o Portal
  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }
  return null;
}
