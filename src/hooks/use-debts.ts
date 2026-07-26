import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Debt, DebtInput, DebtPayment, DebtPaymentInput } from '@/lib/supabase/types';

export function useDebts(filters: { type?: string; status?: string } = {}) {
  return useQuery<Debt[]>({
    queryKey: ['debts', filters],
    queryFn: () => api.get<Debt[]>('/debts', filters),
  });
}

export function useDebt(id: string) {
  return useQuery<Debt>({
    queryKey: ['debts', id],
    queryFn: () => api.get<Debt>(`/debts/${id}`),
    enabled: !!id,
  });
}

export function useCreateDebt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: DebtInput) => api.post<Debt>('/debts', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
    },
  });
}

export function useUpdateDebt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<DebtInput> }) =>
      api.put<Debt>(`/debts/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
    },
  });
}

export function useDeleteDebt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/debts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
    },
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ debtId, data }: { debtId: string; data: DebtPaymentInput }) =>
      api.post<DebtPayment>(`/debts/${debtId}/payments`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
    },
  });
}
