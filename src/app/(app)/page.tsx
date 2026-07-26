'use client';

import { useDashboard } from '@/hooks/use-dashboard';
import { formatCurrency, formatCompactCurrency } from '@/lib/utils';
import { DashboardSkeleton } from '@/components/ui/loading-skeleton';
import EmptyState from '@/components/ui/empty-state';
import Link from 'next/link';
import { ArrowRight, TrendingUp, TrendingDown, Wallet, AlertCircle } from 'lucide-react';

export default function DashboardPage() {
  const { data, isLoading, error } = useDashboard();

  if (isLoading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="p-4 pt-10 flex flex-col items-center justify-center min-h-[50vh]">
        <EmptyState 
          icon="⚠️" 
          title="Gagal memuat data" 
          description="Terjadi kesalahan saat mengambil data dashboard." 
        />
      </div>
    );
  }

  const {
    total_balance = 0,
    monthly_income = 0,
    monthly_expense = 0,
    wallets = [],
    recent_transactions = [],
    boncos_categories = [],
  } = data || {};

  return (
    <div className="p-4 space-y-6 pb-24 animate-fade-in">
      
      {/* Header / Saldo Total */}
      <div className="pt-2 pb-4 text-center">
        <h2 className="text-text-muted text-sm font-medium mb-1">Total Saldo</h2>
        <div className="text-4xl font-bold tracking-tight text-white tabular-nums mb-2">
          {formatCurrency(total_balance)}
        </div>
      </div>

      {/* Income / Expense Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-sm p-3.5 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-success">
            <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center">
              <TrendingUp size={14} />
            </div>
            <span className="text-xs font-semibold">Pemasukan</span>
          </div>
          <div className="font-semibold text-lg tabular-nums">
            {formatCompactCurrency(monthly_income)}
          </div>
        </div>

        <div className="glass-sm p-3.5 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-danger">
            <div className="w-6 h-6 rounded-full bg-danger/10 flex items-center justify-center">
              <TrendingDown size={14} />
            </div>
            <span className="text-xs font-semibold">Pengeluaran</span>
          </div>
          <div className="font-semibold text-lg tabular-nums">
            {formatCompactCurrency(monthly_expense)}
          </div>
        </div>
      </div>

      {/* Boncos Alert */}
      {boncos_categories.length > 0 && (
        <div className="glass-sm border-warning/30 bg-warning/5 p-4 animate-slide-up">
          <div className="flex items-center gap-2 text-warning mb-2">
            <AlertCircle size={18} />
            <h3 className="font-semibold text-sm">Peringatan Budget</h3>
          </div>
          <div className="space-y-3 mt-3">
            {boncos_categories.slice(0, 2).map((b, i) => (
              <div key={i} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <span>{b.category_icon}</span>
                  <span className="text-text-secondary">{b.category_name}</span>
                </div>
                <div className="text-right">
                  <span className="text-danger font-medium">{formatCompactCurrency(b.spent)}</span>
                  <span className="text-text-muted text-xs ml-1">/ {formatCompactCurrency(b.budget_limit)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Wallets Snippet */}
      <div>
        <div className="flex justify-between items-center mb-3 px-1">
          <h3 className="font-semibold text-text-primary">Dompet Saya</h3>
          <Link href="/wallets" className="text-xs font-medium text-primary flex items-center gap-1 hover:underline">
            Semua <ArrowRight size={14} />
          </Link>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x hide-scrollbar">
          {wallets.length === 0 ? (
            <div className="glass-sm w-[200px] p-4 flex-shrink-0 flex flex-col items-center justify-center min-h-[100px] text-center snap-center">
              <Wallet className="text-text-muted mb-2" size={24} />
              <p className="text-xs text-text-muted">Belum ada dompet</p>
            </div>
          ) : (
            wallets.map((w) => (
              <div key={w.id} className="glass-sm min-w-[160px] p-4 flex-shrink-0 flex flex-col justify-between snap-center" style={w.color ? { borderTopColor: w.color, borderTopWidth: '3px' } : {}}>
                <div className="flex items-center gap-2 mb-3 text-sm font-medium text-text-secondary">
                  <span>{w.icon || '💳'}</span>
                  <span className="truncate">{w.name}</span>
                </div>
                <div className="font-semibold tabular-nums">
                  {formatCompactCurrency(w.balance)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="flex justify-between items-center mb-3 px-1">
          <h3 className="font-semibold text-text-primary">Transaksi Terakhir</h3>
          <Link href="/transactions" className="text-xs font-medium text-primary flex items-center gap-1 hover:underline">
            Semua <ArrowRight size={14} />
          </Link>
        </div>
        
        {recent_transactions.length === 0 ? (
          <div className="glass p-6 text-center text-sm text-text-muted">
            Belum ada transaksi
          </div>
        ) : (
          <div className="glass overflow-hidden">
            <div className="divide-y divide-border">
              {recent_transactions.map((t) => (
                <Link key={t.id} href={`/transactions/${t.id}`} className="flex items-center gap-3 p-4 hover:bg-white/5 transition-colors">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    t.type === 'income' ? 'bg-success/10 text-success' : 
                    t.type === 'expense' ? 'bg-danger/10 text-danger' : 
                    'bg-blue-400/10 text-blue-400'
                  }`}>
                    <span className="text-lg">{t.category?.icon || (t.type === 'transfer' ? '🔄' : '📦')}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-text-primary truncate">
                      {t.category?.name || (t.type === 'transfer' ? 'Transfer' : 'Lainnya')}
                    </div>
                    <div className="text-xs text-text-muted truncate">
                      {t.wallet?.name} {t.destination_wallet && `→ ${t.destination_wallet.name}`}
                    </div>
                  </div>
                  <div className={`font-semibold tabular-nums text-right ${
                    t.type === 'income' ? 'text-success' : 
                    t.type === 'expense' ? 'text-text-primary' : 
                    'text-text-primary'
                  }`}>
                    {t.type === 'income' ? '+' : '-'}{formatCompactCurrency(t.amount)}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
