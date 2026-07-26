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

    if (tx) {
      // Revert source wallet
      const { data: sourceWallet } = await supabase.from('wallets').select('balance').eq('id', tx.wallet_id).single();
      if (sourceWallet) {
        let newSourceBalance = sourceWallet.balance;
        if (tx.type === 'expense') newSourceBalance += tx.amount;
        else if (tx.type === 'income') newSourceBalance -= tx.amount;
        else if (tx.type === 'transfer') {
          newSourceBalance += (tx.amount + (tx.admin_fee || 0));
          
          // Revert destination wallet
          if (tx.destination_wallet_id) {
            const { data: destWallet } = await supabase.from('wallets').select('balance').eq('id', tx.destination_wallet_id).single();
            if (destWallet) {
              await supabase.from('wallets').update({ balance: destWallet.balance - tx.amount }).eq('id', tx.destination_wallet_id);
            }
          }
        }
        await supabase.from('wallets').update({ balance: newSourceBalance }).eq('id', tx.wallet_id);
      }
    }

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
    if (oldTx) {
      // Revert old transaction
      const { data: sourceWallet } = await supabase.from('wallets').select('balance').eq('id', oldTx.wallet_id).single();
      if (sourceWallet) {
        let revertBal = sourceWallet.balance;
        if (oldTx.type === 'expense') revertBal += oldTx.amount;
        else if (oldTx.type === 'income') revertBal -= oldTx.amount;
        else if (oldTx.type === 'transfer') {
          revertBal += (oldTx.amount + (oldTx.admin_fee || 0));
          if (oldTx.destination_wallet_id) {
            const { data: destWallet } = await supabase.from('wallets').select('balance').eq('id', oldTx.destination_wallet_id).single();
            if (destWallet) await supabase.from('wallets').update({ balance: destWallet.balance - oldTx.amount }).eq('id', oldTx.destination_wallet_id);
          }
        }
        await supabase.from('wallets').update({ balance: revertBal }).eq('id', oldTx.wallet_id);
      }
    }

    // 2. Apply new transaction logic
    const { data: newSourceWallet } = await supabase.from('wallets').select('balance').eq('id', body.wallet_id).single();
    if (newSourceWallet) {
      let applyBal = newSourceWallet.balance;
      if (body.type === 'expense') applyBal -= body.amount;
      else if (body.type === 'income') applyBal += body.amount;
      else if (body.type === 'transfer') {
        applyBal -= (body.amount + (body.admin_fee || 0));
        if (body.destination_wallet_id) {
          const { data: destWallet } = await supabase.from('wallets').select('balance').eq('id', body.destination_wallet_id).single();
          if (destWallet) await supabase.from('wallets').update({ balance: destWallet.balance + body.amount }).eq('id', body.destination_wallet_id);
        }
      }
      await supabase.from('wallets').update({ balance: applyBal }).eq('id', body.wallet_id);
    }

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
