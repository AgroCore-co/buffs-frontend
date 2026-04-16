import React, { forwardRef, useId, InputHTMLAttributes } from 'react';

export type CheckboxProps = {
  label?: string;
  error?: string;
  hint?: string;
  className?: string;
  required?: boolean;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'>;

/**
 * Componente Checkbox reutilizável
 * @param {string} label - Label do campo
 * @param {string} error - Mensagem de erro
 * @param {string} hint - Texto de ajuda
 * @param {string} className - Classes adicionais
 * @param {boolean} required - Se é obrigatório
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      error,
      hint,
      className = '',
      required = false,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = props.id || props.name || `checkbox-${generatedId}`;

    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          required={required}
          className={`
            rounded border border-[var(--color-border-primary)] text-[var(--color-primary-dark)]
            focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)]
            focus:outline-none focus:ring-2 transition-colors duration-200
            disabled:bg-[var(--color-background-secondary)] disabled:text-[var(--color-text-tertiary)] disabled:cursor-not-allowed
            ${error ? 'border-[var(--color-border-error)] focus:border-[var(--color-border-error)] focus:ring-[var(--color-border-error)]/30' : ''}
          `}
          {...props}
        />
        {label && (
          <label htmlFor={inputId} className="text-sm text-slate-700 select-none">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        {hint && !error && (
          <p className="mt-1 text-xs text-slate-400">{hint}</p>
        )}
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
