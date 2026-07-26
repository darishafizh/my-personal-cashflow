'use client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCreateTransaction } from '@/hooks/use-transactions';
import { useWallets } from '@/hooks/use-wallets';
import { useCategories } from '@/hooks/use-categories';
import { useBudgets } from '@/hooks/use-budgets';
import CurrencyInput from '@/components/ui/currency-input';
import { ArrowLeft, Save } from 'lucide-react';
import type { TransactionType } from '@/lib/supabase/types';
import { todayString } from '@/lib/utils';

export default function NewTransactionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialType = (searchParams.get('type') || 'expense') as TransactionType;

  const { mutate: createTransaction, isPending } = useCreateTransaction();
  const { data: wallets } = useWallets();
  const { data: allCategories } = useCategories();
  const now = new Date();
  const { data: allBudgets } = useBudgets(now.getMonth() + 1, now.getFullYear());

  const [type, setType] = useState<TransactionType>(initialType);
  const [amount, setAmount] = useState(0);
  const [adminFee, setAdminFee] = useState(0);
  const [walletId, setWalletId] = useState('');
  const [destinationWalletId, setDestinationWalletId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [budgetId, setBudgetId] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(todayString());

  const categories = allCategories?.filter(c => c.type === type) || [];
  const activeBudgets = allBudgets?.filter(b => b.budget_type === type) || [];

  // Auto-select first wallet and category if available
  useEffect(() => {
    if (wallets?.length && !walletId) {
      setWalletId(wallets[0].id);
    }
  }, [wallets, walletId]);

  useEffect(() => {
    if (categories.length && !categoryId) {
      setCategoryId(categories[0].id);
    }
  }, [type, categories, categoryId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletId || amount <= 0) return;
    if (type === 'transfer' && (!destinationWalletId || walletId === destinationWalletId)) return;

    createTransaction(
      {
        type,
        amount,
        admin_fee: type === 'transfer' ? adminFee : 0,
        wallet_id: walletId,
        destination_wallet_id: type === 'transfer' ? destinationWalletId : undefined,
        category_id: type !== 'transfer' ? categoryId : undefined,
        budget_id: budgetId || undefined,
        description,
        date,
      },
      {
        onSuccess: () => {
          router.push('/transactions');
        },
      }
    );
  };

  return (
    <div className="flex flex-col min-h-dvh bg-background z-50 absolute inset-0">
      <div className="flex items-center gap-4 p-4 border-b border-border bg-surface/80 backdrop-blur-md sticky top-0 z-10">
        <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-raised hover:bg-white/5 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold">Catat Transaksi</h1>
      </div>

      <div className="p-4 flex-1">
        <form onSubmit={handleSubmit} className="space-y-6 animate-slide-up">
          
          {/* Type Tabs */}
          <div className="flex p-1 bg-surface-raised rounded-xl">
            {[
              { id: 'expense', label: 'Pengeluaran' },
              { id: 'income', label: 'Pemasukan' },
              { id: 'transfer', label: 'Transfer' },
            ].map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setType(t.id as TransactionType);
                  setCategoryId('');
                }}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                  type === t.id 
                    ? 'bg-surface shadow text-primary' 
                    : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <CurrencyInput
            label="Jumlah"
            value={amount}
            onChange={setAmount}
            placeholder="0"
          />

          {type === 'transfer' && (
            <CurrencyInput
              label="Biaya Admin (Opsional)"
              value={adminFee}
              onChange={setAdminFee}
              placeholder="0"
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                {type === 'transfer' ? 'Dari Dompet' : 'Dompet'}
              </label>
              <select
                value={walletId}
                onChange={e => setWalletId(e.target.value)}
                className="input-dark appearance-none"
                required
              >
                <option value="" disabled>Pilih Dompet</option>
                {wallets?.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
            
            {type === 'transfer' && (
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Ke Dompet</label>
                <select
                  value={destinationWalletId}
                  onChange={e => setDestinationWalletId(e.target.value)}
                  className="input-dark appearance-none"
                  required
                >
                  <option value="" disabled>Pilih Dompet</option>
                  {wallets?.map(w => (
                    <option key={w.id} value={w.id} disabled={w.id === walletId}>{w.name}</option>
                  ))}
                </select>
              </div>
            )}

            {type !== 'transfer' && (
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Kategori</label>
                <select
                  value={categoryId}
                  onChange={e => setCategoryId(e.target.value)}
                  className="input-dark appearance-none"
                  required
                >
                  <option value="" disabled>Pilih Kategori</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {(type === 'expense' || type === 'transfer') && (
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Masukkan ke Budget (Opsional)</label>
              <select
                value={budgetId}
                onChange={e => setBudgetId(e.target.value)}
                className="input-dark appearance-none"
              >
                <option value="">-- Tanpa Budget --</option>
                {activeBudgets.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Tanggal</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="input-dark"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Catatan (Opsional)</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="input-dark resize-none h-20"
              placeholder="Tambahkan detail transaksi..."
            />
          </div>

          <div className="pt-4 pb-8">
            <button
              type="submit"
              disabled={isPending || amount <= 0 || !walletId || (type === 'transfer' && !destinationWalletId)}
              className="w-full btn-gradient-primary py-4 flex items-center justify-center gap-2"
            >
              <Save size={20} />
              {isPending ? 'Menyimpan...' : 'Simpan Transaksi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
