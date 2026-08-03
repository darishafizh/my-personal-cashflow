import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Wallet, WalletInput } from '@/lib/supabase/types';
import { useToast } from '@/contexts/toast-context';

export function useWallets() {
  return useQuery<Wallet[]>({
    queryKey: ['wallets'],
    queryFn: () => api.get<Wallet[]>('/wallets'),
  });
}

export function useWallet(id: string) {
  return useQuery<Wallet>({
    queryKey: ['wallets', id],
    queryFn: () => api.get<Wallet>(`/wallets/${id}`),
    enabled: !!id,
  });
}

export function useCreateWallet() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  return useMutation({
    mutationFn: (data: WalletInput) => api.post<Wallet>('/wallets', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      success('Dompet baru berhasil ditambahkan.');
    },
    onError: () => error('Gagal menambahkan dompet baru.'),
  });
}

export function useUpdateWallet() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<WalletInput> }) =>
      api.put<Wallet>(`/wallets/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      success('Sip, dompet berhasil diperbarui.');
    },
    onError: () => error('Gagal memperbarui dompet.'),
  });
}

export function useDeleteWallet() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/wallets/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      success('Dompet berhasil dihapus.');
    },
    onError: () => error('Gagal menghapus dompet.'),
  });
}
