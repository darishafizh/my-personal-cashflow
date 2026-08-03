import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

type RouteParams = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = createServerClient();

    // 1. Fetch transaction to revert balances
    const { data: tx } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .single();

    // (Wallet balances are reverted automatically via Supabase Database Triggers)

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return new NextResponse(null, { status: 204 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete transaction';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const supabase = createServerClient();

    // 1. Fetch old transaction to revert
    const { data: oldTx } = await supabase.from('transactions').select('*').eq('id', id).single();
    // (Wallet balances are automatically updated via Supabase Database Triggers on UPDATE)

    const { data, error } = await supabase
      .from('transactions')
      .update({
        type: body.type,
        amount: body.amount,
        admin_fee: body.admin_fee || 0,
        description: body.description,
        category_id: body.category_id,
        wallet_id: body.wallet_id,
        destination_wallet_id: body.destination_wallet_id,
        budget_id: body.budget_id,
        date: body.date,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update transaction';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
