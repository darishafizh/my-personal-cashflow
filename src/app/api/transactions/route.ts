import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const supabase = createServerClient();

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type');
    const walletId = searchParams.get('wallet_id');
    const categoryId = searchParams.get('category_id');
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');
    const budgetId = searchParams.get('budget_id');

    let query = supabase
      .from('transactions')
      .select('*, category:categories(*), wallet:wallets!transactions_wallet_id_fkey(*), destination_wallet:wallets!transactions_destination_wallet_id_fkey(*)', { count: 'exact' });

    if (type) query = query.eq('type', type);
    if (walletId) query = query.or(`wallet_id.eq.${walletId},destination_wallet_id.eq.${walletId}`);
    if (categoryId) query = query.eq('category_id', categoryId);
    if (budgetId) query = query.eq('budget_id', budgetId);
    if (dateFrom) query = query.gte('date', dateFrom);
    if (dateTo) query = query.lte('date', dateTo);

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await query
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    return NextResponse.json({
      data: data || [],
      total: count || 0,
      page,
      limit,
      hasMore: (count || 0) > page * limit,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch transactions';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        type: body.type,
        amount: body.amount,
        admin_fee: body.admin_fee || 0,
        description: body.description || null,
        category_id: body.category_id || null,
        wallet_id: body.wallet_id,
        destination_wallet_id: body.destination_wallet_id || null,
        budget_id: body.budget_id || null,
        date: body.date,
      })
      .select('*, category:categories(*), wallet:wallets!transactions_wallet_id_fkey(*), destination_wallet:wallets!transactions_destination_wallet_id_fkey(*)')
      .single();

    if (error) throw error;

    // UPDATE WALLET BALANCES MANUALLY
    // 1. Get current wallet
    const { data: sourceWallet } = await supabase
      .from('wallets')
      .select('balance')
      .eq('id', body.wallet_id)
      .single();

    if (sourceWallet) {
      let newSourceBalance = sourceWallet.balance;
      
      if (body.type === 'expense') {
        newSourceBalance -= body.amount;
      } else if (body.type === 'income') {
        newSourceBalance += body.amount;
      } else if (body.type === 'transfer') {
        newSourceBalance -= (body.amount + (body.admin_fee || 0));
        
        // Update destination wallet
        if (body.destination_wallet_id) {
          const { data: destWallet } = await supabase
            .from('wallets')
            .select('balance')
            .eq('id', body.destination_wallet_id)
            .single();
            
          if (destWallet) {
            await supabase
              .from('wallets')
              .update({ balance: destWallet.balance + body.amount })
              .eq('id', body.destination_wallet_id);
          }
        }
      }

      await supabase
        .from('wallets')
        .update({ balance: newSourceBalance })
        .eq('id', body.wallet_id);
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create transaction';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
