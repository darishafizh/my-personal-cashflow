'use client';

import { usePathname } from 'next/navigation';
import BottomNav from '@/components/ui/bottom-nav';
import Fab from '@/components/ui/fab';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="max-w-md mx-auto w-full flex flex-col min-h-dvh relative">
      <main className="flex-1 pb-safe">
        {children}
      </main>
      <Fab />
      <BottomNav currentPath={pathname} />
    </div>
  );
}
