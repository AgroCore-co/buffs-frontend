import React, { forwardRef, useId } from 'react';
import { FiChevronDown } from 'react-icons/fi';

/**
 * Componente Select reutilizável
 * @param {string} label - Label do campo
 * @param {string} error - Mensagem de erro
 * @param {string} hint - Texto de ajuda
 * @param {Array} options - Array de opções [{value, label}]
 * @param {string} placeholder - Placeholder
 * @param {string} className - Classes adicionais
 * @param {boolean} required - Se é obrigatório
 */
const Select = forwardRef(
  (
    {
      label,
      error,
      hint,
      options = [],
      placeholder = 'Selecione...',
      className = '',
      required = false,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const selectId = props.id || props.name || `select-${generatedId}`;

    return (
      <div className={`w-full ${className}`}>
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={`
              w-full px-3 py-2 pr-10
              bg-white border rounded-lg
              text-slate-700 text-sm
              appearance-none cursor-pointer
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-[#ce7d0a]/30 focus:border-[#ce7d0a]
              disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed
              ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500/30' : 'border-slate-200 hover:border-slate-300'}
              ${!props.value ? 'text-slate-400' : ''}
            `}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
        {hint && !error && (
          <p className="mt-1 text-xs text-slate-400">{hint}</p>
        )}
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
