import { create } from 'zustand';
import { Propriedade } from '@/services/propriedades.service';

// ==========================================
// Estado Global da Propriedade Ativa
// ==========================================
// 
// Este store armazena a propriedade que o usuário está "operando" no momento.
// Todos os módulos (rebanho, lactação, coletas, etc.) devem consultar
// usePropriedadeStore(s => s.activeId) para saber qual propriedade filtrar.
//
// Persiste no localStorage para sobreviver a F5 e troca de abas.
// É limpo automaticamente no logout via auth.store.clearAuth().

const STORAGE_KEY = '@Buffs:activePropriedade';

interface PropriedadeStoreState {
  // A propriedade atualmente selecionada pelo usuário
  activeId: string | null;
  activePropriedade: Propriedade | null;

  // Ações
  setActivePropriedade: (propriedade: Propriedade) => void;
  clearActivePropriedade: () => void;
}

export const usePropriedadeStore = create<PropriedadeStoreState>((set) => {
  // Recupera do localStorage na inicialização (sobrevive F5)
  let initialId: string | null = null;
  let initialData: Propriedade | null = null;

  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        initialId = parsed.activeId ?? null;
        initialData = parsed.activePropriedade ?? null;
      }
    } catch {
      // Se o JSON estiver corrompido, ignora silenciosamente
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  return {
    activeId: initialId,
    activePropriedade: initialData,

    // Seleciona uma propriedade como ativa e persiste no localStorage
    setActivePropriedade: (propriedade) => {
      const state = {
        activeId: propriedade.idPropriedade,
        activePropriedade: propriedade,
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      }

      set(state);
    },

    // Limpa a propriedade ativa (usado no logout)
    clearActivePropriedade: () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
      }

      set({ activeId: null, activePropriedade: null });
    },
  };
});
