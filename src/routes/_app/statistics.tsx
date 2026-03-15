import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Progress, Skeleton, Text } from "@stellar-ui-kit/web";
import { Flame, Trophy, Target, Clock } from "lucide-react";
import { cn } from "@stellar-ui-kit/shared";

import { useStatisticsData } from "@/hooks/useStatisticsData";
import { AuthGuard } from "@/components/AuthGuard";
import { formatStudyTime } from "@/utils/format";

export const Route = createFileRoute("/_app/statistics")({
  component: () => (
    <AuthGuard>
      <StatisticsComponent />
    </AuthGuard>
  ),
});

const DAY_KEYS = [
  "statsDaySun",
  "statsDayMon",
  "statsDayTue",
  "statsDayWed",
  "statsDayThu",
  "statsDayFri",
  "statsDaySat",
] as const;

const MONTH_KEYS = [
  "statsMonthJan",
  "statsMonthFeb",
  "statsMonthMar",
  "statsMonthApr",
  "statsMonthMay",
  "statsMonthJun",
  "statsMonthJul",
  "statsMonthAug",
  "statsMonthSep",
  "statsMonthOct",
  "statsMonthNov",
  "statsMonthDec",
] as const;

function ForecastBar({
  forecast,
}: {
  forecast: Array<{ date: string; dayIndex: number; count: number }>;
}) {
  const { t } = useTranslation();
  const maxCount = Math.max(...forecast.map((d) => d.count), 1);

  return (
    <div className="flex items-end gap-1.5">
      {forecast.map((day) => (
        <div
          key={day.date}
          className="flex flex-1 flex-col items-center gap-1"
        >
          <Text as="span" className="text-xs tabular-nums text-muted">
            {day.count || ""}
          </Text>

          <div
            className="w-full rounded-t-sm bg-primary transition-all"
            style={{
              height: `${Math.max(4, (day.count / maxCount) * 80)}px`,
            }}
          />

          <Text as="span" className="text-xs text-muted">
            {t(DAY_KEYS[day.dayIndex])}
          </Text>
        </div>
      ))}
    </div>
  );
}

function MonthlyBar({
  reviewsByMonth,
}: {
  reviewsByMonth: Array<{ monthIndex: number; count: number }>;
}) {
  const { t } = useTranslation();
  const maxCount = Math.max(...reviewsByMonth.map((d) => d.count), 1);

  return (
    <div className="flex items-end gap-1.5">
      {reviewsByMonth.map((entry) => (
        <div
          key={entry.monthIndex}
          className="flex flex-1 flex-col items-center gap-1"
        >
          <Text as="span" className="text-xs tabular-nums text-muted">
            {entry.count || ""}
          </Text>

          <div
            className="w-full rounded-t-sm bg-primary transition-all"
            style={{
              height: `${Math.max(4, (entry.count / maxCount) * 80)}px`,
            }}
          />

          <Text as="span" className="text-xs text-muted">
            {t(MONTH_KEYS[entry.monthIndex])}
          </Text>
        </div>
      ))}
    </div>
  );
}

function DistributionBars({
  distribution,
}: {
  distribution: {
    new: number;
    learning: number;
    review: number;
    total: number;
  };
}) {
  const { t } = useTranslation();

  const items = [
    { label: t("statDistNew"), value: distribution.new, color: "bg-secondary" },
    {
      label: t("statDistLearning"),
      value: distribution.learning,
      color: "bg-warning",
    },
    {
      label: t("statDistReview"),
      value: distribution.review,
      color: "bg-success",
    },
  ];

  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => {
        const pct =
          distribution.total > 0
            ? Math.round((item.value / distribution.total) * 100)
            : 0;

        return (
          <div key={item.label} className="flex items-center gap-3">
            <Text as="span" className="w-16 shrink-0 text-xs text-muted">
              {item.label}
            </Text>

            <div className="flex flex-1 items-center gap-2">
              <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-border">
                <div
                  className={cn(
                    "absolute inset-y-0 left-0 rounded-full",
                    item.color,
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>

              <Text
                as="span"
                className="w-8 shrink-0 text-right text-xs tabular-nums text-muted"
              >
                {item.value}
              </Text>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Text as="h3" className="mb-3 text-sm font-semibold text-foreground">
      {children}
    </Text>
  );
}

function StatisticsComponent() {
  const { t } = useTranslation();
  const { data, isLoading } = useStatisticsData();

  const progressPercent =
    data && data.dailyGoal > 0
      ? Math.min(100, (data.studiedToday / data.dailyGoal) * 100)
      : 0;

  return (
    <div className="flex flex-1 flex-col gap-8 px-4 pt-6 pb-20 md:px-6 md:py-8">
      <div>
        <Text
          as="h1"
          className="text-2xl font-semibold tracking-tight md:text-3xl"
        >
          {t("statsTitle")}
        </Text>
        <Text as="p" styleVariant="muted" className="text-sm">
          {t("statsSubtitle")}
        </Text>
      </div>

      {isLoading && (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
      )}

      {!isLoading && data && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="flex flex-col items-center gap-1 rounded-xl border border-border bg-surface p-4">
              <Flame className="size-5 text-warning" />

              <Text as="span" className="text-2xl font-bold tabular-nums">
                {data.streak}
              </Text>

              <Text as="span" className="text-xs text-muted">
                {t("statsStreakLabel")}
              </Text>
            </div>

            <div className="flex flex-col items-center gap-1 rounded-xl border border-border bg-surface p-4">
              <Trophy className="size-5 text-primary" />

              <Text as="span" className="text-2xl font-bold tabular-nums">
                {data.maxStreak}
              </Text>

              <Text as="span" className="text-xs text-muted">
                {t("statsBestStreakLabel")}
              </Text>
            </div>

            <div className="flex flex-col items-center gap-1 rounded-xl border border-border bg-surface p-4">
              <Target className="size-5 text-success" />

              <Text as="span" className="text-2xl font-bold tabular-nums">
                {data.trueRetention}%
              </Text>

              <Text as="span" className="text-xs text-muted">
                {t("statsTrueRetention", { defaultValue: "retention" })}
              </Text>
            </div>

            <div className="flex flex-col items-center gap-1 rounded-xl border border-border bg-surface p-4">
              <Clock className="size-5 text-secondary" />

              <Text as="span" className="text-2xl font-bold tabular-nums">
                {formatStudyTime(data.totalStudyMs)}
              </Text>

              <Text as="span" className="text-xs text-muted">
                {t("statsTotalTimeLabel")}
              </Text>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-4">
            <div className="mb-2 flex items-center justify-between">
              <SectionTitle>{t("statsActivityToday")}</SectionTitle>

              <Text as="span" className="text-xs tabular-nums text-muted">
                {data.studiedToday} / {data.dailyGoal}
              </Text>
            </div>

            <Progress value={progressPercent} className="h-2.5 w-full" />
          </div>

          <div className="rounded-xl border border-border bg-surface p-4">
            <SectionTitle>
              {t("statsReviewsLast6Mo")}
            </SectionTitle>

            <MonthlyBar reviewsByMonth={data.reviewsByMonth} />
          </div>

          <div className="rounded-xl border border-border bg-surface p-4">
            <SectionTitle>{t("statsCardDist")}</SectionTitle>

            <DistributionBars distribution={data.distribution} />

            <Text as="p" className="mt-3 text-xs text-muted">
              <Text as="span" className="font-semibold text-primary">
                {data.maturePct}%
              </Text>{" "}
              {t("statsMature")}
            </Text>
          </div>

          <div className="rounded-xl border border-border bg-surface p-4">
            <SectionTitle>
              {t("statsDueNext14")}
            </SectionTitle>

            <ForecastBar forecast={data.forecast} />
          </div>
        </div>
      )}
    </div>
  );
}
