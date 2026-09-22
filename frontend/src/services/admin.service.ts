import { api } from "./api";

import type {
  AdminQuotaLimits,
  AdminQuotaResponse,
  AdminUser,
} from "../types/api.types";

export async function getAdminUsers(): Promise<AdminUser[]> {
  const { data } = await api.get<AdminUser[]>("/admin/users");

  return data;
}

export async function getAdminUserQuota(
  userId: string,
): Promise<AdminQuotaResponse> {
  const { data } = await api.get<AdminQuotaResponse>(
    `/admin/users/${userId}/quota`,
  );

  return data;
}

export async function updateAdminUserQuota(
  userId: string,
  limits: AdminQuotaLimits,
): Promise<AdminQuotaResponse> {
  const { data } = await api.put<AdminQuotaResponse>(
    `/admin/users/${userId}/quota`,
    limits,
  );

  return data;
}

export async function resetAdminUserQuota(
  userId: string,
): Promise<AdminQuotaResponse> {
  const { data } = await api.delete<AdminQuotaResponse>(
    `/admin/users/${userId}/quota`,
  );

  return data;
}
