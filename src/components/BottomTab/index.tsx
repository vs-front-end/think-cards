import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useRouterState } from "@tanstack/react-router";
import { Button } from "@stellar-ui-kit/web";
import { cn } from "@stellar-ui-kit/shared";
import { useCreateIntentStore } from "@/store";

import {
  BarChart3,
  BookOpen,
  Layers,
  LayoutDashboard,
  Plus,
  Settings,
} from "lucide-react";

const APP_ROUTES_LEFT = [
  { to: "/dashboard", icon: LayoutDashboard },
  { to: "/decks", icon: Layers },
] as const;

const APP_ROUTES_RIGHT = [
  { to: "/statistics", icon: BarChart3 },
  { to: "/settings", icon: Settings },
] as const;

export const BottomTab = () => {
  const { t } = useTranslation();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const [open, setOpen] = useState(false);
  const openCreateDeck = useCreateIntentStore((s) => s.openCreateDeck);
  const openCreateCard = useCreateIntentStore((s) => s.openCreateCard);

  const handleCreateDeck = () => {
    setOpen(false);
    openCreateDeck();
  };

  const handleCreateCard = () => {
    setOpen(false);
    openCreateCard();
  };

  return (
    <>
      <button
        type="button"
        aria-hidden
        tabIndex={-1}
        onClick={() => setOpen(false)}
        className={cn(
          "fixed inset-0 z-20 bg-black/40 backdrop-blur-[1px] transition-all duration-200 md:hidden",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <nav
        aria-label={t("navMainAria")}
        className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t border-border bg-surface py-1 md:hidden"
      >
        {APP_ROUTES_LEFT.map(({ to, icon: Icon }) => {
          const active = pathname === to || pathname.startsWith(to + "/");

          return (
            <Link
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={cn(
                "flex flex-shrink-0 flex-col items-center gap-1 px-2 py-1 text-[10px] font-medium transition-colors duration-200 ease-out min-[375px]:gap-1.5 min-[375px]:px-3 min-[375px]:text-xs",
                active ? "text-foreground" : "text-muted opacity-80",
              )}
            >
              <Icon
                className={cn(
                "size-6 shrink-0 transition-colors duration-200 ease-out",
                  active ? "text-foreground" : "text-muted opacity-80",
                )}
                aria-hidden
              />
            </Link>
          );
        })}

        <div className="relative flex flex-shrink-0 flex-col items-center justify-end">
          <div
            className={cn(
              "absolute bottom-full left-1/2 flex -translate-x-1/2 flex-col gap-3 pb-8",
              "transition-all duration-200 ease-out",
              open
                ? "pointer-events-auto opacity-100"
                : "pointer-events-none opacity-0",
            )}
          >
            <Button
              type="button"
              variant="outline"
              aria-label={t("dashboardNewDeck")}
              onClick={handleCreateDeck}
              className={cn(
                "flex items-start justify-start transition-all duration-200 ease-out h-auto",
                open
                  ? "translate-y-0 scale-100 delay-0"
                  : "translate-y-2 scale-0 delay-100",
              )}
            >
              <Layers className="size-4 shrink-0 mt-0.5" aria-hidden />
              <div className="flex flex-col items-start justify-center gap-0.5">
                {t("dashboardNewDeck")}

                <span className="text-muted text-xs">
                  Click to create a new deck
                </span>
              </div>
            </Button>

            <Button
              type="button"
              variant="outline"
              aria-label={t("dashboardNewCard")}
              onClick={handleCreateCard}
              className={cn(
                "flex items-start justify-start transition-all duration-200 ease-out h-auto",
                open
                  ? "translate-y-0 scale-100 delay-75"
                  : "translate-y-2 scale-0 delay-0",
              )}
            >
              <BookOpen className="size-4 shrink-0 mt-0.5" aria-hidden />
              <div className="flex flex-col items-start justify-center gap-0.5">
                {t("dashboardNewCard")}

                <span className="text-muted text-xs">
                  Click to create a new card
                </span>
              </div>
            </Button>
          </div>

          <Button
            type="button"
            size="icon"
            aria-label={open ? t("navAddClose") : t("navAdd")}
            aria-expanded={open}
            onClick={() => setOpen((prev) => !prev)}
          className="relative z-10 h-14 w-14 shrink-0 -translate-y-1/3 rounded-full border-0 !m-0 !min-w-0 !p-0 !opacity-100 transition-transform duration-200"
          >
            <Plus
              className={cn(
                "size-6 transition-transform duration-200 ease-out",
                open && "rotate-[225deg]",
              )}
              aria-hidden
            />
          </Button>
        </div>

        {APP_ROUTES_RIGHT.map(({ to, icon: Icon }) => {
          const active = pathname === to || pathname.startsWith(to + "/");
          return (
            <Link
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={cn(
                "flex flex-shrink-0 flex-col items-center gap-1 px-2 py-1 text-[10px] font-medium transition-colors duration-200 ease-out min-[375px]:gap-1.5 min-[375px]:px-3 min-[375px]:text-xs",
                active ? "text-foreground" : "text-muted opacity-80",
              )}
            >
              <Icon
                className={cn(
                  "size-5.5 shrink-0 transition-colors duration-200 ease-out",
                  active ? "text-foreground" : "text-muted opacity-80",
                )}
                aria-hidden
              />
            </Link>
          );
        })}
      </nav>
    </>
  );
};
