import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('is_active', true)
      .order('created_at');

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch wallets';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = createServerClient();

    // Create wallet
    const { data: wallet, error } = await supabase
      .from('wallets')
      .insert({
        name: body.name,
        type: body.type,
        balance: 0,
        icon: body.icon || null,
        color: body.color || null,
      })
      .select()
      .single();

    if (error) throw error;

    // Add initial balance as income transaction if provided
    if (body.initial_balance && body.initial_balance > 0) {
      await supabase.from('transactions').insert({
        type: 'income',
        amount: body.initial_balance,
        description: 'Saldo Awal',
        wallet_id: wallet.id,
        date: new Date().toISOString().split('T')[0],
      });
    }

    // Re-fetch wallet with updated balance
    const { data: updated } = await supabase
      .from('wallets')
      .select('*')
      .eq('id', wallet.id)
      .single();

    return NextResponse.json(updated || wallet, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create wallet';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
