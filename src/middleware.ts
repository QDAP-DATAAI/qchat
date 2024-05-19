import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

const LOGIN_PAGE = "/login"
const UNAUTHORISED_PAGE = "/unauthorised"
const NOT_TENANT_ADMIN = "/unauthorised/tenantadmin"

const requireAuth: string[] = [
  "/api",
  "/chat",
  "/hallucinations",
  "/prompt-guide",
  "/reporting",
  "/settings",
  "/terms",
  "/whats-new",
  "/unauthorised/tenantadmin",
]

const requireAdmin: string[] = ["/reporting"]
const requireTenantAdmin: string[] = ["/settings/details", "/settings/tenant"]

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const pathname = request.nextUrl.pathname

  if (requireAuth.some(path => pathname.startsWith(path))) {
    const token = await getToken({ req: request })

    const now = Math.floor(Date.now() / 1000)
    if (!token || (token.exp && typeof token.exp === "number" && token.exp < now)) {
      return NextResponse.redirect(new URL(LOGIN_PAGE, request.url))
    }

    if (requireAdmin.some(path => pathname.startsWith(path)) && !token.admin) {
      return NextResponse.rewrite(new URL(UNAUTHORISED_PAGE, request.url))
    }

    if (
      requireTenantAdmin.some(path => pathname.startsWith(path)) &&
      !token.admin &&
      !token.tenantAdmin &&
      !token.globalAdmin
    ) {
      return NextResponse.rewrite(new URL(NOT_TENANT_ADMIN, request.url))
    }
  }
  return NextResponse.next()
}

export const config = {
  matcher: [
    "/api/chat/:path*",
    "/api/tenant/:path*",
    "/api/user/:path*",
    "/chat/:path*",
    "/hallucinations/:path*",
    "/prompt-guide/:path*",
    "/reporting/:path*",
    "/settings/:path*",
    "/terms/:path*",
    "/unauthorised/:path*",
    "/whats-new/:path*",
  ],
}
