'use client';

import Link from 'next/link';
import { Home, BarChart3, Wallet, PiggyBank, MoreHorizontal } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/transactions', icon: BarChart3, label: 'Transaksi' },
  { href: '/wallets', icon: Wallet, label: 'Dompet' },
  { href: '/budget', icon: PiggyBank, label: 'Budget' },
  { href: '/settings', icon: MoreHorizontal, label: 'Lainnya' },
];

interface BottomNavProps {
  currentPath: string;
}

export default function BottomNav({ currentPath }: BottomNavProps) {
  const isActive = (href: string) => {
    if (href === '/') return currentPath === '/';
    return currentPath.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40">
      <div className="max-w-md mx-auto">
        <div className="bg-surface/95 backdrop-blur-xl border-t border-border">
          <div className="flex items-center justify-around py-2 px-1"
               style={{ paddingBottom: 'calc(8px + env(safe-area-inset-bottom, 0px))' }}>
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 ${
                    active
                      ? 'text-primary'
                      : 'text-text-muted hover:text-text-secondary'
                  }`}
                  id={`nav-${item.label.toLowerCase()}`}
                >
                  <div className={`relative p-1 rounded-lg transition-all duration-200 ${
                    active ? 'bg-primary/10' : ''
                  }`}>
                    <Icon size={20} strokeWidth={active ? 2.5 : 1.5} />
                    {active && (
                      <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                    )}
                  </div>
                  <span className={`text-[10px] leading-tight ${active ? 'font-semibold' : 'font-medium'}`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
