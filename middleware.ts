import { NextResponse, type NextRequest } from 'next/server'

// Keep the approved homepage in the existing site while the other public routes
// and contact handler continue to be served by Next.js.
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === '/') {
    return NextResponse.rewrite(new URL('/updated/index.html', request.url))
  }
  return NextResponse.next()
}

export const config = { matcher: '/' }
