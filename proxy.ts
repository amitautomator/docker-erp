import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/getServerSession";

export async function proxy(request: NextRequest) {
  const session = await getServerSession();

  console.log("session proxy", session);
  const { pathname } = request.nextUrl;

  if (
    session &&
    (pathname.startsWith("/login") || pathname.startsWith("/signup"))
  ) {
    return NextResponse.redirect(new URL("/user/dashboard", request.url));
  }

  const isProtectedRoute = pathname.startsWith("/user");

  if (isProtectedRoute) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    } else if (!session.user.emailVerified) {
      return NextResponse.redirect(new URL("/verify-email", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/user/:path*", "/login", "/signup"],
};
