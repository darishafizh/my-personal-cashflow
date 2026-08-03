'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDebt, useDeleteDebt, useCreatePayment, useUpdateDebt } from '@/hooks/use-debts';
import { useWallets } from '@/hooks/use-wallets';
import { formatCurrency, formatDate, getDebtStatusLabel, getDebtStatusColor } from '@/lib/utils';
import LoadingSkeleton from '@/components/ui/loading-skeleton';
import EmptyState from '@/components/ui/empty-state';
import { ArrowLeft, Trash2, Edit3, Plus } from 'lucide-react';
import Modal from '@/components/ui/modal';
import CurrencyInput from '@/components/ui/currency-input';
import ConfirmDialog from '@/components/ui/confirm-dialog';

export default function DebtDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  const { data: debt, isLoading } = useDebt(id);
  const { data: wallets } = useWallets();
  const { mutate: deleteDebt, isPending: isDeleting } = useDeleteDebt();
  const { mutate: createPayment, isPending: isPaying } = useCreatePayment();
  const { mutate: updateDebt, isPending: isUpdating } = useUpdateDebt();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Edit State
  const [editName, setEditName] = useState('');
  const [editAmount, setEditAmount] = useState(0);
  const [editDesc, setEditDesc] = useState('');

  // Payment State
  const [payAmount, setPayAmount] = useState(0);
  const [payNote, setPayNote] = useState('');
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
  const [payWalletId, setPayWalletId] = useState('');

  const openEditModal = () => {
    if (debt) {
      setEditName(debt.person_name);
      setEditAmount(debt.total_amount);
      setEditDesc(debt.description || '');
      setIsEditModalOpen(true);
    }
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || editAmount <= 0) return;
    
    updateDebt(
      { id, data: { person_name: editName, total_amount: editAmount, description: editDesc } },
      { onSuccess: () => setIsEditModalOpen(false) }
    );
  };

  const handleDelete = () => {
    deleteDebt(id, {
      onSuccess: () => {
        router.push(`/debts?type=${debt?.type || 'hutang'}`);
      }
    });
  };

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (payAmount <= 0 || !payWalletId) return;

    createPayment(
      { debtId: id, data: { amount: payAmount, note: payNote, paid_at: payDate, wallet_id: payWalletId } },
      {
        onSuccess: () => {
          setIsPaymentModalOpen(false);
          setPayAmount(0);
          setPayNote('');
          setPayWalletId('');
        },
        onError: (err) => {
          alert('Gagal menyimpan pembayaran: ' + (err instanceof Error ? err.message : 'Unknown error'));
        }
      }
    );
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <LoadingSkeleton count={3} />
      </div>
    );
  }

  if (!debt) {
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-[50vh]">
        <EmptyState icon="⚠️" title="Tidak Ditemukan" description="Data tidak ditemukan atau sudah dihapus." />
        <button onClick={() => router.back()} className="mt-4 text-primary">Kembali</button>
      </div>
    );
  }

  const isHutang = debt.type === 'hutang';

  return (
    <div className="flex flex-col min-h-dvh bg-background z-50 absolute inset-0 pb-20">
      <div className="flex items-center justify-between p-4 border-b border-border bg-surface/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push(`/debts?type=${debt.type}`)} className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-raised hover:bg-white/5 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold">Detail {isHutang ? 'Hutang' : 'Piutang'}</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={openEditModal} className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-raised text-primary">
            <Edit3 size={18} />
          </button>
          <button onClick={() => setShowDeleteConfirm(true)} className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-raised text-danger">
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-6 flex-1">
        
        {/* Info Card */}
        <div className="glass p-5">
          <h2 className="text-sm text-text-secondary mb-1">{isHutang ? 'Hutang Kepada' : 'Piutang Dari'}</h2>
          <h3 className="text-2xl font-bold text-white mb-4">{debt.person_name}</h3>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-text-muted mb-1">Total {isHutang ? 'Hutang' : 'Piutang'}</p>
              <p className="font-semibold text-text-secondary tabular-nums">{formatCurrency(debt.total_amount)}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted mb-1">Sisa Tagihan</p>
              <p className={`font-semibold tabular-nums ${isHutang ? 'text-danger' : 'text-success'}`}>
                {formatCurrency(debt.remaining_amount)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold px-2 py-1 rounded-md bg-surface-raised ${getDebtStatusColor(debt.status)}`}>
              {getDebtStatusLabel(debt.status)}
            </span>
          </div>
          
          {debt.description && (
            <div className="mt-4 pt-4 border-t border-white/5">
              <p className="text-xs text-text-muted mb-1">Catatan</p>
              <p className="text-sm">{debt.description}</p>
            </div>
          )}
        </div>

        {/* Payments List */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-text-primary">Riwayat Pembayaran</h3>
            {debt.remaining_amount > 0 && (
              <button 
                onClick={() => setIsPaymentModalOpen(true)}
                className="text-sm font-medium text-primary flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-full"
              >
                <Plus size={16} /> Catat Bayar
              </button>
            )}
          </div>

          {!debt.payments || debt.payments.length === 0 ? (
            <div className="glass p-6 text-center text-sm text-text-muted">
              Belum ada riwayat pembayaran.
            </div>
          ) : (
            <div className="glass overflow-hidden">
              <div className="divide-y divide-border">
                {debt.payments.map((p) => (
                  <div key={p.id} className="flex justify-between items-center p-4">
                    <div>
                      <p className="font-medium">{formatCurrency(p.amount)}</p>
                      <p className="text-xs text-text-muted">{formatDate(p.paid_at)} {p.note && `• ${p.note}`}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Data">
        <form onSubmit={handleEdit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              {isHutang ? 'Nama Pemberi Pinjaman' : 'Nama Peminjam'}
            </label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="input-dark"
              required
            />
          </div>
          <CurrencyInput label="Total Jumlah" value={editAmount} onChange={setEditAmount} />
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Catatan</label>
            <textarea
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              className="input-dark resize-none h-20"
            />
          </div>
          <button type="submit" disabled={isUpdating} className="w-full btn-gradient-primary py-3.5 mt-4">
            {isUpdating ? 'Menyimpan...' : 'Update Data'}
          </button>
        </form>
      </Modal>

      {/* Payment Modal */}
      <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title={isHutang ? 'Bayar Hutang' : 'Terima Pembayaran'}>
        <form onSubmit={handlePayment} className="space-y-4">
          <CurrencyInput label="Jumlah Bayar" value={payAmount} onChange={setPayAmount} />
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              {isHutang ? 'Bayar dari Dompet' : 'Masuk ke Dompet'}
            </label>
            <select
              value={payWalletId}
              onChange={e => setPayWalletId(e.target.value)}
              className="input-dark appearance-none"
              required
            >
              <option value="" disabled>Pilih Dompet</option>
              {wallets?.map(w => (
                <option key={w.id} value={w.id}>{w.icon} {w.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Tanggal</label>
            <input
              type="date"
              value={payDate}
              onChange={(e) => setPayDate(e.target.value)}
              className="input-dark"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Catatan (Opsional)</label>
            <input
              type="text"
              value={payNote}
              onChange={(e) => setPayNote(e.target.value)}
              className="input-dark"
            />
          </div>
          <button type="submit" disabled={isPaying || payAmount <= 0 || !payWalletId} className="w-full btn-gradient-primary py-3.5 mt-4">
            {isPaying ? 'Menyimpan...' : 'Simpan Pembayaran'}
          </button>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Hapus Data?"
        message={`Yakin ingin menghapus ${isHutang ? 'hutang' : 'piutang'} ini beserta semua riwayat pembayarannya?`}
        confirmText="Ya, Hapus"
      />
    </div>
  );
}
