/**
 * src/constants/routes.js
 * Centralização de rotas e regras de redirecionamento por cargo.
 */

export const ROUTES = {
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  DENIED: "/auth/acesso-negado",
  HOME: "/auth/",
};

export const CARGOS = {
  PROPRIETARIO: "PROPRIETARIO",
  ADMIN: "ADMIN",
  FUNCIONARIO: "FUNCIONARIO",
};

// Mapeamento Cargo -> Rota Inicial (Dashboard)
export const ROUTES_BY_CARGO = {
  [CARGOS.PROPRIETARIO]: "/proprietario/",
  [CARGOS.ADMIN]: "/admin/",
  [CARGOS.FUNCIONARIO]: "/funcionario/",
};

// Rota de fallback caso o cargo não venha ou seja desconhecido
export const DEFAULT_ROUTE = "/auth/login";

/**
 * Helper para resolver redirecionamento
 */
export const getRedirectRoute = (cargo) => {
  return ROUTES_BY_CARGO[cargo] || DEFAULT_ROUTE;
};