import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/lib/auth"

export default async function middleware(req: NextRequest) {
  const session = await auth()
  const isAuthenticated = !!session?.user
  const pathname = req.nextUrl.pathname
  const isAuthPage = pathname.startsWith("/login")
  const isApiRoute = pathname.startsWith("/api")

  // Allow API routes to handle their own auth
  if (isApiRoute) {
    return NextResponse.next()
  }

  // Redirect unauthenticated users to login (except for public pages)
  if (!isAuthenticated && !isAuthPage && pathname !== "/") {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  // Redirect authenticated users away from login
  if (isAuthenticated && isAuthPage) {
    // Let server components handle the mode-based redirect
    return NextResponse.redirect(new URL("/select-mode", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
