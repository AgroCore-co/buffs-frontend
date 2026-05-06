import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Aplica o proxy em todas as rotas exceto arquivos estáticos, _next e API
  matcher: [
    "/",
    "/(pt|en)/:path*",
    "/((?!_next|api|favicon.ico|images|icons|next.svg|vercel.svg|.*\\..*).*)"
  ],
};
