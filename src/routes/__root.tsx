import { Component, useEffect } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@stellar-ui-kit/shared";
import { Button, Text, Toaster } from "@stellar-ui-kit/web";
import { useAuthStore, useCreateIntentStore } from "@/store";
import { supabase } from "@/lib/supabase";
import { Header, BottomTab, Sidebar, DeckModal } from "@/components";

import {
  Outlet,
  createRootRoute,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";

const SIDEBAR_WIDTH = 250;

function ErrorFallback() {
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
}

type ErrorBoundaryState = { hasError: boolean };

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

const APP_ROUTES = [
  "/dashboard",
  "/decks",
  "/study",
  "/statistics",
  "/settings",
];

export const Route = createRootRoute({
  component: RootComponent,
});


function RootComponent() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const { setUser, setSession, setIsLoading } = useAuthStore.getState();
  const user = useAuthStore((s) => s.user);

  const isLoggedIn = user !== null;
  const isAppRoute = APP_ROUTES.some((r) => pathname.startsWith(r));
  const createIntent = useCreateIntentStore((s) => s.createIntent);
  const clearCreateIntent = useCreateIntentStore((s) => s.clearCreateIntent);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
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

    if (isAppRoute && !isLoggedIn) {
      navigate({ to: "/" });
    }
  }, [isAppRoute, isLoggedIn, navigate]);

  useEffect(() => {
    if (createIntent === "card") {
      clearCreateIntent();
      navigate({ to: "/cards/new", search: { deckId: undefined } });
    }
  }, [createIntent, clearCreateIntent, navigate]);

  return (
    <ErrorBoundary>
      <div className="flex h-screen">
        {isLoggedIn && (
          <aside
            className={cn(
              "fixed inset-y-0 left-0 z-20 hidden flex-col border-r border-border bg-background md:flex",
            )}
            style={{ width: SIDEBAR_WIDTH }}
          >
            <Sidebar />
          </aside>
        )}

        <div
          className={cn(
            "flex min-w-0 flex-1 flex-col",
            isLoggedIn && "md:ml-[250px]",
          )}
        >
          {!isLoggedIn && <Header />}

          <main className="flex flex-1 min-h-0 flex-col">
            <div className="mx-auto flex w-full max-w-[1440px] flex-1 min-h-0 flex-col">
              <Outlet />
            </div>
          </main>

          {isLoggedIn && <BottomTab />}
        </div>

        {isLoggedIn && createIntent === "deck" && (
          <DeckModal
            open={true}
            onOpenChange={(open) => !open && clearCreateIntent()}
          />
        )}

        <Toaster />
      </div>
    </ErrorBoundary>
  );
}
