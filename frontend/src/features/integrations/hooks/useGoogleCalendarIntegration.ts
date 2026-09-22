import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  disconnectGoogleCalendar,
  getGoogleCalendarConnectUrl,
  getGoogleCalendarStatus,
} from "../../../services/integrations.service";


export const integrationKeys = {
  googleCalendar: [
    "integrations",
    "google-calendar",
  ] as const,
};


export function useGoogleCalendarStatus() {
  return useQuery({
    queryKey:
      integrationKeys.googleCalendar,

    queryFn:
      getGoogleCalendarStatus,

    staleTime:
      15_000,

    refetchOnWindowFocus:
      true,
  });
}


export function useConnectGoogleCalendar() {
  return useMutation({
    mutationFn:
      getGoogleCalendarConnectUrl,
  });
}


export function useDisconnectGoogleCalendar() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      disconnectGoogleCalendar,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey:
          integrationKeys.googleCalendar,
      });
    },
  });
}