import { useQuery } from "@tanstack/react-query";

import { getCurrentAppUser } from "../../../services/user.service";

export const currentUserKeys = {
  me: ["auth", "me"] as const,
};

export function useCurrentAppUser() {
  return useQuery({
    queryKey: currentUserKeys.me,

    queryFn: getCurrentAppUser,

    staleTime: 60_000,
  });
}
