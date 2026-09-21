import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "@mantine/core/styles.css";
import "@mantine/dropzone/styles.css";
import "@mantine/notifications/styles.css";

import { MantineProvider } from "@mantine/core";

import { ModalsProvider } from "@mantine/modals";

import { Notifications } from "@mantine/notifications";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { RouterProvider } from "@tanstack/react-router";

import { router } from './app/router/router';
import { theme } from "./app/theme";
import {
  configureAuth,
} from './config/auth';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

configureAuth();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <ModalsProvider>
        <Notifications position="top-right" limit={4} />

        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </ModalsProvider>
    </MantineProvider>
  </StrictMode>,
);
