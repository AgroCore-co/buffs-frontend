import React, { forwardRef, ButtonHTMLAttributes } from 'react';
import { LucideIcon } from 'lucide-react';

// ==========================================
// Tipagens compartilhadas
// ==========================================
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonBaseProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

// ==========================================
// Dicionários de Estilos (Tailwind)
// ==========================================
const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-[#ce7d0a] text-white hover:bg-[#b06a08] focus:ring-[#ce7d0a]/50 border border-transparent',
  secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-slate-500/30 border border-transparent',
  outline: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 focus:ring-slate-500/30',
  danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500/50 border border-transparent',
  ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-500/30 border border-transparent',
};

const buttonSizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

const iconButtonSizeStyles: Record<ButtonSize, string> = {
  sm: 'p-1.5',
  md: 'p-2',
  lg: 'p-3',
};

const iconSizes: Record<ButtonSize, number> = {
  sm: 16,
  md: 20,
  lg: 24,
};

// ==========================================
// Componente: Button
// ==========================================
export interface ButtonProps extends ButtonBaseProps {
  icon?: LucideIcon | React.ElementType;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      icon: Icon,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`
          inline-flex items-center justify-center gap-2 font-medium rounded-lg
          transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1
          disabled:opacity-60 disabled:cursor-not-allowed
          ${variantStyles[variant]}
          ${buttonSizeStyles[size]}
          ${className}
        `}
        {...props}
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          Icon && <Icon size={iconSizes[size]} />
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

// ==========================================
// Componente: IconButton
// ==========================================
export interface IconButtonProps extends ButtonBaseProps {
  icon: LucideIcon | React.ElementType;
  'aria-label': string; // Obrigatório para acessibilidade já que não tem texto
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      variant = 'ghost',
      size = 'md',
      isLoading = false,
      icon: Icon,
      className = '',
      disabled,
      'aria-label': ariaLabel,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        aria-label={ariaLabel}
        className={`
          inline-flex items-center justify-center rounded-lg
          transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1
          disabled:opacity-60 disabled:cursor-not-allowed
          ${variantStyles[variant]}
          ${iconButtonSizeStyles[size]}
          ${className}
        `}
        {...props}
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <Icon size={iconSizes[size]} />
        )}
      </button>
    );
  }
);
IconButton.displayName = 'IconButton';