import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const COOKIE_NAME = 'cashflow_access';

const PUBLIC_PATHS = [
  '/gate',
  '/api/auth/verify',
  '/api/auth/logout',
];

const STATIC_PREFIXES = [
  '/_next',
  '/favicon.ico',
  '/manifest',
  '/sw.js',
  '/icons',
];

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname)) return true;
  if (STATIC_PREFIXES.some(prefix => pathname.startsWith(prefix))) return true;
  return false;
}

// Helper to generate hash using Web Crypto API (Edge compatible)
async function generateHash(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Check access cookie
  const accessCookie = request.cookies.get(COOKIE_NAME);

  if (!accessCookie) {
    // Redirect to gate for page requests
    if (!pathname.startsWith('/api/')) {
      return NextResponse.redirect(new URL('/gate', request.url));
    }
    // Return 401 for API requests
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verify cookie value
  const expectedToken = await generateHash(process.env.APP_ACCESS_KEY || '');

  if (accessCookie.value !== expectedToken) {
    if (!pathname.startsWith('/api/')) {
      const response = NextResponse.redirect(new URL('/gate', request.url));
      response.cookies.delete(COOKIE_NAME);
      return response;
    }
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except static files
     */
    '/((?!_next/static|_next/image|favicon.ico|icons|sw.js).*)',
  ],
};
