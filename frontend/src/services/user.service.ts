import {
  api,
} from "./api";

import type {
  CurrentUserResponse,
} from "../types/api.types";


export async function getCurrentAppUser(): Promise<
  CurrentUserResponse
> {
  const {
    data,
  } = await api.get<CurrentUserResponse>(
    "/auth/me",
  );

  return data;
}