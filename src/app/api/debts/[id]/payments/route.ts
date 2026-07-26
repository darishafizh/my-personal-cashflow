import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from('debt_payments')
      .select('*')
      .eq('debt_id', id)
      .order('paid_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch payments';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from('debt_payments')
      .insert({
        debt_id: id,
        amount: body.amount,
        note: body.note || null,
        paid_at: body.paid_at,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create payment';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
