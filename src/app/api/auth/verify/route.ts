import { NextResponse } from 'next/server';
import { verifyAccessKey, setAccessCookie } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { key } = await request.json();

    if (!key) {
      return NextResponse.json({ error: 'Passcode diperlukan' }, { status: 400 });
    }

    const valid = await verifyAccessKey(key);

    if (!valid) {
      return NextResponse.json({ error: 'Passcode salah' }, { status: 401 });
    }

    await setAccessCookie();

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
