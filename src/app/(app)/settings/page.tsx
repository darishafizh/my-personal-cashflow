'use client';

import { useRouter } from 'next/navigation';
import { LogOut, Tags, CreditCard, ChevronRight, User } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/gate');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const menuItems = [
    {
      title: 'Hutang Saya',
      icon: <CreditCard className="text-danger" size={20} />,
      href: '/debts?type=hutang',
      description: 'Catat dan kelola hutang Anda',
    },
    {
      title: 'Piutang',
      icon: <CreditCard className="text-success" size={20} />,
      href: '/debts?type=piutang',
      description: 'Catat uang Anda di orang lain',
    },
  ];

  return (
    <div className="p-4 space-y-6 animate-fade-in pb-20">
      <div>
        <h1 className="text-2xl font-bold text-text-primary mb-1">Lainnya</h1>
        <p className="text-sm text-text-muted">Pengaturan dan fitur tambahan</p>
      </div>

      <div className="glass p-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-surface-raised flex items-center justify-center border-2 border-primary/30">
          <User size={24} className="text-primary" />
        </div>
        <div>
          <h2 className="font-semibold text-text-primary">Admin CashFlow</h2>
          <p className="text-sm text-text-muted">Single-user mode</p>
        </div>
      </div>

      <div className="glass overflow-hidden">
        <div className="divide-y divide-border">
          {menuItems.map((item, idx) => (
            <Link key={idx} href={item.href} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-surface-raised flex items-center justify-center shrink-0">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary">{item.title}</h3>
                  <p className="text-xs text-text-muted">{item.description}</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-text-muted" />
            </Link>
          ))}
        </div>
      </div>

      <div className="pt-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl border border-danger/30 text-danger hover:bg-danger/10 transition-colors font-semibold"
        >
          <LogOut size={20} />
          Kunci Aplikasi (Logout)
        </button>
      </div>
    </div>
  );
}
