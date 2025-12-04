import React from 'react';

/**
 * Componente de navegação de abas (tabs) reutilizável.
 * @param {Array} tabs - [{ key, label }]
 * @param {string} activeTab - aba ativa
 * @param {function} onTabChange - callback ao trocar de aba
 * @param {string} className - classes extras
 */
/**
 * Componente de navegação de abas (tabs) reutilizável.
 * @param {Array} tabs - [{ key, label }]
 * @param {string} activeTab - aba ativa
 * @param {function} onTabChange - callback ao trocar de aba
 * @param {string} className - classes extras para o container
 * @param {string} tabClassName - classes extras para cada tab
 * @param {string} activeTabClassName - classes extras para tab ativa
 * @param {string} inactiveTabClassName - classes extras para tab inativa
 */
/**
 * Componente de navegação de abas (tabs) reutilizável.
 * O design padrão é centralizado aqui.
 * @param {Array} tabs - [{ key, label }]
 * @param {string} activeTab - aba ativa
 * @param {function} onTabChange - callback ao trocar de aba
 * @param {string} className - classes extras para o container
 */
export default function TabNav({
  tabs,
  activeTab,
  onTabChange,
  className = '',
}) {
  // Design padrão: borda inferior, sem fundo, fonte média, destaque na ativa
  const tabClass = 'py-4 px-1 border-b-2 font-medium text-sm';
  const activeClass = 'border-amber-500 text-amber-600';
  const inactiveClass =
    'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300';
  return (
    <div className={`flex gap-2 overflow-x-auto pb-1 md:pb-0 ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={`whitespace-nowrap ${tabClass} ${activeTab === tab.key ? activeClass : inactiveClass}`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
