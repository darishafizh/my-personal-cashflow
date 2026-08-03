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

    // Fetch current debt info (without wallet_id to avoid schema issues)
    const { data: currentDebt, error: fetchError } = await supabase
      .from('debts')
      .select('remaining_amount, total_amount, type')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Fetch debt error:', fetchError);
      throw new Error(`Gagal mengambil data hutang: ${fetchError.message}`);
    }

    // Insert payment record
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

    if (error) {
      console.error('Insert payment error:', error);
      throw new Error(`Gagal menyimpan pembayaran: ${error.message}`);
    }

    // Update remaining amount (status is computed on read to avoid enum cast issues)
    let newRemaining = Number(currentDebt.remaining_amount) - Number(body.amount);
    if (newRemaining < 0) newRemaining = 0;

    const { error: updateError } = await supabase
      .from('debts')
      .update({
        remaining_amount: newRemaining,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) {
      console.error('Update debt error:', updateError);
      throw new Error(`Gagal update sisa tagihan: ${updateError.message}`);
    }

    // Integrate with wallet using wallet_id from request body
    const paymentWalletId = body.wallet_id;
    if (paymentWalletId) {
      const { data: wallet, error: wErr } = await supabase
        .from('wallets')
        .select('balance')
        .eq('id', paymentWalletId)
        .single();

      if (wErr) {
        console.error('Fetch wallet error:', wErr);
        throw new Error(`Gagal mengambil data dompet: ${wErr.message}`);
      }

      const currentBalance = Number(wallet.balance);
      const paymentAmount = Number(body.amount);
      // Hutang payment: uang KELUAR dari dompet (bayar hutang)
      // Piutang payment: uang MASUK ke dompet (terima pembayaran)
      const newBalance = currentDebt.type === 'hutang'
        ? currentBalance - paymentAmount
        : currentBalance + paymentAmount;

      const { error: wUpdateErr } = await supabase
        .from('wallets')
        .update({ balance: newBalance, updated_at: new Date().toISOString() })
        .eq('id', paymentWalletId);

      if (wUpdateErr) {
        console.error('Update wallet error:', wUpdateErr);
        throw new Error(`Gagal update saldo dompet: ${wUpdateErr.message}`);
      }
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create payment';
    console.error('Payment API error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
