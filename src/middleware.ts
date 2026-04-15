import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Ignora arquivos estáticos e _next, aplica apenas nas rotas
  matcher: ["/(pt|en|es)/:path*"],
};
