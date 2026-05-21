import React, { useEffect, useRef, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import FocusTrap from 'focus-trap-react';
import { Button } from './Button';

// 1. Tipagem dos tamanhos aceitos
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | 'full';

// 2. Definição da Interface do Componente
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: ModalSize;
}

// 3. Componente Modal Reutilizável
export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Mapeamento de tamanhos para classes do Tailwind
  const sizes: Record<ModalSize, string> = {
    sm: 'max-w-sm',       // ~384px
    md: 'max-w-lg',       // ~512px (Padrão)
    lg: 'max-w-2xl',      // ~672px
    xl: 'max-w-4xl',      // ~896px
    '2xl': 'max-w-5xl',   // ~1024px
    '3xl': 'max-w-6xl',   // ~1152px
    '4xl': 'max-w-7xl',   // ~1280px
    full: 'max-w-[95vw]', // Quase tela cheia
  };

  // Fecha o modal ao pressionar ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
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

  // Fecha o modal ao clicar fora do conteúdo (no backdrop)
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop com Blur e Fade */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Painel do Modal */}
      <FocusTrap
        focusTrapOptions={{
          returnFocusOnDeactivate: true,
          escapeDeactivates: false,
          fallbackFocus: () => modalRef.current!,
        }}
      >
      <div
        ref={modalRef}
        tabIndex={-1}
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
        {(title || description) && (
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
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 focus:ring-[#ffcf78] focus:ring-offset-2"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        )}

        {/* Body (Com scroll nativo se necessário) */}
        <div className="p-6 overflow-y-auto">
          {children}
        </div>

        {/* Footer (Opcional) */}
        {footer && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 rounded-b-xl flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
      </FocusTrap>
    </div>
  );

  // Renderiza via Portal para evitar problemas de z-index no DOM da aplicação
  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }
  return null;
}


