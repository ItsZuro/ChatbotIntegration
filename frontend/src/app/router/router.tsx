import {
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

import { RootLayout } from "./RootLayout";

import { ActivityPage } from "../../pages/ActivityPage";
import { ChatPage } from "../../pages/ChatPage";
import { DashboardPage } from "../../pages/DashboardPage";
import { DocumentsPage } from "../../pages/DocumentsPage";
import { AboutPage } from "../../pages/AboutPage";
import { PrivacyPage } from "../../pages/PrivacyPage";
import { TermsPage } from "../../pages/TermsPage";
import {
  AdminUsersPage,
} from "../../pages/AdminUsersPage";
import {
  ForgotPasswordPage,
} from "../../pages/auth/ForgotPasswordPage";
import {
  LoginPage,
} from "../../pages/auth/LoginPage";

import {
  RegisterPage,
} from "../../pages/auth/RegisterPage";

import {
  ConfirmPage,
} from "../../pages/auth/ConfirmPage";
import {
  IntegrationsPage,
} from "../../pages/IntegrationsPage";

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

const activityRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/activity",
  component: ActivityPage,
});

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/about",
  component: AboutPage,
});

const privacyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/privacy",
  component: PrivacyPage,
});

const termsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/terms",
  component: TermsPage,
});

const adminUsersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/users",
  component: AdminUsersPage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth/login",
  component: LoginPage,
});

const integrationsRoute =
  createRoute({
    getParentRoute:
      () => rootRoute,

    path: "/integrations",

    component:
      IntegrationsPage,
  });


const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth/register",
  component: RegisterPage,
});

const forgotPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth/forgot-password",
  component: ForgotPasswordPage,
});


const confirmRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth/confirm",
  component: ConfirmPage,
  validateSearch: (
    search: Record<string, unknown>,
  ) => ({
    email:
      typeof search.email === "string"
        ? search.email
        : undefined,
  }),
});

const documentsRoute = createRoute({
  getParentRoute: () => rootRoute,

  path: "/documents",

  component: DocumentsPage,
});

const newRequestRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/requests/new",
  component: ChatPage,
});

const routeTree =
  rootRoute.addChildren([
    chatRoute,
    conversationRoute,
    dashboardRoute,
    documentsRoute,
    activityRoute,
    integrationsRoute,
    adminUsersRoute,
    newRequestRoute,

    aboutRoute,
    privacyRoute,
    termsRoute,

    loginRoute,
    registerRoute,
    confirmRoute,
    forgotPasswordRoute,
  ]);
  
export const router = createRouter({
  routeTree,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
