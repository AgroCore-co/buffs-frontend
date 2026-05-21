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

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return intlMiddleware(request);
  }

  const token = request.cookies.get("buffs_auth_token");

  if (!token) {
    const locale = getLocaleFromPath(pathname);
    const loginUrl = new URL(`/${locale}/auth/login`, request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    "/",
    "/(pt|en)/:path*",
    "/((?!_next|api|favicon.ico|images|icons|next.svg|vercel.svg|.*\\..*).*)",
  ],
};
