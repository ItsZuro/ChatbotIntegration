import { api } from './api';

import type {
  DashboardActivityItem,
} from '../types/api.types';


export async function getActivity(
  limit = 50,
): Promise<DashboardActivityItem[]> {
  const { data } =
    await api.get<DashboardActivityItem[]>(
      '/activity',
      {
        params: {
          limit,
        },
      },
    );

  return data;
}