import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isAuthenticated = !!req.auth
  const isAuthPage = req.nextUrl.pathname.startsWith("/login")
  const isApiRoute = req.nextUrl.pathname.startsWith("/api")

  // Allow API routes to handle their own auth
  if (isApiRoute) {
    return NextResponse.next()
  }

  // Redirect authenticated users away from login page
  if (isAuthenticated && isAuthPage) {
    return NextResponse.redirect(new URL("/brands", req.url))
  }

  // Redirect unauthenticated users to login (except for public pages)
  if (!isAuthenticated && !isAuthPage && req.nextUrl.pathname !== "/") {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
