'use client';

import { useDashboard } from '@/hooks/use-dashboard';
import { formatCurrency } from '@/lib/utils';
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
      
      {/* Removed Saldo Total Card as requested */}

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
            {formatCurrency(monthly_income)}
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
            {formatCurrency(monthly_expense)}
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
                  <span className="text-danger font-medium">{formatCurrency(b.spent)}</span>
                  <span className="text-text-muted text-xs ml-1">/ {formatCurrency(b.budget_limit)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Wallets Snippet Removed as requested */}

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
                <div key={t.id} className="flex items-center gap-3 p-4 group">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    t.type === 'income' ? 'bg-success/10 text-success' : 
                    t.type === 'expense' ? 'bg-danger/10 text-danger' : 
                    'bg-warning/10 text-warning'
                  }`}>
                    <span className="text-lg">{t.category?.icon || (t.type === 'transfer' ? '🔄' : '📦')}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-text-primary truncate">
                      {t.description || (t.type === 'transfer' ? 'Transfer' : 'Lainnya')}
                    </div>
                    <div className="text-xs text-text-muted truncate">
                      {t.wallet?.name} {t.destination_wallet && `→ ${t.destination_wallet.name}`}
                    </div>
                  </div>
                  <div className={`font-semibold tabular-nums text-right ${
                    t.type === 'income' ? 'text-success' : 
                    t.type === 'expense' ? 'text-danger' : 
                    'text-warning'
                  }`}>
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                    {t.type === 'transfer' && t.admin_fee > 0 && (
                      <div className="text-[10px] text-text-muted mt-0.5 font-normal">
                        + {formatCurrency(t.admin_fee)} admin
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
