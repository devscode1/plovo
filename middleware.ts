import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = ["/", "/sign-in", "/sign-up"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("__session")?.value;

  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  if (!token && !isPublicRoute) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("redirectUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  if (token && pathname === "/sign-in") {
    return NextResponse.redirect(new URL("/select-workspace", request.url));
  }

  if (token && pathname === "/sign-up") {
    return NextResponse.redirect(new URL("/select-workspace", request.url));
  }

  if (token && pathname === "/") {
    return NextResponse.redirect(new URL("/select-workspace", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
