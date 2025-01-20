"server-only";
import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { getToken } from "next-auth/jwt";
import {
  pathnames,
  locales,
  localePrefix,
  defaultLocale,
  authPages,
  adminPages,
  publicPages,
} from "@/config";
import {
  decryptSessionMetadata,
  encryptSessionMetadata,
} from "@/libs/utils/session-metadata-cookie";
import { antibot } from "@/libs/middleware/antibot";

const testPathnameRegex = (pages: string[], pathName: string): boolean => {
  return RegExp(
    `^(/(${locales.join("|")}))?(${pages
      .flatMap((p) => (p === "/" ? ["", "/"] : p))
      .join("|")})/?$`,
    "i"
  ).test(pathName);
};

const intlMiddleware = createMiddleware({
  defaultLocale,
  locales,
  pathnames,
  localePrefix,
});

export default async function middleware(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("cf-connecting-ip") ||
    "127.0.0.1";

  const statusAntibot = await antibot(req, ip);
  if (statusAntibot) {
    return statusAntibot; // Bloque la requête si nécessaire
  }

  // Appliquer intlMiddleware pour gérer la localisation
  const response = intlMiddleware(req);

  const isPublicPage = testPathnameRegex(publicPages, req.nextUrl.pathname);
  const isAuthPage = testPathnameRegex(authPages, req.nextUrl.pathname);
  const isAdminPage = testPathnameRegex(adminPages, req.nextUrl.pathname);

  const metadata = await decryptSessionMetadata();
  if (!metadata) {
    await encryptSessionMetadata(req);
  }

  if (isPublicPage) {
    return response;
  }

  if (!process.env.NEXTAUTH_SECRET) {
    console.error("process.env.AUTH_SECRET not founnt.");
  }

  // Récupérer le token de session depuis la requête
  let token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: "__Secure-authjs.session-token",
  });

  // Si le premier cookie n'est pas trouvé, essayer le second
  if (!token && process.env.NODE_ENV !== "production") {
    token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
      cookieName: "next-auth.session-token",
    });
  }
  if (!token && process.env.NODE_ENV !== "production") {
    token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
      cookieName: "authjs.session-token",
    });
  }

  // Redirect to sign-in page if not authenticated
  if (!token && !isAuthPage) {
    console.error("Token non trouvé. Redirection vers /auth/sign-in.");
    return NextResponse.redirect(new URL("/auth/sign-in", req.nextUrl));
  }

  // Redirect to home page if authenticated and trying to access auth pages
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  // Redirect to home page if authenticated or admin accreditation and trying to access admin pages
  if (isAdminPage && !token?.isAdmin) {
    console.warn("Accès refusé. Redirection d'un utilisateur non-admin.");
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
