'use client';

import { useState } from 'react';
import { useWallets, useCreateWallet, useUpdateWallet, useDeleteWallet } from '@/hooks/use-wallets';
import { formatCurrency } from '@/lib/utils';
import LoadingSkeleton from '@/components/ui/loading-skeleton';
import EmptyState from '@/components/ui/empty-state';
import Modal from '@/components/ui/modal';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import CurrencyInput from '@/components/ui/currency-input';
import { Wallet as WalletIcon, Plus, CreditCard, Banknote, HelpCircle, Edit3, Trash2 } from 'lucide-react';
import type { WalletType, Wallet } from '@/lib/supabase/types';

export default function WalletsPage() {
  const { data: wallets, isLoading } = useWallets();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);

  if (isLoading) return <div className="p-4"><LoadingSkeleton count={4} /></div>;

  const totalBalance = (wallets || []).reduce((sum, w) => sum + w.balance, 0);

  return (
    <div className="p-4 space-y-6 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-1">Dompet</h1>
          <p className="text-sm text-text-muted">Kelola akun dan saldo Anda</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="btn-gradient-primary w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
          aria-label="Tambah Dompet"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="glass p-5 flex flex-col gap-1">
        <span className="text-sm text-text-secondary">Total Saldo Semua Dompet</span>
        <span className="text-2xl font-bold tabular-nums text-white">{formatCurrency(totalBalance)}</span>
      </div>

      <div className="space-y-3">
        {wallets?.length === 0 ? (
          <EmptyState icon="💳" title="Belum ada dompet" description="Tambahkan dompet pertama Anda." />
        ) : (
          wallets?.map(w => (
            <div 
              key={w.id} 
              className="glass p-4 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer" 
              style={w.color ? { borderLeftColor: w.color, borderLeftWidth: '4px' } : {}}
              onClick={() => setEditingWallet(w)}
            >
              <div className="flex items-center gap-4">
                <div className="text-2xl bg-surface-raised w-12 h-12 rounded-xl flex items-center justify-center">
                  {w.icon || '💳'}
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary">{w.name}</h3>
                  <p className="text-xs text-text-muted capitalize">{w.type}</p>
                </div>
              </div>
              <div className="font-semibold tabular-nums text-right">
                {formatCurrency(w.balance)}
              </div>
            </div>
          ))
        )}
      </div>

      <AddWalletModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
      {editingWallet && (
        <EditWalletModal 
          wallet={editingWallet} 
          isOpen={true} 
          onClose={() => setEditingWallet(null)} 
        />
      )}
    </div>
  );
}

function AddWalletModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { mutate: createWallet, isPending } = useCreateWallet();
  const [name, setName] = useState('');
  const [type, setType] = useState<WalletType>('ewallet');
  const [balance, setBalance] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let icon = '💳';
    if (type === 'bank') icon = '🏦';
    if (type === 'cash') icon = '💵';

    createWallet(
      { name, type, initial_balance: balance, icon },
      {
        onSuccess: () => {
          onClose();
          setName('');
          setType('ewallet');
          setBalance(0);
        }
      }
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tambah Dompet">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">Nama Dompet</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-dark"
            placeholder="Mis: BCA, Gopay, Dompet Tunai"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">Tipe</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'bank', label: 'Bank', icon: Banknote },
              { id: 'ewallet', label: 'E-Wallet', icon: CreditCard },
              { id: 'cash', label: 'Tunai', icon: WalletIcon },
              { id: 'other', label: 'Lainnya', icon: HelpCircle },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setType(t.id as WalletType)}
                className={`flex items-center gap-2 p-3 rounded-xl border transition-all text-sm font-medium ${
                  type === t.id 
                    ? 'border-primary bg-primary/10 text-primary' 
                    : 'border-border bg-surface text-text-muted hover:border-text-muted'
                }`}
              >
                <t.icon size={16} />
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <CurrencyInput
          label="Saldo Awal (Opsional)"
          value={balance}
          onChange={setBalance}
          placeholder="0"
        />

        <div className="pt-4">
          <button
            type="submit"
            disabled={!name.trim() || isPending}
            className="w-full btn-gradient-primary py-3.5"
          >
            {isPending ? 'Menyimpan...' : 'Simpan Dompet'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function EditWalletModal({ wallet, isOpen, onClose }: { wallet: Wallet; isOpen: boolean; onClose: () => void }) {
  const { mutate: updateWallet, isPending: isUpdating } = useUpdateWallet();
  const { mutate: deleteWallet, isPending: isDeleting } = useDeleteWallet();
  
  const [name, setName] = useState(wallet.name);
  const [type, setType] = useState<WalletType>(wallet.type);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let icon = '💳';
    if (type === 'bank') icon = '🏦';
    if (type === 'cash') icon = '💵';

    updateWallet(
      { id: wallet.id, data: { name, type, icon } },
      { onSuccess: onClose }
    );
  };

  const handleDeleteClick = () => {
    setShowConfirm(true);
  };

  const executeDelete = () => {
    deleteWallet(wallet.id, { onSuccess: onClose });
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Edit Dompet">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">Nama Dompet</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-dark"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">Tipe</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'bank', label: 'Bank', icon: Banknote },
              { id: 'ewallet', label: 'E-Wallet', icon: CreditCard },
              { id: 'cash', label: 'Tunai', icon: WalletIcon },
              { id: 'other', label: 'Lainnya', icon: HelpCircle },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setType(t.id as WalletType)}
                className={`flex items-center gap-2 p-3 rounded-xl border transition-all text-sm font-medium ${
                  type === t.id 
                    ? 'border-primary bg-primary/10 text-primary' 
                    : 'border-border bg-surface text-text-muted hover:border-text-muted'
                }`}
              >
                <t.icon size={16} />
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4 flex gap-3">
          <button
            type="button"
            onClick={handleDeleteClick}
            disabled={isUpdating || isDeleting}
            className="w-1/3 py-3.5 flex items-center justify-center rounded-xl bg-danger/10 text-danger font-semibold hover:bg-danger/20 transition-colors"
          >
            <Trash2 size={20} />
          </button>
          <button
            type="submit"
            disabled={!name.trim() || isUpdating || isDeleting}
            className="w-2/3 btn-gradient-primary py-3.5 flex items-center justify-center gap-2"
          >
            <Edit3 size={20} />
            {isUpdating ? 'Menyimpan...' : 'Update Dompet'}
          </button>
        </div>
      </form>
    </Modal>
    
    <ConfirmDialog
      isOpen={showConfirm}
      onClose={() => setShowConfirm(false)}
      onConfirm={executeDelete}
      title="Hapus Dompet?"
      message={`Yakin ingin menghapus dompet "${wallet.name}"? Semua transaksi yang terkait dengan dompet ini juga akan terhapus.`}
      confirmText="Ya, Hapus"
    />
    </>
  );
}
