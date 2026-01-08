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

  const token = request.cookies.get("token")?.value;

  const isAuthRoute =
    pathname.startsWith("/auth/login") || pathname.startsWith("/auth/register");

  const isAdminRoute = pathname.startsWith("/admin");
  const isUserRoute = pathname.startsWith("/usuario");

  // Se NÃO está logado e tenta /admin/* -> login + returnTo
  if (isAdminRoute && !token) {
    const url = new URL("/auth/login", request.url);
    url.searchParams.set("returnTo", pathname);
    return NextResponse.redirect(url);
  }
  // se Não está logado e tenta /usuaro/* -> login + returnTo
  if(!token && isUserRoute){
    const url = new URL("/auth/login", request.url);
    url.searchParams.set("returnTo", pathname);
    return NextResponse.redirect(url);
  }

  // ✅ Se NÃO está logado, pode acessar /auth/*
  if (!token && isAuthRoute){
    return NextResponse.next();
  } 
  

  // ✅ Se está logado e tenta /auth/* -> manda pro lugar certo
  if (token && isAuthRoute) {
    try {
      const payload = jwtDecode<DotNetJwtPayload>(token);
      const role = payload[ROLE_CLAIM];
      const dest = role === "Admin" ? "/admin/dashboard" : "/usuario/agendamentos";
      return NextResponse.redirect(new URL(dest, request.url));
    } catch {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  // ✅ Proteger /admin/*: precisa role Admin
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
  matcher: ["/admin/:path*", "/auth/login/:path*", "/auth/register/:path*", "/usuario/:path"],
};
