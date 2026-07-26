import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

type RouteParams = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from('budgets')
      .update({
        name: body.name,
        category_id: body.category_id,
        budget_type: body.budget_type,
        wallet_id: body.wallet_id,
        target_wallet_id: body.target_wallet_id,
        limit_amount: body.limit_amount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update budget';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = createServerClient();

    const { error } = await supabase.from('budgets').delete().eq('id', id);
    if (error) throw error;
    return new NextResponse(null, { status: 204 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete budget';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
