import React, { forwardRef, useId } from 'react';

/**
 * Componente Input reutilizável
 * @param {string} label - Label do campo
 * @param {string} error - Mensagem de erro
 * @param {string} hint - Texto de ajuda
 * @param {string} className - Classes adicionais
 * @param {boolean} required - Se é obrigatório
 */
const Input = forwardRef(
  (
    {
      label,
      error,
      hint,
      className = '',
      required = false,
      type = 'text',
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
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={`
            w-full px-3 py-2 
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
        {hint && !error && (
          <p className="mt-1 text-xs text-slate-400">{hint}</p>
        )}
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
