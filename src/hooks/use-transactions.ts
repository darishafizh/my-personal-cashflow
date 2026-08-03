import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Transaction, TransactionInput } from '@/lib/supabase/types';
import { useToast } from '@/contexts/toast-context';

interface TransactionsResponse {
  data: Transaction[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

interface TransactionFilters {
  page?: number;
  limit?: number;
  type?: string;
  wallet_id?: string;
  category_id?: string;
  date_from?: string;
  date_to?: string;
  budget_id?: string;
}

export function useTransactions(filters: TransactionFilters = {}) {
  return useQuery<TransactionsResponse>({
    queryKey: ['transactions', filters],
    queryFn: () =>
      api.get<TransactionsResponse>('/transactions', {
        page: filters.page || 1,
        limit: filters.limit || 20,
        type: filters.type,
        wallet_id: filters.wallet_id,
        category_id: filters.category_id,
        date_from: filters.date_from,
        date_to: filters.date_to,
        budget_id: filters.budget_id,
      }),
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  return useMutation({
    mutationFn: (data: TransactionInput) => api.post<Transaction>('/transactions', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      success('Mantap! Transaksi berhasil dicatat.');
    },
    onError: () => error('Ups, gagal mencatat transaksi. Coba lagi ya.'),
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/transactions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      success('Transaksi berhasil dihapus.');
    },
    onError: () => error('Gagal menghapus transaksi.'),
  });
}
