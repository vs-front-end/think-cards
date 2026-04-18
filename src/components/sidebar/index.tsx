import { useState } from "react";
import { useAuthStore, useSidebarStore, useSyncStore } from "@/store";
import { cn } from "@stellar-ui-kit/shared";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useDashboardData, useProfile, useSignOut } from "@/hooks";
import { FeedbackModal } from "@/components/feedback-modal";

import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  Button,
  Separator,
  Skeleton,
  Text,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@stellar-ui-kit/web";

import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Flame,
  Layers,
  LayoutDashboard,
  CircleHelp,
  LogOut,
  MessageSquarePlus,
  Settings,
} from "lucide-react";

const ROUTES = [
  { to: "/dashboard", labelKey: "navDashboard", Icon: LayoutDashboard },
  { to: "/decks", labelKey: "navDecks", Icon: Layers },
  { to: "/statistics", labelKey: "navStatistics", Icon: BarChart3 },
  { to: "/how-it-works", labelKey: "navHowItWorks", Icon: CircleHelp },
  { to: "/settings", labelKey: "navSettings", Icon: Settings },
] as const;

export function Sidebar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pathname = useLocation({ select: (loc) => loc.pathname });
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const collapsed = useSidebarStore((s) => s.collapsed);
  const toggle = useSidebarStore((s) => s.toggle);

  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: dashboard, isLoading: dashboardLoading } = useDashboardData();
  const footerLoading = profileLoading || dashboardLoading;

  const signOut = useSignOut();
  const user = useAuthStore((s) => s.user);
  const initialSyncDone = useSyncStore((s) => s.initialSyncDone);

  const streak = dashboard?.streak ?? 0;
  const studiedToday = dashboard?.studiedToday ?? 0;
  const dailyGoal = dashboard?.dailyGoal ?? 20;

  const progressPct = Math.min(
    100,
    Math.round((studiedToday / dailyGoal) * 100),
  );

  const displayName =
    profile?.username ?? user?.user_metadata?.full_name ?? "User";

  const email = user?.email ?? "";

  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = () => {
    signOut().then(() => navigate({ to: "/" }));
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div className="relative flex h-full flex-col bg-background">
        <button
          type="button"
          onClick={toggle}
          className="absolute top-4 -right-3 z-30 flex items-center justify-center size-6 rounded-full border border-border bg-background text-muted shadow-sm transition-colors hover:bg-surface hover:text-foreground"
          aria-label={
            collapsed
              ? (t("sidebarExpand") ?? "Expand sidebar")
              : (t("sidebarCollapse") ?? "Collapse sidebar")
          }
        >
          {collapsed ? (
            <ChevronRight className="size-3" />
          ) : (
            <ChevronLeft className="size-3" />
          )}
        </button>

        <div
          className={cn(
            "flex h-14 shrink-0 items-center border-b border-border",
            collapsed ? "justify-center px-2" : "px-4",
          )}
        >
          <Link
            to="/dashboard"
            className={cn(
              "flex items-center",
              !initialSyncDone && "pointer-events-none",
            )}
            tabIndex={!initialSyncDone ? -1 : undefined}
          >
            {collapsed ? (
              <Text as="span" className="text-lg font-bold text-foreground">
                T
                <Text as="span" className="text-primary">
                  C
                </Text>
              </Text>
            ) : (
              <Text as="span" className="text-xl font-bold text-foreground">
                Think
                <Text as="span" className="text-primary">
                  Cards
                </Text>
              </Text>
            )}
          </Link>
        </div>

        <nav
          className={cn(
            "flex flex-1 flex-col overflow-hidden py-4",
            collapsed ? "items-center px-2" : "px-2",
          )}
        >
          <ul className="w-full space-y-2">
            {ROUTES.map(({ to, labelKey, Icon }) => {
              const isActive = pathname === to;
              const disabled = !initialSyncDone;
              const label = t(labelKey);

              const linkContent = (
                <>
                  <Icon className="size-4 shrink-0" />
                  {!collapsed && label}
                </>
              );

              const linkClasses = cn(
                "flex items-center overflow-hidden whitespace-nowrap rounded-lg text-sm transition-colors",
                collapsed
                  ? "justify-center size-10 mx-auto"
                  : "gap-3 px-3 py-2",
                disabled && "opacity-50 cursor-not-allowed",
                !disabled &&
                  isActive &&
                  "bg-surface font-medium text-foreground shadow-xs",
                !disabled &&
                  !isActive &&
                  "text-muted hover:bg-surface hover:text-foreground opacity-90",
              );

              const item = disabled ? (
                <span className={linkClasses} aria-disabled="true">
                  {linkContent}
                </span>
              ) : (
                <Link to={to} className={linkClasses}>
                  {linkContent}
                </Link>
              );

              if (collapsed) {
                return (
                  <li key={to}>
                    <Tooltip>
                      <TooltipTrigger asChild>{item}</TooltipTrigger>
                      <TooltipContent side="right">{label}</TooltipContent>
                    </Tooltip>
                  </li>
                );
              }

              return <li key={to}>{item}</li>;
            })}

            <li key="feedback">
              {collapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => setFeedbackOpen(true)}
                      className="flex items-center justify-center size-10 mx-auto rounded-lg text-muted transition-colors hover:bg-surface hover:text-foreground opacity-90"
                    >
                      <MessageSquarePlus className="size-4 shrink-0" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    {t("navFeedback")}
                  </TooltipContent>
                </Tooltip>
              ) : (
                <button
                  type="button"
                  onClick={() => setFeedbackOpen(true)}
                  className="flex w-full items-center overflow-hidden whitespace-nowrap gap-3 rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-surface hover:text-foreground opacity-90"
                >
                  <MessageSquarePlus className="size-4 shrink-0" />
                  {t("navFeedback")}
                </button>
              )}
            </li>
          </ul>

          <FeedbackModal open={feedbackOpen} onOpenChange={setFeedbackOpen} />
        </nav>

        <div
          className={cn("shrink-0 overflow-hidden", collapsed ? "p-2" : "p-3")}
        >
          {collapsed ? (
            <div className="flex flex-col items-center gap-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="cursor-default">
                    {footerLoading ? (
                      <Skeleton className="size-9 rounded-full" />
                    ) : (
                      <Avatar className="size-9">
                        {profile?.avatar_url && (
                          <AvatarImage
                            src={profile.avatar_url}
                            alt={displayName}
                          />
                        )}
                        <AvatarFallback className="bg-primary-soft text-xs font-semibold text-primary-text">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p className="font-semibold">{displayName}</p>
                  {email && <p className="text-xs opacity-80">{email}</p>}
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={!initialSyncDone}
                    className="flex items-center justify-center size-10 rounded-lg text-muted transition-colors hover:bg-surface hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={t("headerLogout")}
                  >
                    <LogOut className="size-4" />
                  </button>
                </TooltipTrigger>

                <TooltipContent side="right">
                  {t("headerLogout")}
                </TooltipContent>
              </Tooltip>
            </div>
          ) : (
            <div className="min-w-0 w-full overflow-hidden">
              <div className="min-w-0 overflow-hidden rounded-xl border border-border bg-surface p-3">
                {footerLoading ? (
                  <>
                    <div className="flex min-w-0 items-center gap-3 overflow-hidden">
                      <Skeleton className="size-9 shrink-0 rounded-full" />
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                    <Separator className="my-3" variant="dashed" />
                    <Skeleton className="mb-2 h-3 w-20" />
                    <Skeleton className="h-1 w-full rounded-full" />
                  </>
                ) : (
                  <>
                    <div className="flex min-w-0 items-center gap-3 overflow-hidden">
                      <Avatar className="size-9 shrink-0">
                        {profile?.avatar_url && (
                          <AvatarImage
                            src={profile.avatar_url}
                            alt={displayName}
                          />
                        )}
                        <AvatarFallback className="bg-primary-soft text-xs font-semibold text-primary-text">
                          {initials}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0 flex-1">
                        <Text
                          as="p"
                          className="truncate text-xs font-semibold text-foreground"
                        >
                          {displayName}
                        </Text>

                        {email && (
                          <Text as="p" className="truncate text-xs text-muted">
                            {email}
                          </Text>
                        )}
                      </div>
                    </div>

                    <Separator className="my-3" variant="dashed" />

                    <div className="mb-2 flex min-w-0 items-center justify-between gap-2 overflow-hidden">
                      <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden">
                        <Flame className="size-3.5 shrink-0 text-warning" />

                        <Text
                          as="span"
                          className="min-w-0 truncate text-xs font-semibold text-foreground"
                        >
                          {t("dashboardStreakDays", { count: streak })}
                        </Text>
                      </div>

                      <Text
                        as="span"
                        className="shrink-0 text-xs text-muted whitespace-nowrap"
                      >
                        {studiedToday}/{dailyGoal}
                      </Text>
                    </div>

                    <div className="h-1 w-full overflow-hidden rounded-full bg-border">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-300"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </>
                )}
              </div>

              <Button
                type="button"
                variant="outline"
                className="mt-3 w-full min-w-0 overflow-hidden whitespace-nowrap text-muted"
                onClick={handleLogout}
                disabled={!initialSyncDone}
                aria-label={t("headerLogout")}
              >
                {t("headerLogout")}
                <LogOut className="size-3.5 shrink-0" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
