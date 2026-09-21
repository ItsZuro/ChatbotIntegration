import {
  useQuery,
} from "@tanstack/react-query";

import {
  getMyUsage,
} from "../../../services/usage.service";


export const usageKeys = {
  all: [
    "usage",
  ] as const,

  me: [
    "usage",
    "me",
  ] as const,
};


export function useMyUsage() {
  return useQuery({
    queryKey:
      usageKeys.me,

    queryFn:
      getMyUsage,

    staleTime:
      10_000,

    refetchOnWindowFocus:
      true,
  });
}