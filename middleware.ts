import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const isAuthenticated = request.cookies.has('auth_token')
  const isAuthPage = request.nextUrl.pathname === '/login'
  const isPublicPath = request.nextUrl.pathname.startsWith('/api/auth')

  if (!isAuthenticated && !isAuthPage && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isAuthenticated && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|images|favicon.ico).*)',
  ]
} 