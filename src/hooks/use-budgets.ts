import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Budget, BudgetInput } from '@/lib/supabase/types';
import { useToast } from '@/contexts/toast-context';

export function useBudgets(month?: number, year?: number) {
  const now = new Date();
  const m = month ?? now.getMonth() + 1;
  const y = year ?? now.getFullYear();
  return useQuery<Budget[]>({
    queryKey: ['budgets', m, y],
    queryFn: () => api.get<Budget[]>('/budgets', { month: m, year: y }),
  });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  return useMutation({
    mutationFn: (data: BudgetInput) => api.post<Budget>('/budgets', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      success('Budget baru berhasil dibuat.');
    },
    onError: () => error('Gagal membuat budget.'),
  });
}

export function useUpdateBudget() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BudgetInput> }) =>
      api.put<Budget>(`/budgets/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      success('Budget berhasil diperbarui.');
    },
    onError: () => error('Gagal memperbarui budget.'),
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/budgets/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      success('Budget berhasil dihapus.');
    },
    onError: () => error('Gagal menghapus budget.'),
  });
}

export function useCopyBudgets() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  return useMutation({
    mutationFn: (data: { sourceMonth: number; sourceYear: number; targetMonth: number; targetYear: number }) =>
      api.post('/budgets/copy', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      success('Budget berhasil disalin.');
    },
    onError: () => error('Gagal menyalin budget.'),
  });
}
