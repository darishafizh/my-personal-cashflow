'use client';

import { useState } from 'react';
import { Plus, TrendingUp, TrendingDown, ArrowLeftRight, X } from 'lucide-react';
import Link from 'next/link';

const ACTIONS = [
  {
    href: '/transactions/new?type=income',
    icon: TrendingUp,
    label: 'Pemasukan',
    gradient: 'from-success to-emerald-600',
    delay: '0ms',
  },
  {
    href: '/transactions/new?type=expense',
    icon: TrendingDown,
    label: 'Pengeluaran',
    gradient: 'from-danger to-red-600',
    delay: '50ms',
  },
  {
    href: '/transactions/new?type=transfer',
    icon: ArrowLeftRight,
    label: 'Transfer',
    gradient: 'from-blue-400 to-blue-600',
    delay: '100ms',
  },
];

export default function Fab() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 backdrop-blur-overlay animate-fade-in"
          onClick={() => setOpen(false)}
        />
      )}

      {/* FAB Menu */}
      <div className="fixed bottom-20 right-4 z-50 max-w-md" style={{ right: 'max(16px, calc(50% - 224px + 16px))' }}>
        {/* Action buttons */}
        {open && (
          <div className="flex flex-col items-end gap-3 mb-4">
            {ACTIONS.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 animate-slide-up"
                style={{ animationDelay: action.delay }}
              >
                <span className="bg-surface-raised text-text-primary text-xs font-medium px-3 py-1.5 rounded-lg shadow-lg border border-border">
                  {action.label}
                </span>
                <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${action.gradient} flex items-center justify-center shadow-lg`}>
                  <action.icon size={18} className="text-white" />
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Main FAB button */}
        <button
          onClick={() => setOpen(!open)}
          className={`w-14 h-14 rounded-full btn-gradient-primary flex items-center justify-center shadow-xl transition-all duration-300 ml-auto ${
            open ? 'rotate-45 scale-90' : 'rotate-0 scale-100 animate-pulse-glow'
          }`}
          id="fab-button"
          aria-label="Tambah transaksi"
        >
          {open ? <X size={24} /> : <Plus size={24} strokeWidth={2.5} />}
        </button>
      </div>
    </>
  );
}
