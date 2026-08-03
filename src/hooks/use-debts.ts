import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Debt, DebtInput, DebtPayment, DebtPaymentInput } from '@/lib/supabase/types';
import { useToast } from '@/contexts/toast-context';

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
  const { success, error } = useToast();
  return useMutation({
    mutationFn: (data: DebtInput) => api.post<Debt>('/debts', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      success('Data berhasil disimpan.');
    },
    onError: () => error('Gagal menyimpan data.'),
  });
}

export function useUpdateDebt() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<DebtInput> }) =>
      api.put<Debt>(`/debts/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      success('Data berhasil diperbarui.');
    },
    onError: () => error('Gagal memperbarui data.'),
  });
}

export function useDeleteDebt() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/debts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      success('Data berhasil dihapus.');
    },
    onError: () => error('Gagal menghapus data.'),
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  return useMutation({
    mutationFn: ({ debtId, data }: { debtId: string; data: DebtPaymentInput }) =>
      api.post<DebtPayment>(`/debts/${debtId}/payments`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      success('Pembayaran berhasil dicatat.');
    },
    onError: () => error('Gagal mencatat pembayaran.'),
  });
}
