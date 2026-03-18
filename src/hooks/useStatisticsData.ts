import { useQuery } from "@tanstack/react-query";
import { db } from "@/lib/db";
import { useAuthStore } from "@/store";
import { State } from "ts-fsrs";

type DailyActivity = {
  date: string;
  count: number;
};

type ForecastDay = {
  date: string;
  dayIndex: number;
  count: number;
};

type CardDistribution = {
  new: number;
  learning: number;
  review: number;
  total: number;
};

type MonthlyReview = {
  monthIndex: number;
  count: number;
};

export type StatisticsData = {
  streak: number;
  maxStreak: number;
  studiedToday: number;
  dailyGoal: number;
  totalStudyMs: number;
  activity: DailyActivity[];
  distribution: CardDistribution;
  forecast: ForecastDay[];
  trueRetention: number;
  matureCount: number;
  maturePct: number;
  reviewsByMonth: MonthlyReview[];
};

const localDate = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

function computeStreaks(reviewedDates: string[]): {
  streak: number;
  maxStreak: number;
} {
  if (!reviewedDates.length) return { streak: 0, maxStreak: 0 };

  const days = [...new Set(reviewedDates.map((d) => d.slice(0, 10)))].sort(
    (a, b) => b.localeCompare(a),
  );

  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  let streak = 0;

  if (days[0] === today || days[0] === yesterday) {
    streak = 1;

    for (let i = 1; i < days.length; i++) {
      const prev = new Date(days[i - 1]);
      const curr = new Date(days[i]);
      const diff = Math.round((prev.getTime() - curr.getTime()) / 86400000);

      if (diff === 1) streak++;
      else break;
    }
  }

  let maxStreak = 1;
  let current = 1;

  for (let i = 1; i < days.length; i++) {
    const prev = new Date(days[i - 1]);
    const curr = new Date(days[i]);
    const diff = Math.round((prev.getTime() - curr.getTime()) / 86400000);

    if (diff === 1) {
      current++;
      if (current > maxStreak) maxStreak = current;
    } else {
      current = 1;
    }
  }

  return { streak, maxStreak: Math.max(streak, maxStreak) };
}

export function useStatisticsData() {
  const userId = useAuthStore((s) => s.user?.id ?? "");

  return useQuery<StatisticsData>({
    queryKey: ["statistics", userId],
    queryFn: async () => {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const [allRevlogs, allCardStates, decks, sessionLogs] = await Promise.all(
        [
          db.revlog.where("user_id").equals(userId).toArray(),
          db.card_state.toArray(),
          db.decks
            .where("user_id")
            .equals(userId)
            .filter((d) => d.deleted_at === null)
            .toArray(),
          db.session_log.where("user_id").equals(userId).toArray(),
        ],
      );

      const todayStartIso = todayStart.toISOString();
      const { streak, maxStreak } = computeStreaks(
        allRevlogs.map((r) => r.reviewed_at),
      );

      const studiedToday = new Set(
        allRevlogs
          .filter((r) => r.reviewed_at >= todayStartIso)
          .map((r) => r.card_id),
      ).size;

      const dailyGoal =
        decks.length > 0
          ? Math.round(
              decks.reduce((s, d) => s + d.daily_goal, 0) / decks.length,
            )
          : 20;

      const totalStudyMs = sessionLogs.reduce(
        (sum, s) => sum + (s.time_elapsed_ms ?? 0),
        0,
      );

      const activityMap = new Map<string, number>();

      for (let i = 0; i < 30; i++) {
        const d = new Date(Date.now() - i * 86400000);
        activityMap.set(localDate(d), 0);
      }

      for (const r of allRevlogs) {
        const day = r.reviewed_at.slice(0, 10);

        if (activityMap.has(day)) {
          activityMap.set(day, (activityMap.get(day) ?? 0) + 1);
        }
      }

      const activity: DailyActivity[] = [...activityMap.entries()]
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));

      const distribution: CardDistribution = {
        new: 0,
        learning: 0,
        review: 0,
        total: 0,
      };

      for (const s of allCardStates) {
        distribution.total++;

        if (s.state === State.New) {
          distribution.new++;
        } else if (s.state === State.Learning || s.state === State.Relearning) {
          distribution.learning++;
        } else {
          distribution.review++;
        }
      }

      const forecastMap = new Map<string, number>();

      for (let i = 1; i <= 7; i++) {
        const d = new Date(Date.now() + i * 86400000);
        forecastMap.set(localDate(d), 0);
      }

      for (const s of allCardStates) {
        const day = s.due.slice(0, 10);

        if (forecastMap.has(day)) {
          forecastMap.set(day, (forecastMap.get(day) ?? 0) + 1);
        }
      }

      const forecast: ForecastDay[] = [...forecastMap.entries()]
        .map(([date, count]) => ({
          date,
          dayIndex: new Date(date + "T12:00:00").getDay(),
          count,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      const matureCardIds = new Set(
        allCardStates
          .filter((s) => s.state === State.Review)
          .map((s) => s.card_id),
      );

      const matureRevlogs = allRevlogs.filter((r) =>
        matureCardIds.has(r.card_id),
      );
      const matureTotal = matureRevlogs.length;
      const matureNonAgain = matureRevlogs.filter((r) => r.rating !== 1).length;
      const trueRetention =
        matureTotal > 0 ? Math.round((matureNonAgain / matureTotal) * 100) : 0;

      const matureCount = matureCardIds.size;
      const maturePct =
        distribution.total > 0
          ? Math.round((matureCount / distribution.total) * 100)
          : 0;

      const reviewsByMonthMap = new Map<string, { monthIndex: number; count: number }>();
      const now = new Date();

      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        reviewsByMonthMap.set(key, { monthIndex: d.getMonth(), count: 0 });
      }

      for (const r of allRevlogs) {
        const key = r.reviewed_at.slice(0, 7);

        if (reviewsByMonthMap.has(key)) {
          const entry = reviewsByMonthMap.get(key)!;
          reviewsByMonthMap.set(key, { ...entry, count: entry.count + 1 });
        }
      }

      const reviewsByMonth: MonthlyReview[] = [...reviewsByMonthMap.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([, { monthIndex, count }]) => ({ monthIndex, count }));

      return {
        streak,
        maxStreak,
        studiedToday,
        dailyGoal,
        totalStudyMs,
        activity,
        distribution,
        forecast,
        trueRetention,
        matureCount,
        maturePct,
        reviewsByMonth,
      };
    },
    staleTime: 60_000,
  });
}
