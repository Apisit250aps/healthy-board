import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export const proxy = auth((req) => {
  const pathname = req.nextUrl.pathname
  const auth = req.auth

  if (pathname.startsWith('/me')) {
    if (!auth) {
      return NextResponse.redirect(new URL('/', req.nextUrl))
    }
  }
})

// Optionally, don't invoke Proxy on some paths
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
