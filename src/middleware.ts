import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

const LOGIN_PAGE = "/login"
const UNAUTHORISED_PAGE = "/unauthorised"

const requireAuthPaths = [
  "/api",
  "/chat",
  "/hallucinations",
  "/prompt-guide",
  "/settings",
  "training",
  "/terms",
  "/whats-new",
]

const requireAdminPaths = ["/api/tenant", "/settings/tenant", "/settings/admin", "settings/manage"]

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const pathname = request.nextUrl.pathname

  const requiresAuth = requireAuthPaths.some(path => pathname.startsWith(path))
  const requiresAdmin = requireAdminPaths.some(path => pathname.startsWith(path))

  if (!requiresAuth) return NextResponse.next()

  const token = await getToken({ req: request })

  const now = Math.floor(Date.now() / 1000)
  if (!token || (token.exp && typeof token.exp === "number" && token.exp < now))
    return NextResponse.redirect(new URL(LOGIN_PAGE, request.url))

  if (requiresAdmin && !(token.admin || token.tenantAdmin || token.globalAdmin))
    return NextResponse.rewrite(new URL(UNAUTHORISED_PAGE, request.url))

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/api/application/:path*",
    "/api/chat/:path*",
    "/api/tenant/:path*",
    "/api/user/:path*",
    "/chat/:path*",
    "/hallucinations/:path*",
    "/prompt-guide/:path*",
    "/settings/:path*",
    "/training/:path*",
    "/terms/:path*",
    "/unauthorised/:path*",
    "/whats-new/:path*",
  ],
}
