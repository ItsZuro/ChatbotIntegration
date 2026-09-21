import axios from "axios";

import {
  fetchAuthSession,
} from "aws-amplify/auth";

import {
  env,
} from "../config/env";


export const api = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 30_000,
  headers: {
    "Content-Type": "application/json",
  },
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