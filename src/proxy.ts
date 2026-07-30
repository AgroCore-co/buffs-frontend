import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

const VALID_LOCALES = ["pt", "en"] as const;

const PUBLIC_PATHS = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
];

const isDev = process.env.NODE_ENV === "development";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

function isPublicPath(pathname: string): boolean {
  const withoutLocale = pathname.replace(/^\/(pt|en)/, "") || "/";
  return (
    withoutLocale === "/" ||
    PUBLIC_PATHS.some(
      (p) => withoutLocale === p || withoutLocale.startsWith(p + "/")
    )
  );
}

function getLocaleFromPath(pathname: string): string {
  const segment = pathname.split("/")[1];
  return (VALID_LOCALES as readonly string[]).includes(segment)
    ? segment
    : routing.defaultLocale;
}

// ─── CSP com nonce por request ─────────────────────────────────────────────
// Fonte única de verdade para o Content-Security-Policy: o nonce muda a cada
// requisição, então não pode ser um header estático em next.config.ts.
function buildCsp(nonce: string): string {
  const connectSrc = isDev
    ? `connect-src 'self' https: http://localhost:* ${API_URL}`
    : `connect-src 'self' https: ${API_URL}`;

  // React em dev precisa de eval() pra reconstruir call stacks entre
  // ambientes (debug/Fast Refresh) — nunca usado em produção.
  const scriptSrc = isDev
    ? `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-eval'`
    : `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`;

  return [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https:",
    "font-src 'self' https://fonts.gstatic.com data:",
    connectSrc,
    "frame-ancestors 'none'",
  ].join("; ");
}

/**
 * Aplica o header x-nonce (lido pelo layout via headers(), e usado
 * automaticamente pelo Next para assinar os scripts de hidratação que ele
 * mesmo injeta) e o Content-Security-Policy final na resposta, preservando
 * quaisquer headers/cookies que a resposta original (ex: next-intl) já tenha
 * definido (cookie de locale, rewrite interno, etc).
 */
function withNonceCsp(request: NextRequest, baseResponse: NextResponse): NextResponse {
  const nonce = crypto.randomUUID();
  const csp = buildCsp(nonce);

  // next-intl pode devolver um redirect (ex: "/" -> "/pt"). Recriar a resposta
  // via NextResponse.next() descartaria o status 3xx e sobraria um 200 com
  // header location — o browser não segue e a tela fica em branco.
  if (baseResponse.status !== 200) {
    return withCspOnly(baseResponse);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  const response = NextResponse.next({ request: { headers: requestHeaders } });

  baseResponse.headers.forEach((value, key) => response.headers.set(key, value));
  baseResponse.cookies.getAll().forEach((cookie) => response.cookies.set(cookie));

  response.headers.set("Content-Security-Policy", csp);
  return response;
}

function withCspOnly(baseResponse: NextResponse): NextResponse {
  const nonce = crypto.randomUUID();
  baseResponse.headers.set("Content-Security-Policy", buildCsp(nonce));
  return baseResponse;
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return withNonceCsp(request, intlMiddleware(request));
  }

  const token = request.cookies.get("buffs_auth_token");

  if (!token) {
    const locale = getLocaleFromPath(pathname);
    const loginUrl = new URL(`/${locale}/auth/login`, request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    // Redirect não renderiza HTML nesta resposta — não precisa de nonce
    // (nenhum script inline é injetado numa resposta 3xx), só do CSP base.
    return withCspOnly(NextResponse.redirect(loginUrl));
  }

  return withNonceCsp(request, intlMiddleware(request));
}

export const config = {
  matcher: [
    "/",
    "/(pt|en)/:path*",
    "/((?!_next|api|favicon.ico|images|icons|next.svg|vercel.svg|.*\\..*).*)",
  ],
};
