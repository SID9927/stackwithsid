import { NextResponse } from 'next/server'

export function middleware(request) {
  const accept = request.headers.get('accept')
  if (accept && accept.includes('text/markdown')) {
    const url = request.nextUrl.clone()
    url.pathname = '/api/markdown-negotiator'
    url.searchParams.set('path', request.nextUrl.pathname)
    return NextResponse.rewrite(url)
  }
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - any file with extension (png, svg, ico, webp, css, js)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.[a-zA-Z0-9]+$).*)',
  ],
}
