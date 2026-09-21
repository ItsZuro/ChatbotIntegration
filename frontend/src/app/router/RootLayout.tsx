import { Center, Loader } from "@mantine/core";

import { Outlet, useNavigate, useRouterState } from "@tanstack/react-router";

import { getCurrentUser } from "aws-amplify/auth";

import { useEffect, useState } from "react";

import { AppLayout } from "../../components/layout/AppLayout";

interface AuthCheck {
  pathname: string;
  authenticated: boolean;
}

export function RootLayout() {
  const navigate = useNavigate();

  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  const isAuthRoute = pathname.startsWith("/auth/");

  const [authCheck, setAuthCheck] = useState<AuthCheck | null>(null);

  useEffect(() => {
    if (isAuthRoute) {
      return;
    }

    let active = true;

    async function checkAuth() {
      try {
        await getCurrentUser();

        if (!active) {
          return;
        }

        setAuthCheck({
          pathname,
          authenticated: true,
        });
      } catch {
        if (!active) {
          return;
        }

        setAuthCheck({
          pathname,
          authenticated: false,
        });

        await navigate({
          to: "/auth/login",
          replace: true,
        });
      }
    }

    void checkAuth();

    return () => {
      active = false;
    };
  }, [isAuthRoute, navigate, pathname]);

  if (isAuthRoute) {
    return <Outlet />;
  }

  const authenticated =
    authCheck?.pathname === pathname && authCheck.authenticated;

  if (!authenticated) {
    return (
      <Center mih="100vh">
        <Loader color="violet" />
      </Center>
    );
  }

  return <AppLayout />;
}
