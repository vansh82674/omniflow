import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  // Protect the root dashboard route
  if (req.nextUrl.pathname === "/") {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/api/auth/signin", req.url));
    }
  }
  return NextResponse.next();
})

export const config = {
  matcher: ['/((?!api/upload|api/job|_next/static|_next/image|favicon.ico).*)'],
}
