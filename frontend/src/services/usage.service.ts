import { api } from "./api";

import type {
  UsageSummaryResponse,
} from "../types/api.types";


export async function getMyUsage(): Promise<
  UsageSummaryResponse
> {
  const { data } =
    await api.get<UsageSummaryResponse>(
      "/usage/me"
    );

  return data;
}