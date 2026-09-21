import { api } from './api';

import type {
  DashboardSummaryResponse,
} from '../types/api.types';


export async function getDashboardSummary(): Promise<
  DashboardSummaryResponse
> {
  const { data } =
    await api.get<DashboardSummaryResponse>(
      '/dashboard/summary'
    );

  return data;
}