import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname

  // 1. PUBLIC ROUTE EXCEPTION
  // Allow anyone to access the public invoice signature page
  if (path.startsWith('/public')) {
    return NextResponse.next()
  }

  // 2. CHECK FOR AUTHENTICATION
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // 3. REDIRECT TO LOGIN IF NO TOKEN
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  // 4. SUPERADMIN PROTECTION
  if (path.startsWith("/superadmin") && token.role !== "SUPERADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  // 5. ADMIN/DASHBOARD PROTECTION
  if (path.startsWith("/admin")) {
    const isAuthorized = token.role === "ADMIN" || token.role === "SUPERADMIN"
    if (!isAuthorized) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
  }

  return NextResponse.next()
}

// 6. MATCHER CONFIGURATION
// Ensure this covers your protected routes but allows the /public paths
export const config = {
  matcher: [
    "/admin/:path*", 
    "/superadmin/:path*", 
    "/dashboard/:path*",
    "/public/:path*" // Include this so the middleware can process the "exception" logic
  ],
}