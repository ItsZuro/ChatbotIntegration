import axios, {
  AxiosError,
} from "axios";

import {
  fetchAuthSession,
} from "aws-amplify/auth";

import {
  notifications,
} from "@mantine/notifications";

import {
  env,
} from "../config/env";


export const api = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 30_000,
});


api.interceptors.request.use(
  async (config) => {
    try {
      const session =
        await fetchAuthSession();

      const accessToken =
        session.tokens?.accessToken;

      if (accessToken) {
        config.headers.Authorization =
          `Bearer ${accessToken.toString()}`;
      }

      return config;
    } catch {
      return config;
    }
  },
);


api.interceptors.response.use(
  (response) => response,

  (
    error: AxiosError<{
      detail?: string;
    }>
  ) => {
    if (
      error.response?.status === 429
    ) {
      const message =
        error.response.data?.detail ??
        (
          "Has alcanzado el "
          + "límite de uso permitido."
        );

      notifications.show({
        title: "Límite alcanzado",
        message,
        color: "orange",
        autoClose: 5000,
      });
    }

    return Promise.reject(error);
  },
);

export function isRateLimitError(
  error: unknown,
): boolean {
  return (
    axios.isAxiosError(error) &&
    error.response?.status === 429
  );
}