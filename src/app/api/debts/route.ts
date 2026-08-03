import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const supabase = createServerClient();

    let query = supabase
      .from('debts')
      .select('*')
      .order('created_at', { ascending: false });

    if (type) query = query.eq('type', type);
    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw error;

    // Compute status dynamically from remaining_amount
    const enrichedData = (data || []).map((d: { remaining_amount: number; total_amount: number; status: string }) => {
      let computedStatus = 'belum_lunas';
      if (d.remaining_amount === 0) computedStatus = 'lunas';
      else if (d.remaining_amount < d.total_amount) computedStatus = 'sebagian';
      return { ...d, status: computedStatus };
    });

    return NextResponse.json(enrichedData);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch debts';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = createServerClient();

    // Build insert data — only include wallet_id if the column exists
    const insertData: Record<string, unknown> = {
      type: body.type,
      person_name: body.person_name,
      total_amount: body.total_amount,
      remaining_amount: body.total_amount,
      description: body.description || null,
      due_date: body.due_date || null,
    };

    // (We do not insert wallet_id to the debts table to avoid schema column missing errors)

    const { data, error } = await supabase
      .from('debts')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Insert debt error:', error);
      throw new Error(`Gagal menyimpan data ke database: ${error.message}`);
    }

    // Integrate with wallet
    if (body.wallet_id) {
      const { data: wallet, error: wErr } = await supabase
        .from('wallets')
        .select('balance')
        .eq('id', body.wallet_id)
        .single();
      
      if (wErr) {
        console.error('Wallet fetch error:', wErr);
        throw new Error(`Gagal membaca dompet: ${wErr.message}`);
      }

      const currentBalance = Number(wallet.balance);
      const amount = Number(body.total_amount);
      const newBalance = body.type === 'hutang'
        ? currentBalance + amount   // hutang: uang masuk
        : currentBalance - amount;  // piutang: uang keluar

      const { error: updateErr } = await supabase
        .from('wallets')
        .update({ balance: newBalance, updated_at: new Date().toISOString() })
        .eq('id', body.wallet_id);

      if (updateErr) {
        console.error('Wallet update error:', updateErr);
        throw new Error(`Gagal update saldo dompet: ${updateErr.message}`);
      }
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create debt';
    console.error('API Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
