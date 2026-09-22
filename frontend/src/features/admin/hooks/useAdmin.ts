import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getAdminUserQuota,
  getAdminUsers,
  resetAdminUserQuota,
  updateAdminUserQuota,
} from "../../../services/admin.service";

import type { AdminQuotaLimits } from "../../../types/api.types";

export const adminKeys = {
  users: ["admin", "users"] as const,

  quota: (userId: string) => ["admin", "users", userId, "quota"] as const,
};

export function useAdminUsers() {
  return useQuery({
    queryKey: adminKeys.users,

    queryFn: getAdminUsers,

    staleTime: 15_000,
  });
}

export function useAdminUserQuota(userId: string | null) {
  return useQuery({
    queryKey: adminKeys.quota(userId ?? ""),

    queryFn: () => getAdminUserQuota(userId!),

    enabled: Boolean(userId),
  });
}

export function useUpdateAdminQuota(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (limits: AdminQuotaLimits) =>
      updateAdminUserQuota(userId, limits),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: adminKeys.quota(userId),
      });
    },
  });
}

export function useResetAdminQuota(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => resetAdminUserQuota(userId),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: adminKeys.quota(userId),
      });
    },
  });
}
