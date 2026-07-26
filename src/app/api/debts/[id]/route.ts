import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = createServerClient();

    const { data: debt, error } = await supabase
      .from('debts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!debt) return NextResponse.json({ error: 'Debt not found' }, { status: 404 });

    // Get payments
    const { data: payments } = await supabase
      .from('debt_payments')
      .select('*')
      .eq('debt_id', id)
      .order('paid_at', { ascending: false });

    return NextResponse.json({ ...debt, payments: payments || [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch debt';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from('debts')
      .update({
        person_name: body.person_name,
        total_amount: body.total_amount,
        description: body.description,
        due_date: body.due_date,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update debt';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = createServerClient();

    const { error } = await supabase.from('debts').delete().eq('id', id);
    if (error) throw error;
    return new NextResponse(null, { status: 204 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete debt';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
