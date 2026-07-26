import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { sourceMonth, sourceYear, targetMonth, targetYear } = await request.json();
    const supabase = createServerClient();

    // Get budgets from source month
    const { data: sourceBudgets, error: fetchErr } = await supabase
      .from('budgets')
      .select('*')
      .eq('month', sourceMonth)
      .eq('year', sourceYear);

    if (fetchErr) throw fetchErr;
    if (!sourceBudgets || sourceBudgets.length === 0) {
      return NextResponse.json({ error: 'Tidak ada budget di bulan sumber' }, { status: 400 });
    }

    // Copy to target month
    const newBudgets = sourceBudgets.map((b) => ({
      name: b.name,
      category_id: b.category_id,
      budget_type: b.budget_type,
      wallet_id: b.wallet_id,
      target_wallet_id: b.target_wallet_id,
      month: targetMonth,
      year: targetYear,
      limit_amount: b.limit_amount,
    }));

    const { data, error } = await supabase
      .from('budgets')
      .upsert(newBudgets, { onConflict: 'name,month,year' })
      .select();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to copy budgets';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
