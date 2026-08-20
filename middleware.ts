import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  // Protect the dashboard route
  if (req.nextUrl.pathname.startsWith("/dashboard")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }
  return NextResponse.next();
})

export const config = {
  matcher: ['/((?!api/upload|api/job|_next/static|_next/image|favicon.ico).*)'],
}
