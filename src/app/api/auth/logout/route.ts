import { NextResponse } from 'next/server';
import { clearAccessCookie } from '@/lib/auth';

export async function POST() {
  await clearAccessCookie();
  return NextResponse.json({ success: true });
}
