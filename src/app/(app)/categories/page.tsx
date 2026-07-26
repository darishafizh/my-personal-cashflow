'use client';

import { useCategories } from '@/hooks/use-categories';
import LoadingSkeleton from '@/components/ui/loading-skeleton';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import EmptyState from '@/components/ui/empty-state';

export default function CategoriesPage() {
  const router = useRouter();
  const { data: categories, isLoading } = useCategories();

  const expenseCategories = categories?.filter(c => c.type === 'expense') || [];
  const incomeCategories = categories?.filter(c => c.type === 'income') || [];

  return (
    <div className="flex flex-col min-h-dvh bg-background z-50 absolute inset-0 pb-20">
      <div className="flex items-center gap-4 p-4 border-b border-border bg-surface/80 backdrop-blur-md sticky top-0 z-10">
        <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-raised hover:bg-white/5 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold">Kategori Transaksi</h1>
      </div>

      <div className="p-4 space-y-6 flex-1">
        
        {isLoading ? (
          <LoadingSkeleton count={6} />
        ) : (
          <>
            <div>
              <h2 className="font-semibold text-danger mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-danger"></span> Pengeluaran
              </h2>
              {expenseCategories.length === 0 ? (
                <EmptyState icon="📝" title="Belum ada kategori pengeluaran" />
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {expenseCategories.map(c => (
                    <div key={c.id} className="glass p-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-surface-raised flex items-center justify-center text-lg shrink-0">
                        {c.icon}
                      </div>
                      <span className="font-medium text-sm text-text-primary truncate">{c.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4">
              <h2 className="font-semibold text-success mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-success"></span> Pemasukan
              </h2>
              {incomeCategories.length === 0 ? (
                <EmptyState icon="📝" title="Belum ada kategori pemasukan" />
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {incomeCategories.map(c => (
                    <div key={c.id} className="glass p-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-surface-raised flex items-center justify-center text-lg shrink-0">
                        {c.icon}
                      </div>
                      <span className="font-medium text-sm text-text-primary truncate">{c.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="mt-8 text-center text-xs text-text-muted">
              Fitur tambah kategori kustom akan datang di pembaruan berikutnya.
            </div>
          </>
        )}
      </div>
    </div>
  );
}
