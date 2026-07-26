import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { DashboardData } from '@/lib/supabase/types';

export function useDashboard() {
  return useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: () => api.get<DashboardData>('/dashboard'),
  });
}
