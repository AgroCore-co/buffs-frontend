// ==========================================
// Chaves de armazenamento local
// ==========================================

export const STORAGE_KEYS = {
  SESSION: '@Buffs:session',
  ACTIVE_PROPRIEDADE: '@Buffs:activePropriedade',
} as const;

// ==========================================
// Tipos de cargo e rotas padrão por cargo
// ==========================================

export { CARGO, type CargoType, CARGO_ROUTES } from './roles';

// ==========================================
// Mapeamento de tipo de manejo (exibição)
// ==========================================

export const TIPO_MANEJO_MAP: Record<string, string> = {
  P: 'Pecuária',
  E: 'Extensivo',
  I: 'Intensivo',
};
