import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get('month') || String(new Date().getMonth() + 1));
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()));
    const supabase = createServerClient();

    // Get budgets for the month
    const { data: budgets, error } = await supabase
      .from('budgets')
      .select('*, category:categories(*), wallet:wallets!budgets_wallet_id_fkey(*), target_wallet:wallets!budgets_target_wallet_id_fkey(*)')
      .eq('month', month)
      .eq('year', year)
      .order('name');

    if (error) throw error;

    // Calculate spent amount for each budget
    const dateFrom = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const dateTo = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    const enriched = await Promise.all(
      (budgets || []).map(async (budget) => {
        // Get transactions linked to this budget
        const { data: txs } = await supabase
          .from('transactions')
          .select('amount')
          .eq('budget_id', budget.id)
          .gte('date', dateFrom)
          .lte('date', dateTo);

        // Also get transactions by category if category is set
        let categorySpent = 0;
        if (budget.category_id) {
          const { data: catTxs } = await supabase
            .from('transactions')
            .select('amount')
            .eq('category_id', budget.category_id)
            .in('type', ['expense', 'transfer'])
            .gte('date', dateFrom)
            .lte('date', dateTo);

          categorySpent = (catTxs || []).reduce((sum, t) => sum + t.amount, 0);
        }

        const budgetLinkedSpent = (txs || []).reduce((sum, t) => sum + t.amount, 0);
        const spent = Math.max(budgetLinkedSpent, categorySpent);
        const remaining = budget.limit_amount - spent;
        const percentage = budget.limit_amount > 0 ? (spent / budget.limit_amount) * 100 : 0;

        return { ...budget, spent, remaining, percentage };
      })
    );

    return NextResponse.json(enriched);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch budgets';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from('budgets')
      .insert({
        name: body.name,
        category_id: body.category_id || null,
        budget_type: body.budget_type || 'expense',
        wallet_id: body.wallet_id || null,
        target_wallet_id: body.target_wallet_id || null,
        month: body.month,
        year: body.year,
        limit_amount: body.limit_amount,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create budget';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
