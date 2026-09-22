import { api } from "./api";

import type {
  GoogleConnectResponse,
  GoogleDisconnectResponse,
  GoogleIntegrationStatusResponse,
} from "../types/api.types";


export async function getGoogleCalendarStatus() {
  const { data } =
    await api.get<GoogleIntegrationStatusResponse>(
      "/integrations/google/status",
    );

  return data;
}


export async function getGoogleCalendarConnectUrl() {
  const { data } =
    await api.get<GoogleConnectResponse>(
      "/integrations/google/connect",
    );

  return data;
}


export async function disconnectGoogleCalendar() {
  const { data } =
    await api.post<GoogleDisconnectResponse>(
      "/integrations/google/disconnect",
    );

  return data;
}