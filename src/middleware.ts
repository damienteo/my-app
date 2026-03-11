import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { routing } from './i18n/routing'

const intlMiddleware = createMiddleware(routing)

function isSameOriginApiRequest(request: NextRequest) {
  // Browser fetches include `sec-fetch-site`. Same-origin requests will be
  // `same-origin` (or sometimes `same-site`).
  const secFetchSite = request.headers.get('sec-fetch-site')
  return secFetchSite === 'same-origin' || secFetchSite === 'same-site'
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/api/')) {
    if (!isSameOriginApiRequest(request)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        {
          status: 403,
          headers: { 'cache-control': 'no-store' },
        }
      )
    }
    return NextResponse.next()
  }

  return intlMiddleware(request)
}

export const config = {
  // Match all pathnames except for:
  // - `/_next`, `/_vercel`
  // - `/trpc`
  // - static assets (paths containing a dot, e.g. `favicon.ico`)
  matcher: '/((?!trpc|_next|_vercel|.*\\..*).*)',
}
