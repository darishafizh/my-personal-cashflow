import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Budget, BudgetInput } from '@/lib/supabase/types';

export function useBudgets(month: number, year: number) {
  return useQuery<Budget[]>({
    queryKey: ['budgets', month, year],
    queryFn: () => api.get<Budget[]>('/budgets', { month, year }),
  });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BudgetInput) => api.post<Budget>('/budgets', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
}

export function useUpdateBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BudgetInput> }) =>
      api.put<Budget>(`/budgets/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/budgets/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
}

export function useCopyBudgets() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { sourceMonth: number; sourceYear: number; targetMonth: number; targetYear: number }) =>
      api.post('/budgets/copy', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
}
