'use client';

import { useState } from 'react';
import { useDebts, useCreateDebt } from '@/hooks/use-debts';
import { formatCurrency, formatDate, getDebtStatusLabel, getDebtStatusColor } from '@/lib/utils';
import LoadingSkeleton from '@/components/ui/loading-skeleton';
import EmptyState from '@/components/ui/empty-state';
import Modal from '@/components/ui/modal';
import CurrencyInput from '@/components/ui/currency-input';
import { Plus, ArrowLeft, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { DebtType } from '@/lib/supabase/types';
import Link from 'next/link';

export default function DebtsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<DebtType>('hutang');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: debts, isLoading } = useDebts({ type: tab });

  const totalRemaining = (debts || []).reduce((sum, d) => sum + d.remaining_amount, 0);

  return (
    <div className="flex flex-col min-h-dvh bg-background z-50 absolute inset-0 pb-20">
      <div className="flex items-center justify-between p-4 border-b border-border bg-surface/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-raised hover:bg-white/5 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold">Hutang & Piutang</h1>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="p-4 space-y-4 animate-fade-in flex-1">
        
        {/* Tabs */}
        <div className="flex p-1 bg-surface-raised rounded-xl mb-6">
          <button
            onClick={() => setTab('hutang')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${
              tab === 'hutang' ? 'bg-surface shadow text-danger' : 'text-text-muted'
            }`}
          >
            <ArrowUpRight size={16} /> Hutang Saya
          </button>
          <button
            onClick={() => setTab('piutang')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${
              tab === 'piutang' ? 'bg-surface shadow text-success' : 'text-text-muted'
            }`}
          >
            <ArrowDownLeft size={16} /> Piutang (Orang Lain)
          </button>
        </div>

        <div className="glass p-5 mb-6 text-center">
          <p className="text-sm text-text-secondary mb-1">
            Total {tab === 'hutang' ? 'Hutang Belum Dibayar' : 'Piutang Belum Ditagih'}
          </p>
          <p className={`text-2xl font-bold tabular-nums ${tab === 'hutang' ? 'text-danger' : 'text-success'}`}>
            {formatCurrency(totalRemaining)}
          </p>
        </div>

        {/* List */}
        {isLoading ? (
          <LoadingSkeleton count={3} />
        ) : debts?.length === 0 ? (
          <EmptyState 
            icon={tab === 'hutang' ? '💳' : '🤝'} 
            title={`Tidak ada data ${tab}`} 
            description={tab === 'hutang' ? 'Hebat! Anda tidak memiliki hutang saat ini.' : 'Belum ada catatan piutang orang lain ke Anda.'} 
          />
        ) : (
          <div className="space-y-3">
            {debts?.map(debt => (
              <Link key={debt.id} href={`/debts/${debt.id}`} className="block glass p-4 hover:bg-white/5 transition-colors animate-slide-up">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-text-primary text-lg">{debt.person_name}</h3>
                    <p className="text-xs text-text-muted">{debt.description || 'Tidak ada catatan'}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-md bg-surface-raised ${getDebtStatusColor(debt.status)}`}>
                    {getDebtStatusLabel(debt.status)}
                  </span>
                </div>
                
                <div className="flex justify-between items-end mt-4 pt-3 border-t border-white/5">
                  <div>
                    <p className="text-xs text-text-muted mb-0.5">Sisa Tagihan</p>
                    <p className={`font-semibold tabular-nums ${tab === 'hutang' ? 'text-danger' : 'text-success'}`}>
                      {formatCurrency(debt.remaining_amount)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-text-muted mb-0.5">Total Keseluruhan</p>
                    <p className="font-medium text-sm tabular-nums text-text-secondary">
                      {formatCurrency(debt.total_amount)}
                    </p>
                  </div>
                </div>
                

              </Link>
            ))}
          </div>
        )}
      </div>

      <AddDebtModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} defaultType={tab} />
    </div>
  );
}

function AddDebtModal({ isOpen, onClose, defaultType }: { isOpen: boolean; onClose: () => void; defaultType: DebtType }) {
  const { mutate: createDebt, isPending } = useCreateDebt();
  const [type, setType] = useState<DebtType>(defaultType);
  const [personName, setPersonName] = useState('');
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!personName.trim() || amount <= 0) return;

    createDebt(
      { type, person_name: personName, total_amount: amount, description },
      {
        onSuccess: () => {
          onClose();
          setPersonName('');
          setAmount(0);
          setDescription('');
        }
      }
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={defaultType === 'hutang' ? "Catat Hutang Baru" : "Catat Piutang Baru"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">Nama Peminjam / Yang Dihutangi</label>
          <input
            type="text"
            value={personName}
            onChange={(e) => setPersonName(e.target.value)}
            className="input-dark"
            placeholder="Mis: Budi, Kartu Kredit BCA"
            required
          />
        </div>

        <CurrencyInput
          label="Total Jumlah"
          value={amount}
          onChange={setAmount}
          placeholder="0"
        />

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">Catatan (Opsional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input-dark resize-none h-20"
            placeholder="Tujuan pinjaman, dsb..."
          />
        </div>

        <div className="pt-4 pb-4">
          <button
            type="submit"
            disabled={!personName.trim() || amount <= 0 || isPending}
            className="w-full btn-gradient-primary py-3.5"
          >
            {isPending ? 'Menyimpan...' : 'Simpan Data'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
