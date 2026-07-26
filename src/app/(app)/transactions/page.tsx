'use client';

import { useState } from 'react';
import { useTransactions } from '@/hooks/use-transactions';
import { formatCurrency, formatDate, getTransactionMeta } from '@/lib/utils';
import LoadingSkeleton from '@/components/ui/loading-skeleton';
import EmptyState from '@/components/ui/empty-state';
import Link from 'next/link';

import type { Transaction } from '@/lib/supabase/types';

export default function TransactionsPage() {
  const [filterType, setFilterType] = useState<string>('');
  const { data, isLoading } = useTransactions({ type: filterType || undefined });

  return (
    <div className="p-4 space-y-4 animate-fade-in pb-20">
      <div>
        <h1 className="text-2xl font-bold text-text-primary mb-1">Riwayat Transaksi</h1>
        <p className="text-sm text-text-muted">Semua pergerakan uang Anda</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 -mx-4 px-4 snap-x">
        {[
          { id: '', label: 'Semua' },
          { id: 'expense', label: 'Pengeluaran' },
          { id: 'income', label: 'Pemasukan' },
          { id: 'transfer', label: 'Transfer' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap snap-center transition-colors ${
              filterType === tab.id 
                ? 'bg-primary text-[#0A0A1A]' 
                : 'bg-surface border border-border text-text-muted hover:text-text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Transactions List */}
      {isLoading ? (
        <LoadingSkeleton count={5} />
      ) : data?.data.length === 0 ? (
        <EmptyState 
          icon="📝" 
          title="Belum ada transaksi" 
          description="Riwayat transaksi Anda akan muncul di sini." 
        />
      ) : (
        <div className="space-y-4">
          {Object.entries(
            // Group by date
            (data?.data || []).reduce((acc, tx) => {
              const date = tx.date;
              if (!acc[date]) acc[date] = [];
              acc[date].push(tx);
              return acc;
            }, {} as Record<string, typeof data extends { data: infer T } ? T : any>)
          ).sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
           .map(([date, txs]) => (
            <div key={date} className="animate-slide-up">
              <h3 className="text-xs font-semibold text-text-muted mb-2 px-1">
                {formatDate(date)}
              </h3>
              <div className="glass overflow-hidden">
                <div className="divide-y divide-border">
                  {txs.map((tx: any) => {
                    const meta = getTransactionMeta(tx.type);
                    return (
                      <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${meta.bg} ${meta.color}`}>
                            <span className="text-lg">{tx.category?.icon || meta.icon}</span>
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-text-primary truncate">
                              {tx.category?.name || tx.description || meta.label}
                            </div>
                            <div className="text-xs text-text-muted truncate">
                              {tx.wallet?.name} {tx.destination_wallet && `→ ${tx.destination_wallet.name}`}
                            </div>
                          </div>
                        </div>
                        <div className={`font-semibold tabular-nums text-right whitespace-nowrap pl-2 ${
                          tx.type === 'income' ? 'text-success' : 'text-text-primary'
                        }`}>
                          {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
