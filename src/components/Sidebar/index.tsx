import { useAuthStore } from "@/store";
import { cn } from "@stellar-ui-kit/shared";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";

import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  Button,
  Text,
  Separator,
} from "@stellar-ui-kit/web";

import {
  LayoutDashboard,
  Layers,
  BarChart3,
  Settings,
  LogOut,
  Flame,
  HelpCircle,
} from "lucide-react";

import { useDashboardData, useProfile, useSignOut } from "@/hooks";

const ROUTES = [
  { to: "/dashboard", labelKey: "navDashboard", Icon: LayoutDashboard },
  { to: "/decks", labelKey: "navDecks", Icon: Layers },
  { to: "/statistics", labelKey: "navStatistics", Icon: BarChart3 },
  { to: "/settings", labelKey: "navSettings", Icon: Settings },
  { to: "/help", labelKey: "navHelp", Icon: HelpCircle },
] as const;

export function Sidebar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pathname = useLocation({ select: (loc) => loc.pathname });

  const { data: profile } = useProfile();
  const { data: dashboard } = useDashboardData();

  const signOut = useSignOut();
  const user = useAuthStore((s) => s.user);

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
    <div className="flex h-full flex-col bg-background">
      <div className="flex h-14 shrink-0 items-center border-b border-border px-4">
        <Link to="/dashboard" className="flex items-center">
          <Text as="span" className="text-2xl font-bold text-foreground">
            Think
            <Text as="span" className="text-primary">
              Cards
            </Text>
          </Text>
        </Link>
      </div>

      <nav className="flex flex-1 flex-col overflow-hidden px-2 py-4">
        <ul className="space-y-2">
          {ROUTES.map(({ to, labelKey, Icon }) => (
            <li key={to}>
              <Link
                to={to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  pathname === to
                    ? "bg-primary-soft font-medium text-primary-text"
                    : "text-muted hover:bg-surface hover:text-foreground",
                )}
              >
                <Icon className="size-4 shrink-0" />
                {t(labelKey)}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="shrink-0 p-3">
        <div className="rounded-xl bg-surface p-3">
          <div className="flex items-center gap-3">
            <Avatar className="size-9 shrink-0">
              {profile?.avatar_url && (
                <AvatarImage src={profile.avatar_url} alt={displayName} />
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

          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Flame className="size-3.5 text-warning" />

              <Text as="span" className="text-xs font-semibold text-foreground">
                {t("dashboardStreakDays", { count: streak })}
              </Text>
            </div>

            <Text as="span" className="text-xs text-muted">
              {studiedToday}/{dailyGoal}
            </Text>
          </div>

          <div className="h-1 w-full overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full mt-3 text-muted"
          onClick={handleLogout}
          aria-label={t("headerLogout")}
        >
          {t("headerLogout")}
          <LogOut className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
