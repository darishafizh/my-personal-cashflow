import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Category } from '@/lib/supabase/types';

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => api.get<Category[]>('/categories'),
    staleTime: 5 * 60 * 1000, // 5 minutes - categories rarely change
  });
}

export function useExpenseCategories() {
  const { data, ...rest } = useCategories();
  return {
    data: data?.filter((c) => c.type === 'expense'),
    ...rest,
  };
}

export function useIncomeCategories() {
  const { data, ...rest } = useCategories();
  return {
    data: data?.filter((c) => c.type === 'income'),
    ...rest,
  };
}
