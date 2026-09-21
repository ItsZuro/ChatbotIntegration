import {
  useQuery,
} from '@tanstack/react-query';

import {
  getDashboardSummary,
} from '../../../services/dashboard.service';


export const dashboardKeys = {
  all: ['dashboard'] as const,

  summary: [
    'dashboard',
    'summary',
  ] as const,
};


export function useDashboardSummary() {
  return useQuery({
    queryKey:
      dashboardKeys.summary,

    queryFn:
      getDashboardSummary,

    staleTime:
      15_000,

    refetchOnWindowFocus:
      true,
  });
}