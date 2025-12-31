import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  })

  const path = req.nextUrl.pathname

  // 1. If no token, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  // 2. Superadmin Protection: Only SUPERADMIN can enter
  if (path.startsWith("/superadmin") && token.role !== "SUPERADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  // 3. Admin Protection: Both ADMIN and SUPERADMIN can enter
  // We check if the user is NEITHER an Admin NOR a Superadmin
  if (path.startsWith("/admin")) {
    const isAuthorized = token.role === "ADMIN" || token.role === "SUPERADMIN"
    
    if (!isAuthorized) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/superadmin/:path*", "/dashboard"],
}