'use client';

import { useState } from 'react';
import { useBudgets, useCreateBudget, useUpdateBudget, useDeleteBudget } from '@/hooks/use-budgets';
import { useCategories } from '@/hooks/use-categories';
import { formatCurrency, formatCompactCurrency, getMonthName } from '@/lib/utils';
import LoadingSkeleton from '@/components/ui/loading-skeleton';
import EmptyState from '@/components/ui/empty-state';
import ProgressBar from '@/components/ui/progress-bar';
import Modal from '@/components/ui/modal';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import CurrencyInput from '@/components/ui/currency-input';
import { ChevronLeft, ChevronRight, Plus, AlertTriangle, CheckCircle2, Edit3, Trash2 } from 'lucide-react';
import type { BudgetType, Budget } from '@/lib/supabase/types';
import { useWallets } from '@/hooks/use-wallets';

export default function BudgetPage() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  const { data: budgets, isLoading } = useBudgets(month, year);

  const prevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear(y => y - 1);
    } else {
      setMonth(m => m - 1);
    }
  };

  const nextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear(y => y + 1);
    } else {
      setMonth(m => m + 1);
    }
  };

  const totalBudget = (budgets || []).reduce((sum, b) => sum + b.limit_amount, 0);
  const totalSpent = (budgets || []).reduce((sum, b) => sum + (b.spent || 0), 0);
  const overallPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return (
    <div className="p-4 space-y-5 pb-20">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-bold text-text-primary">Budget</h1>
        <div className="flex items-center gap-3 bg-surface-raised px-2 py-1.5 rounded-full border border-border">
          <button onClick={prevMonth} className="p-1 text-text-muted hover:text-text-primary"><ChevronLeft size={18} /></button>
          <span className="text-sm font-medium min-w-[80px] text-center">
            {getMonthName(month)} {year}
          </span>
          <button onClick={nextMonth} className="p-1 text-text-muted hover:text-text-primary"><ChevronRight size={18} /></button>
        </div>
      </div>

      {isLoading ? (
        <LoadingSkeleton count={3} />
      ) : (
        <>
          {/* Overall Summary */}
          <div className="glass p-5">
            <h3 className="text-sm text-text-secondary mb-1">Total Pengeluaran Budget</h3>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-2xl font-bold text-white tabular-nums">{formatCurrency(totalSpent)}</span>
              <span className="text-sm text-text-muted">/ {formatCompactCurrency(totalBudget)}</span>
            </div>
            <ProgressBar percentage={overallPercentage} showLabel />
          </div>

          <div className="flex justify-between items-center pt-2">
            <h2 className="font-semibold">Daftar Budget</h2>
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="text-sm font-medium text-primary flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-full"
            >
              <Plus size={16} /> Tambah
            </button>
          </div>

          {/* Budget List */}
          <div className="space-y-3">
            {budgets?.length === 0 ? (
              <EmptyState 
                icon="🎯" 
                title="Belum ada budget" 
                description={`Anda belum menetapkan budget untuk bulan ${getMonthName(month)}.`}
              />
            ) : (
              budgets?.map(budget => {
                const perc = budget.percentage || 0;
                const isOver = perc > 100;
                const isWarning = perc >= 80 && !isOver;
                const remaining = (budget.remaining || 0);

                return (
                  <div 
                    key={budget.id} 
                    className="glass p-4 animate-slide-up hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() => setEditingBudget(budget)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                          isOver ? 'bg-danger/10 text-danger' : 
                          isWarning ? 'bg-warning/10 text-warning' : 
                          'bg-primary/10 text-primary'
                        }`}>
                          {budget.category?.icon || (budget.budget_type === 'transfer' ? '🔄' : '📦')}
                        </div>
                        <div>
                          <h3 className="font-semibold text-text-primary">{budget.name}</h3>
                          <p className="text-xs text-text-muted">
                            {budget.category?.name || (budget.budget_type === 'transfer' ? 'Transfer' : 'Lainnya')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold tabular-nums text-sm text-white">
                          {formatCompactCurrency(budget.spent || 0)}
                        </div>
                        <div className="text-xs text-text-muted tabular-nums">
                          dari {formatCompactCurrency(budget.limit_amount)}
                        </div>
                      </div>
                    </div>
                    
                    <ProgressBar percentage={perc} size="sm" />
                    
                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/5">
                      <span className={`text-xs font-medium flex items-center gap-1 ${
                        isOver ? 'text-danger' : isWarning ? 'text-warning' : 'text-success'
                      }`}>
                        {isOver ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
                        {isOver ? 'Overbudget' : remaining > 0 ? 'Sisa Tersedia' : 'Pas'}
                      </span>
                      <span className={`text-sm font-bold tabular-nums ${
                        isOver ? 'text-danger' : 'text-text-primary'
                      }`}>
                        {formatCurrency(Math.abs(remaining))}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      <AddBudgetModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        month={month} 
        year={year} 
      />

      {editingBudget && (
        <EditBudgetModal
          budget={editingBudget}
          isOpen={true}
          onClose={() => setEditingBudget(null)}
        />
      )}
    </div>
  );
}

function AddBudgetModal({ isOpen, onClose, month, year }: { isOpen: boolean; onClose: () => void; month: number; year: number }) {
  const { mutate: createBudget, isPending } = useCreateBudget();
  const { data: wallets } = useWallets();

  const [name, setName] = useState('');
  const [budgetType, setBudgetType] = useState<BudgetType>('expense');
  const [limitAmount, setLimitAmount] = useState(0);
  const [walletId, setWalletId] = useState('');
  const [targetWalletId, setTargetWalletId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || limitAmount <= 0) return;

    createBudget(
      {
        name,
        budget_type: budgetType,
        limit_amount: limitAmount,
        wallet_id: budgetType === 'transfer' ? (walletId || undefined) : undefined,
        target_wallet_id: budgetType === 'transfer' ? (targetWalletId || undefined) : undefined,
        month,
        year,
      },
      {
        onSuccess: () => {
          onClose();
          setName('');
          setLimitAmount(0);
        }
      }
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Tambah Budget ${getMonthName(month)}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        
        <div className="flex p-1 bg-surface-raised rounded-xl">
          <button type="button" onClick={() => setBudgetType('expense')} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${budgetType === 'expense' ? 'bg-surface shadow text-primary' : 'text-text-muted'}`}>
            Pengeluaran
          </button>
          <button type="button" onClick={() => setBudgetType('transfer')} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${budgetType === 'transfer' ? 'bg-surface shadow text-primary' : 'text-text-muted'}`}>
            Transfer
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">Nama Budget</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-dark"
            placeholder={budgetType === 'expense' ? "Mis: Makan Bulanan" : "Mis: Tabungan Darurat"}
            required
          />
        </div>



        {budgetType === 'transfer' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Dari Dompet (Opsi)</label>
              <select value={walletId} onChange={e => setWalletId(e.target.value)} className="input-dark appearance-none">
                <option value="">Semua Dompet</option>
                {wallets?.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Ke Dompet (Opsi)</label>
              <select value={targetWalletId} onChange={e => setTargetWalletId(e.target.value)} className="input-dark appearance-none">
                <option value="">Pilih Tujuan</option>
                {wallets?.map(w => <option key={w.id} value={w.id} disabled={w.id === walletId}>{w.name}</option>)}
              </select>
            </div>
          </div>
        )}

        <CurrencyInput
          label="Batas Budget (Limit)"
          value={limitAmount}
          onChange={setLimitAmount}
          placeholder="0"
        />

        <div className="pt-4">
          <button
            type="submit"
            disabled={!name.trim() || limitAmount <= 0 || isPending}
            className="w-full btn-gradient-primary py-3.5"
          >
            {isPending ? 'Menyimpan...' : 'Simpan Budget'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function EditBudgetModal({ budget, isOpen, onClose }: { budget: Budget; isOpen: boolean; onClose: () => void }) {
  const { mutate: updateBudget, isPending: isUpdating } = useUpdateBudget();
  const { mutate: deleteBudget, isPending: isDeleting } = useDeleteBudget();
  const { data: wallets } = useWallets();

  const [name, setName] = useState(budget.name);
  const [limitAmount, setLimitAmount] = useState(budget.limit_amount);
  const [walletId, setWalletId] = useState(budget.wallet_id || '');
  const [targetWalletId, setTargetWalletId] = useState(budget.target_wallet_id || '');
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || limitAmount <= 0) return;

    updateBudget(
      {
        id: budget.id,
        data: {
          name,
          limit_amount: limitAmount,
          wallet_id: budget.budget_type === 'transfer' ? (walletId || undefined) : undefined,
          target_wallet_id: budget.budget_type === 'transfer' ? (targetWalletId || undefined) : undefined,
        },
      },
      { onSuccess: onClose }
    );
  };

  const handleDeleteClick = () => {
    setShowConfirm(true);
  };

  const executeDelete = () => {
    deleteBudget(budget.id, { onSuccess: onClose });
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Edit Budget">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">Nama Budget</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-dark"
            required
          />
        </div>



        {budget.budget_type === 'transfer' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Dari Dompet</label>
              <select value={walletId} onChange={e => setWalletId(e.target.value)} className="input-dark appearance-none">
                <option value="">Semua Dompet</option>
                {wallets?.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Ke Dompet</label>
              <select value={targetWalletId} onChange={e => setTargetWalletId(e.target.value)} className="input-dark appearance-none">
                <option value="">Semua Tujuan</option>
                {wallets?.map(w => <option key={w.id} value={w.id} disabled={w.id === walletId}>{w.name}</option>)}
              </select>
            </div>
          </div>
        )}

        <CurrencyInput
          label="Batas Budget (Limit)"
          value={limitAmount}
          onChange={setLimitAmount}
        />

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
            disabled={!name.trim() || limitAmount <= 0 || isUpdating || isDeleting}
            className="w-2/3 btn-gradient-primary py-3.5 flex items-center justify-center gap-2"
          >
            <Edit3 size={20} />
            {isUpdating ? 'Menyimpan...' : 'Update Budget'}
          </button>
        </div>
      </form>
    </Modal>
    
    <ConfirmDialog
      isOpen={showConfirm}
      onClose={() => setShowConfirm(false)}
      onConfirm={executeDelete}
      title="Hapus Budget?"
      message={`Yakin ingin menghapus budget "${budget.name}"? Tindakan ini tidak dapat dibatalkan.`}
      confirmText="Ya, Hapus"
    />
    </>
  );
}
