import {
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

import { RootLayout } from "./RootLayout";

import { ChatPage } from "../../pages/ChatPage";
import { DashboardPage } from "../../pages/DashboardPage";

const rootRoute = createRootRoute({
  component: RootLayout,
});

const chatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: ChatPage,
});

const conversationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/chat/$conversationId",
  component: ChatPage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: DashboardPage,
});

const newRequestRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/requests/new",
  component: ChatPage,
});

const routeTree = rootRoute.addChildren([
  chatRoute,
  conversationRoute,
  dashboardRoute,
  newRequestRoute,
]);

export const router = createRouter({
  routeTree,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}