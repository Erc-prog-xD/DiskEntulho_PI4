import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";

type DotNetJwtPayload = {
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"?: "Admin" | "Client";
};

const ROLE_CLAIM =
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role" as const;

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("token")?.value; // hoje seu fluxo depende desse cookie :contentReference[oaicite:10]{index=10}

  const isAuthRoute =
    pathname.startsWith("/auth/login") || pathname.startsWith("/auth/register");

  const isAdminRoute = pathname.startsWith("/admin");

  // rotas “usuário”: /usuario e também /agendamentos
  const isUserRoute =
    pathname.startsWith("/usuario") || pathname.startsWith("/agendamentos");

  if ((isAdminRoute || isUserRoute) && !token) {
    const url = new URL("/auth/login", request.url);
    url.searchParams.set("returnTo", pathname);
    return NextResponse.redirect(url);
  }

  if (!token && isAuthRoute) {
    return NextResponse.next();
  }

  // se já está logado e tenta ir pra /auth/*
  if (token && isAuthRoute) {
    try {
      const payload = jwtDecode<DotNetJwtPayload>(token);
      const role = payload[ROLE_CLAIM];
      const dest = role === "Admin" ? "/admin/dashboard" : "/usuario/dashboard";
      return NextResponse.redirect(new URL(dest, request.url));
    } catch {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  // bloqueia usuário não-admin tentando /admin
  if (isAdminRoute && token) {
    try {
      const payload = jwtDecode<DotNetJwtPayload>(token);
      const role = payload[ROLE_CLAIM];
      if (role !== "Admin") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/usuario/:path*",
    "/agendamentos/:path*",
    "/auth/login/:path*",
    "/auth/register/:path*",
  ],
};
