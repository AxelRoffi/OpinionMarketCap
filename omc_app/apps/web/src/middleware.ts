import { NextResponse, type NextRequest } from 'next/server';

/**
 * Phase E backwards-compat:
 * The Poster Arcade redesign was originally staged at /v2/* and swapped to
 * root in this codebase. Any saved bookmark or external link to /v2/foo
 * is 301-redirected to /foo so SEO + bookmarks survive the transition.
 */
const V2_PREFIX = '/v2';

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  if (pathname === V2_PREFIX || pathname.startsWith(`${V2_PREFIX}/`)) {
    const stripped = pathname.slice(V2_PREFIX.length) || '/';
    return NextResponse.redirect(new URL(`${stripped}${search}`, req.url), 301);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/v2', '/v2/:path*'],
};
