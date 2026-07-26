import { cookies } from 'next/headers';

const COOKIE_NAME = 'cashflow_access';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

// Helper to generate hash using Web Crypto API (Edge/Node compatible)
async function generateHash(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyAccessKey(inputKey: string): Promise<boolean> {
  const correctKey = process.env.APP_ACCESS_KEY;
  if (!correctKey) return false;
  return inputKey === correctKey;
}

export async function setAccessCookie(): Promise<void> {
  const cookieStore = await cookies();
  const token = await generateHash(process.env.APP_ACCESS_KEY || '');
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });
}

export async function clearAccessCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);
  if (!cookie) return false;

  const expectedToken = await generateHash(process.env.APP_ACCESS_KEY || '');
  return cookie.value === expectedToken;
}

// For use in API routes - validates the access cookie
export async function requireAuth(): Promise<boolean> {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return false;
  }
  return true;
}
