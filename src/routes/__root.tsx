import { Component, useEffect } from "react";
import type { CSSProperties, ErrorInfo, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@stellar-ui-kit/shared";
import { Button, Text, Toaster } from "@stellar-ui-kit/web";
import { useAuthStore, useCreateIntentStore, useSidebarStore } from "@/store";
import { supabase } from "@/lib/supabase";
import { db } from "@/lib/db";
import { Header, BottomTab, Sidebar, DeckModal } from "@/components";
import { useSync } from "@/hooks";

import {
  Outlet,
  createRootRoute,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";

type ErrorBoundaryState = { hasError: boolean };

const SIDEBAR_WIDTH_EXPANDED = 250;
const SIDEBAR_WIDTH_COLLAPSED = 72;

const ErrorFallback = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <Text as="h2" className="text-xl font-semibold">
        {t("errorTitle")}
      </Text>

      <Text as="p" className="text-sm text-muted">
        {t("errorDesc")}
      </Text>

      <Button type="button" onClick={() => window.location.reload()}>
        {t("errorReload")}
      </Button>
    </div>
  );
};

class ErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Uncaught error:", error, info);
  }

  override render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }

    return this.props.children;
  }
}

const RootComponent = () => {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const { setUser, setSession, setIsLoading } = useAuthStore.getState();
  const user = useAuthStore((s) => s.user);

  const collapsed = useSidebarStore((s) => s.collapsed);

  useSync();

  const isLoggedIn = user !== null;
  const isAuthRoute = pathname.startsWith("/auth/");
  const showAppShell = isLoggedIn && !isAuthRoute;
  const createIntent = useCreateIntentStore((s) => s.createIntent);
  const clearCreateIntent = useCreateIntentStore((s) => s.clearCreateIntent);

  const isResetOrCallback =
    pathname === "/auth/reset-password" || pathname === "/auth/callback";

  const sidebarWidth = collapsed
    ? SIDEBAR_WIDTH_COLLAPSED
    : SIDEBAR_WIDTH_EXPANDED;

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        void Promise.all([
          db.decks.clear(),
          db.cards.clear(),
          db.card_state.clear(),
          db.revlog.clear(),
          db.session_log.clear(),
          db.sync_meta.clear(),
        ]);
        setSession(null);
        setUser(null);
        setIsLoading(false);
        return;
      }

      if (!session.user.email_confirmed_at) {
        setIsLoading(false);
        return;
      }

      setSession(session);
      setUser(session.user);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const isLoading = useAuthStore.getState().isLoading;

    if (isLoading) return;

    if (isLoggedIn && isAuthRoute && !isResetOrCallback) {
      navigate({ to: "/dashboard" });
    }
  }, [isAuthRoute, isLoggedIn, isResetOrCallback, pathname]);

  useEffect(() => {
    if (createIntent === "card") {
      clearCreateIntent();
      navigate({ to: "/cards/new", search: { deckId: undefined } });
    }
  }, [createIntent]);

  return (
    <ErrorBoundary>
      <div className="flex h-screen">
        {showAppShell && (
          <aside
            className="fixed inset-y-0 left-0 z-20 hidden flex-col overflow-visible border-r border-border bg-background transition-[width] duration-200 md:flex"
            style={{ width: sidebarWidth }}
          >
            <Sidebar />
          </aside>
        )}

        <div
          className={cn(
            "flex min-w-0 flex-1 flex-col md:transition-[margin-left] md:duration-200",
            showAppShell && "md:ml-[var(--sidebar-w)]",
          )}
          style={
            showAppShell
              ? ({ "--sidebar-w": `${sidebarWidth}px` } as CSSProperties)
              : undefined
          }
        >
          {!showAppShell && !isLoggedIn && <Header />}

          <main className="flex flex-1 min-h-0 flex-col">
            <div
              className={cn(
                "mx-auto flex w-full flex-1 min-h-0 flex-col",
                showAppShell && "max-w-[1440px]",
              )}
            >
              <Outlet />
            </div>
          </main>

          {showAppShell && <BottomTab />}
        </div>

        {showAppShell && createIntent === "deck" && (
          <DeckModal
            open={true}
            onOpenChange={(open) => !open && clearCreateIntent()}
          />
        )}

        <Toaster />
      </div>
    </ErrorBoundary>
  );
};

export const Route = createRootRoute({
  component: RootComponent,
});
