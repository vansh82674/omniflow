import NextAuth from "next-auth"
import authConfig from "./auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const path = req.nextUrl.pathname;

  // Protect the entire dashboard
  if (path.startsWith("/dashboard")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // All /api/* routes (except /api/auth/*) also require auth
  if (path.startsWith("/api/") && !path.startsWith("/api/auth/")) {
    if (!isLoggedIn) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.next();
})

export const config = {
  // Match everything except static files and favicon
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
