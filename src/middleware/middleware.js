import { NextResponse } from "next/server";

// Rotas públicas que não precisam de autenticação
const publicRoutes = ["/auth/login", "/auth/register", "/auth/forgot-password"];

// Mapeamento básico de rotas restritas por "prefixo" para verificação rápida no servidor
// Isso é uma proteção extra além do hook client-side
const roleProtectedPaths = {
  "/admin": ["ADMIN"],
  "/proprietario": ["PROPRIETARIO"],
  "/funcionario": ["FUNCIONARIO", "ADMIN", "PROPRIETARIO"], // Exemplo: Admin/Prop também acessam área de func? Ajuste conforme regra.
};

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // 1. Ignorar arquivos estáticos e API routes (se não quiser proteger API aqui)
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next();
  }

  // 2. Verifica se é rota pública
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // 3. Verifica presença do token
  // O AuthContext atualizado agora seta esse cookie 'access_token'
  const token = request.cookies.get("access_token")?.value;

  if (!token) {
    // Se não tem token e tentou acessar rota privada -> Login
    const loginUrl = new URL("/auth/login", request.url);
    // (Opcional) Passar a url de origem para redirecionar de volta depois
    // loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 4. (Opcional) Proteção de Rota por Cargo via Middleware
  // Nota: Middleware não tem acesso fácil ao payload do JWT sem decodificar manualmente ou chamar API externa.
  // Por simplicidade e performance, a validação fina de cargo é feita no Cliente (useProtectedRoute)
  // ou no Servidor (Layouts/Page.jsx) decodificando o token.
  // Abaixo, apenas garantimos que está logado. Se quiser bloquear /admin aqui,
  // precisaria decodificar o JWT (jose/jwt) neste ponto.

  return NextResponse.next();
}

// Configuração do matcher para otimizar onde o middleware roda
export const config = {
  matcher: [
    /*
     * Corresponde a todos os caminhos de solicitação, exceto:
     * 1. /api/* (rotas de API)
     * 2. /_next/static/* (arquivos estáticos)
     * 3. /_next/image/* (otimização de imagens)
     * 4. /favicon.ico (ícone do navegador)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
