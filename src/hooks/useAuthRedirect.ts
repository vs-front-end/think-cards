import { useEffect } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuthStore } from "@/store";

export const useAuthRedirect = () => {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const user = useAuthStore((s) => s.user);
  const isLoggedIn = user !== null;
  const isAuthRoute = pathname.startsWith("/auth/");
  const isResetOrCallback =
    pathname === "/auth/reset-password" || pathname === "/auth/callback";

  useEffect(() => {
    const isLoading = useAuthStore.getState().isLoading;

    if (isLoading) return;

    if (isLoggedIn && isAuthRoute && !isResetOrCallback) {
      navigate({ to: "/dashboard" });
    }
  }, [isAuthRoute, isLoggedIn, isResetOrCallback, pathname]);
};
