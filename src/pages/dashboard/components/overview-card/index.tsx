import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "@tanstack/react-router";
import { cn } from "@stellar-ui-kit/shared";
import { formatTimePerCard } from "@/utils";
import { useIsMobile } from "@/hooks";

import {
  BarChart3,
  BookOpen,
  CalendarCheck,
  ChevronDown,
  Clock,
  Flame,
  Layers,
} from "lucide-react";

import {
  Button,
  Card,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Progress,
  Skeleton,
  Text,
} from "@stellar-ui-kit/web";

type OverviewData =
  | {
      totalDecks: number;
      totalCards: number;
      pendingToday: number;
      streak: number;
      studiedToday: number;
      dailyGoal: number;
      avgSecondsPerCard: number;
    }
  | undefined;

type OverviewCardProps = {
  data: OverviewData;
  isLoading: boolean;
};

const MetricsGrid = ({ data }: { data: OverviewData }) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      <div className="flex items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
          <Layers className="size-4" />
        </div>

        <div className="min-w-0 flex-1">
          <Text as="p" styleVariant="muted" className="text-xs font-medium">
            {t("dashboardTotalDecks")}
          </Text>

          <Text as="p" className="text-md font-semibold tabular-nums">
            {data?.totalDecks ?? 0}
          </Text>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary-soft text-secondary">
          <BookOpen className="size-4" />
        </div>

        <div className="min-w-0 flex-1">
          <Text as="p" styleVariant="muted" className="text-xs font-medium">
            {t("dashboardTotalCards")}
          </Text>

          <Text as="p" className="text-md font-semibold tabular-nums">
            {data?.totalCards ?? 0}
          </Text>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-success-soft text-success">
          <CalendarCheck className="size-4" />
        </div>

        <div className="min-w-0 flex-1">
          <Text as="p" styleVariant="muted" className="text-xs font-medium">
            {t("dashboardPendingToday")}
          </Text>

          <Text as="p" className="text-md font-semibold tabular-nums">
            {data?.pendingToday ?? 0}
          </Text>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-warning-soft text-warning">
          <Flame className="size-4" />
        </div>

        <div className="min-w-0 flex-1">
          <Text as="p" styleVariant="muted" className="text-xs font-medium">
            {t("dashboardStreak")}
          </Text>

          <Text as="p" className="text-md font-semibold tabular-nums">
            {data?.streak ?? 0}
          </Text>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-background">
          <BarChart3 className="size-4" />
        </div>

        <div className="min-w-0 flex-1">
          <Text as="p" styleVariant="muted" className="text-xs font-medium">
            {t("dashboardStudiedToday")}
          </Text>

          <Text as="p" className="text-md font-semibold tabular-nums">
            {data?.studiedToday ?? 0}
          </Text>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-background">
          <Clock className="size-4" />
        </div>

        <div className="min-w-0 flex-1">
          <Text as="p" styleVariant="muted" className="text-xs font-medium">
            {t("dashboardAvgReviewTime")}
          </Text>

          <Text as="p" className="text-md font-semibold tabular-nums">
            {t(
              "dashboardTimePerCard",
              formatTimePerCard(data?.avgSecondsPerCard ?? 0),
            )}
          </Text>
        </div>
      </div>
    </div>
  );
};

export const OverviewCard = ({ data, isLoading }: OverviewCardProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [metricsOpen, setMetricsOpen] = useState(false);

  const progressPercent =
    data && data.dailyGoal > 0
      ? Math.min(100, (data.studiedToday / data.dailyGoal) * 100)
      : 0;

  const goalReached = progressPercent >= 100;

  if (isLoading) {
    return <Skeleton className="h-48 rounded-xl p-6" />;
  }

  return (
    <Card className="border border-border bg-surface p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <Text as="h2" className="text-base font-semibold">
          {t("dashboardStatsOverview")}
        </Text>

        <Button
          type="button"
          variant="outline"
          className="h-auto gap-1.5 px-2 py-1 text-xs text-muted hover:text-foreground"
          onClick={() => navigate({ to: "/statistics" })}
        >
          <BarChart3 className="size-3.5" />
          {t("dashboardViewStatistics")}
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Text as="span" className="text-sm text-muted">
            {t("dashboardTodaysProgress")}
          </Text>

          <Text
            as="span"
            className="text-sm font-semibold tabular-nums text-foreground"
          >
            {data?.studiedToday ?? 0}
            <Text as="span" className="font-normal text-muted">
              /{data?.dailyGoal ?? 0}
            </Text>
          </Text>
        </div>

        <Progress
          value={progressPercent}
          className={cn(
            "h-2 w-full",
            goalReached &&
              "bg-success-soft [&_[data-slot=progress-indicator]]:bg-success",
          )}
        />

        <Text
          as="span"
          className={cn(
            "text-xs",
            goalReached ? "font-medium text-success" : "text-muted",
          )}
        >
          {goalReached
            ? t("dashboardGoalReached")
            : t("dashboardGoalRemaining", {
                count: (data?.dailyGoal ?? 0) - (data?.studiedToday ?? 0),
              })}
        </Text>
      </div>

      {!isMobile && (
        <div className="border-t border-border pt-3">
          <MetricsGrid data={data} />
        </div>
      )}

      {isMobile && (
        <Collapsible open={metricsOpen} onOpenChange={setMetricsOpen}>
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="mb-1 flex w-full items-center justify-between gap-2 rounded-none border-b border-t border-border py-3 text-left text-sm font-medium text-muted active:scale-100 active:bg-transparent [-webkit-tap-highlight-color:transparent]"
            >
              <span>{t("dashboardMetricsLabel")}</span>
              <ChevronDown
                className={cn(
                  "size-4 shrink-0 transition-transform",
                  metricsOpen && "rotate-180",
                )}
              />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="pt-3">
              <MetricsGrid data={data} />
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </Card>
  );
};
