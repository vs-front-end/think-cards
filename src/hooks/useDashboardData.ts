import { useQuery } from "@tanstack/react-query";
import { db } from "@/lib/db";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store";
import { State } from "ts-fsrs";

type DeckStats = {
  id: string;
  name: string;
  parent_id: string | null;
  daily_goal: number;
  newCount: number;
  learningCount: number;
  reviewCount: number;
};

export type DashboardData = {
  totalDecks: number;
  totalCards: number;
  pendingToday: number;
  streak: number;
  studiedToday: number;
  dailyGoal: number;
  deckStats: DeckStats[];
  studyTimeSeconds: number;
  avgSecondsPerCard: number;
};

function computeStreak(reviewedDates: string[]): number {
  if (!reviewedDates.length) return 0;

  const days = [...new Set(reviewedDates.map((d) => d.slice(0, 10)))].sort(
    (a, b) => b.localeCompare(a),
  );

  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  if (days[0] !== today && days[0] !== yesterday) return 0;

  let streak = 1;

  for (let i = 1; i < days.length; i++) {
    const prev = new Date(days[i - 1]);
    const curr = new Date(days[i]);

    const diff = Math.round(
      (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diff === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

export function useDashboardData() {
  const userId = useAuthStore((s) => s.user?.id ?? null);

  return useQuery<DashboardData>({
    queryKey: ["dashboard", userId],

    queryFn: async () => {
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const todayEndIso = todayEnd.toISOString();
      const todayStartIso = todayStart.toISOString();

      const [
        decks,
        cards,
        allCardStates,
        todayRevlogs,
        allRevlogs,
        profileRes,
      ] = await Promise.all([
        db.decks
          .where("user_id")
          .equals(userId ?? "")
          .filter((d) => d.deleted_at === null)
          .toArray(),
        db.cards.filter((c) => c.deleted_at === null).toArray(),
        db.card_state.toArray(),
        db.revlog
          .where("user_id")
          .equals(userId ?? "")
          .filter((r) => r.reviewed_at >= todayStartIso)
          .toArray(),
        db.revlog.where("user_id").equals(userId ?? "").toArray(),
        userId
          ? supabase
              .from("profiles")
              .select("daily_goal_default")
              .eq("id", userId)
              .single()
          : Promise.resolve({ data: null }),
      ]);

      const cardStateMap = new Map(allCardStates.map((s) => [s.card_id, s]));
      const cardDeckMap = new Map(cards.map((c) => [c.id, c.deck_id]));

      const pendingToday = allCardStates.filter(
        (s) => s.state === State.New,
      ).length;

      const streak = computeStreak(allRevlogs.map((r) => r.reviewed_at));
      const studiedToday = new Set(todayRevlogs.map((r) => r.card_id)).size;

      const studyTimeSeconds = Math.round(
        todayRevlogs.reduce((sum, r) => sum + r.review_time_ms, 0) / 1000,
      );

      const avgSecondsPerCard =
        studiedToday > 0 ? Math.round(studyTimeSeconds / studiedToday) : 0;

      const globalGoal =
        (profileRes.data as { daily_goal_default?: number } | null)
          ?.daily_goal_default ?? 20;

      const deckCounters = new Map<
        string,
        { newCount: number; learningCount: number; reviewCount: number }
      >();

      for (const card of cards) {
        const state = cardStateMap.get(card.id);
        if (!state || state.due > todayEndIso) continue;

        const deckId = cardDeckMap.get(card.id);
        if (!deckId) continue;

        if (!deckCounters.has(deckId)) {
          deckCounters.set(deckId, {
            newCount: 0,
            learningCount: 0,
            reviewCount: 0,
          });
        }

        const counter = deckCounters.get(deckId)!;
        if (state.state === State.New) counter.newCount++;
        else if (
          state.state === State.Learning ||
          state.state === State.Relearning
        )
          counter.learningCount++;
        else counter.reviewCount++;
      }

      const deckStats: DeckStats[] = decks.map((d) => ({
        id: d.id,
        name: d.name,
        parent_id: d.parent_id,
        daily_goal: d.daily_goal,
        ...(deckCounters.get(d.id) ?? {
          newCount: 0,
          learningCount: 0,
          reviewCount: 0,
        }),
      }));

      return {
        totalDecks: decks.length,
        totalCards: cards.length,
        pendingToday,
        streak,
        studiedToday,
        dailyGoal: globalGoal,
        deckStats,
        studyTimeSeconds,
        avgSecondsPerCard,
      };
    },
    staleTime: 30_000,
  });
}
