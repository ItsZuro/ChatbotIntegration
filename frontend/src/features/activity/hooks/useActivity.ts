import {
  useQuery,
} from '@tanstack/react-query';

import {
  getActivity,
} from '../../../services/activity.service';


export const activityKeys = {
  all: [
    'activity',
  ] as const,

  list: (
    limit: number,
  ) => [
    'activity',
    'list',
    limit,
  ] as const,
};


export function useActivity(
  limit = 50,
) {
  return useQuery({
    queryKey:
      activityKeys.list(
        limit,
      ),

    queryFn: () =>
      getActivity(
        limit,
      ),

    staleTime:
      15_000,

    refetchOnWindowFocus:
      true,
  });
}