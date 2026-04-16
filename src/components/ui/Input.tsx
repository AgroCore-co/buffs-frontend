
import React, { forwardRef, useId, InputHTMLAttributes } from 'react';
import { LucideIcon } from 'lucide-react';

export type InputProps = {
  label?: string;
  error?: string;
  hint?: string;
  className?: string;
  required?: boolean;
  icon?: LucideIcon | React.ElementType;
  rightIcon?: LucideIcon | React.ElementType;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>;

/**
 * Componente Input reutilizável
 * @param {string} label - Label do campo
 * @param {string} error - Mensagem de erro
 * @param {string} hint - Texto de ajuda
 * @param {string} className - Classes adicionais
 * @param {boolean} required - Se é obrigatório
 */

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      className = '',
      required = false,
      type = 'text',
      icon: Icon,
      rightIcon: RightIcon,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = props.id || props.name || `input-${generatedId}`;

    return (
      <div className={`w-full ${className}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {Icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <Icon className="w-4 h-4" />
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            type={type}
            className={`
              w-full px-3 py-2
              ${Icon ? 'pl-10' : ''}
              ${RightIcon ? 'pr-10' : ''}
              bg-white border rounded-lg
              text-slate-700 text-sm
              placeholder:text-slate-400
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-[#ce7d0a]/30 focus:border-[#ce7d0a]
              disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed
              ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500/30' : 'border-slate-200 hover:border-slate-300'}
            `}
            {...props}
          />
          {RightIcon && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer">
              <RightIcon className="w-4 h-4" />
            </span>
          )}
        </div>
        {hint && !error && (
          <p className="mt-1 text-xs text-slate-400">{hint}</p>
        )}
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
