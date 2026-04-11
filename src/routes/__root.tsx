import { useEffect } from "react";
import type { CSSProperties } from "react";
import { cn } from "@stellar-ui-kit/shared";
import { Toaster } from "@stellar-ui-kit/web";
import { useAuthStore, useCreateIntentStore, useSidebarStore } from "@/store";
import {
  Header,
  BottomTab,
  Sidebar,
  DeckModal,
  ErrorBoundary,
} from "@/components";
import { useSync, useAuthListener, useAuthRedirect } from "@/hooks";

import {
  Outlet,
  createRootRoute,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";

const SIDEBAR_WIDTH_EXPANDED = 250;
const SIDEBAR_WIDTH_COLLAPSED = 72;

const RootComponent = () => {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const user = useAuthStore((s) => s.user);
  const collapsed = useSidebarStore((s) => s.collapsed);
  const createIntent = useCreateIntentStore((s) => s.createIntent);
  const clearCreateIntent = useCreateIntentStore((s) => s.clearCreateIntent);

  useSync();
  useAuthListener();
  useAuthRedirect();

  const isLoggedIn = user !== null;
  const isAuthRoute = pathname.startsWith("/auth/");
  const showAppShell = isLoggedIn && !isAuthRoute;

  const sidebarWidth = collapsed
    ? SIDEBAR_WIDTH_COLLAPSED
    : SIDEBAR_WIDTH_EXPANDED;

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
