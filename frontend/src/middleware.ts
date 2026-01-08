import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  const publicRoutes = ['/auth/login', '/auth/register'];
  const adminRoutes = ['/admin'];   
  const userRoutes = ['/usuario'];  

  const isPublicRoute = publicRoutes.includes(pathname);
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));
  const isUserRoute = userRoutes.some((route) => pathname.startsWith(route));

  if (!token) {
    if (!isPublicRoute) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    return NextResponse.next();
  }

  if (token) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);
      const userRole = payload.role; 

      if (isPublicRoute) {
        if (userRole === 'admin') {
          return NextResponse.redirect(new URL('/admin/dashboard', request.url));
        } else {
          return NextResponse.redirect(new URL('/usuario', request.url));
        }
      }

      if (isAdminRoute && userRole !== 'admin') {
        return NextResponse.redirect(new URL('/usuario', request.url));
      }

      if (pathname === '/') {
        if (userRole === 'admin') {
          return NextResponse.redirect(new URL('/admin/dashboard', request.url));
        } else {
          return NextResponse.redirect(new URL('/usuario', request.url));
        }
      }

    } catch (error) {
      console.error("Token inválido:", error);
      const response = NextResponse.redirect(new URL('/auth/login', request.url));
      response.cookies.delete('token');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.jpeg).*)',
  ],
};