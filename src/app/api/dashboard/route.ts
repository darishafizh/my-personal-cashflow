import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = createServerClient();
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const dateFrom = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
    const lastDay = new Date(currentYear, currentMonth, 0).getDate();
    const dateTo = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    // 1. Wallets
    const { data: wallets } = await supabase
      .from('wallets')
      .select('*')
      .eq('is_active', true)
      .order('created_at');

    const totalBalance = (wallets || []).reduce((sum, w) => sum + (w.balance || 0), 0);

    // 2. Monthly transactions
    const { data: monthlyTxs } = await supabase
      .from('transactions')
      .select('*')
      .gte('date', dateFrom)
      .lte('date', dateTo);

    let monthlyIncome = 0;
    let monthlyExpense = 0;
    for (const tx of monthlyTxs || []) {
      if (tx.type === 'income') monthlyIncome += tx.amount;
      if (tx.type === 'expense') monthlyExpense += tx.amount;
      if (tx.type === 'transfer') monthlyExpense += tx.admin_fee || 0;
    }

    // 3. Daily trend (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
    const trendFrom = thirtyDaysAgo.toISOString().split('T')[0];

    const { data: trendTxs } = await supabase
      .from('transactions')
      .select('type, amount, date')
      .gte('date', trendFrom)
      .lte('date', dateTo);

    const dailyMap: Record<string, { income: number; expense: number }> = {};
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      const key = d.toISOString().split('T')[0];
      dailyMap[key] = { income: 0, expense: 0 };
    }
    for (const tx of trendTxs || []) {
      if (dailyMap[tx.date]) {
        if (tx.type === 'income') dailyMap[tx.date].income += tx.amount;
        if (tx.type === 'expense') dailyMap[tx.date].expense += tx.amount;
      }
    }
    const dailyTrend = Object.entries(dailyMap).map(([date, vals]) => ({
      date,
      ...vals,
    }));

    // 4. Recent transactions
    const { data: recentTxs } = await supabase
      .from('transactions')
      .select('*, category:categories(*), wallet:wallets!transactions_wallet_id_fkey(*), destination_wallet:wallets!transactions_destination_wallet_id_fkey(*)')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(5);

    // 5. Boncos detection - categories exceeding budget
    const { data: budgets } = await supabase
      .from('budgets')
      .select('*, category:categories(*)')
      .eq('month', currentMonth)
      .eq('year', currentYear);

    const boncos: Array<{
      category_name: string;
      category_icon: string;
      spent: number;
      budget_limit: number;
      percentage: number;
      avg_previous: number;
    }> = [];

    for (const budget of budgets || []) {
      // Get spending for this budget's category
      let spent = 0;
      if (budget.category_id) {
        const { data: catTxs } = await supabase
          .from('transactions')
          .select('amount')
          .eq('category_id', budget.category_id)
          .in('type', ['expense'])
          .gte('date', dateFrom)
          .lte('date', dateTo);
        spent = (catTxs || []).reduce((s, t) => s + t.amount, 0);
      }

      const percentage = budget.limit_amount > 0 ? (spent / budget.limit_amount) * 100 : 0;

      // Get average of previous 3 months
      let avgPrevious = 0;
      if (budget.category_id) {
        const threeMonthsAgo = new Date(currentYear, currentMonth - 4, 1);
        const prevFrom = threeMonthsAgo.toISOString().split('T')[0];
        const prevTo = `${currentYear}-${String(currentMonth - 1).padStart(2, '0')}-${new Date(currentYear, currentMonth - 1, 0).getDate()}`;

        const { data: prevTxs } = await supabase
          .from('transactions')
          .select('amount')
          .eq('category_id', budget.category_id)
          .in('type', ['expense'])
          .gte('date', prevFrom)
          .lte('date', prevTo);

        const prevTotal = (prevTxs || []).reduce((s, t) => s + t.amount, 0);
        avgPrevious = prevTotal / 3;
      }

      // Flag as boncos if over budget or significantly above average
      if (percentage > 80 || (avgPrevious > 0 && spent > avgPrevious * 1.5)) {
        boncos.push({
          category_name: budget.category?.name || budget.name,
          category_icon: budget.category?.icon || '📦',
          spent,
          budget_limit: budget.limit_amount,
          percentage,
          avg_previous: avgPrevious,
        });
      }
    }

    // Sort boncos by percentage descending
    boncos.sort((a, b) => b.percentage - a.percentage);

    // 6. Monthly trend (6 months)
    const monthlyTrend: Array<{ month: string; income: number; expense: number }> = [];
    const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - 1 - i, 1);
      const mFrom = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
      const mLastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
      const mTo = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(mLastDay).padStart(2, '0')}`;

      const { data: mTxs } = await supabase
        .from('transactions')
        .select('type, amount')
        .gte('date', mFrom)
        .lte('date', mTo);

      let mIncome = 0;
      let mExpense = 0;
      for (const tx of mTxs || []) {
        if (tx.type === 'income') mIncome += tx.amount;
        if (tx.type === 'expense') mExpense += tx.amount;
      }

      monthlyTrend.push({
        month: shortMonths[d.getMonth()],
        income: mIncome,
        expense: mExpense,
      });
    }

    return NextResponse.json({
      total_balance: totalBalance,
      monthly_income: monthlyIncome,
      monthly_expense: monthlyExpense,
      wallets: wallets || [],
      recent_transactions: recentTxs || [],
      daily_trend: dailyTrend,
      boncos_categories: boncos,
      monthly_trend: monthlyTrend,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch dashboard data';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
