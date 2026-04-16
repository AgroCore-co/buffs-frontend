import React from 'react';

export function TabNav({
  tabs,
  activeTab,
  onTabChange,
  className = '',
  tabClassName = '',
  activeTabClassName = '',
  inactiveTabClassName = '',
}) {
  return (
    // Container com scroll horizontal invisível e linha de base sutil
    <div className={`relative flex gap-8 overflow-x-auto border-b border-border [&::-webkit-scrollbar]:hidden ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onTabChange(tab.key)}
            className={`group relative pb-4 pt-2 text-sm font-bold tracking-wide transition-colors duration-300 ease-in-out whitespace-nowrap ${tabClassName} ${
              isActive
                ? `text-[var(--color-primary-dark)] ${activeTabClassName}`
                : `text-muted-foreground hover:text-foreground ${inactiveTabClassName}`
            }`}
          >
            {tab.label}
            
            {/* Linha indicadora animada */}
            <span
              className={`absolute left-0 bottom-[-1px] h-[2px] w-full rounded-t-full transition-all duration-300 ease-in-out origin-center ${
                isActive
                  ? "bg-[var(--color-primary-dark)] scale-x-100 opacity-100"
                  : "bg-border scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-50"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}

export default TabNav;