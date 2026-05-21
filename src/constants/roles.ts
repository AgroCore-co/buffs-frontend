export const CARGO = {
  PROPRIETARIO: 'PROPRIETARIO',
  GERENTE: 'GERENTE',
  FUNCIONARIO: 'FUNCIONARIO',
  VETERINARIO: 'VETERINARIO',
} as const;

export type CargoType = (typeof CARGO)[keyof typeof CARGO];

// Default redirect route for each role after login.
// Values are locale-agnostic — the Link/router from '@/i18n/routing' injects the locale prefix.
export const CARGO_ROUTES: Record<CargoType, string> = {
  [CARGO.PROPRIETARIO]: '/proprietario',
  [CARGO.GERENTE]: '/gerente',
  [CARGO.FUNCIONARIO]: '/funcionario',
  [CARGO.VETERINARIO]: '/veterinario',
};
