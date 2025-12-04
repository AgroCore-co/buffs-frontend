import React from 'react';
import { Filter, X, ChevronDown, Search } from 'lucide-react';

/**
 * Container principal para a barra de filtros.
 * @param {string} label - Texto do rótulo (padrão: "Filtros:")
 * @param {function} onClear - Função para limpar todos os filtros (opcional)
 */
export function FilterBar({
  children,
  label = 'Filtros:',
  className = '',
  onClear,
}) {
  return (
    <div
      className={`bg-slate-50 border border-slate-200/60 rounded-xl p-3 mb-6 flex flex-wrap gap-3 items-center shadow-sm ${className}`}
    >
      <div className="flex items-center gap-2 mr-1 pl-1">
        <div className="p-1.5 bg-white border border-slate-200 rounded-md shadow-sm">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
        </div>
        <span className="font-semibold text-slate-700 text-sm uppercase tracking-wide text-[11px]">
          {label}
        </span>
      </div>

      {/* Área de Filtros */}
      <div className="flex-1 flex flex-wrap gap-3 items-center">{children}</div>

      {/* Botão de Limpar (só aparece se a prop onClear for passada) */}
      {onClear && (
        <button
          onClick={onClear}
          className="ml-auto text-xs font-medium text-slate-400 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all duration-200 group"
        >
          <X className="w-3.5 h-3.5 transition-transform group-hover:rotate-90" />
          <span>Limpar</span>
        </button>
      )}
    </div>
  );
}

/**
 * Input de texto/data estilizado para a barra de filtros.
 * @param {icon} icon - Componente de ícone (ex: Search) para o lado esquerdo
 */
export function FilterInput({ className = '', icon: Icon = Search, ...props }) {
  return (
    <div className="relative group">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-4 w-4 text-slate-400 group-focus-within:text-[#ce7d0a] transition-colors" />
        </div>
      )}
      <input
        className={`
          h-9 pl-9 pr-3 w-full sm:w-auto
          border border-slate-200 rounded-lg text-sm bg-white text-slate-700
          placeholder:text-slate-400
          focus:outline-none focus:ring-2 focus:ring-[#ce7d0a]/20 focus:border-[#ce7d0a]
          hover:border-slate-300
          transition-all duration-200
          shadow-sm
          ${className}
        `}
        {...props}
      />
    </div>
  );
}

/**
 * Select estilizado para a barra de filtros.
 * @param {icon} icon - Ícone opcional para o lado esquerdo
 */
export function FilterSelect({
  children,
  className = '',
  icon: Icon,
  ...props
}) {
  return (
    <div className="relative group">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-4 w-4 text-slate-400 group-focus-within:text-[#ce7d0a] transition-colors" />
        </div>
      )}
      <select
        className={`
          h-9 ${Icon ? 'pl-9' : 'pl-3'} pr-9 w-full sm:w-auto
          border border-slate-200 rounded-lg text-sm bg-white text-slate-700
          focus:outline-none focus:ring-2 focus:ring-[#ce7d0a]/20 focus:border-[#ce7d0a]
          hover:border-slate-300
          transition-all duration-200
          appearance-none
          cursor-pointer
          shadow-sm
          ${className}
        `}
        {...props}
      >
        {children}
      </select>

      {/* Seta Customizada */}
      <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
        <ChevronDown className="h-4 w-4 text-slate-400" />
      </div>
    </div>
  );
}
