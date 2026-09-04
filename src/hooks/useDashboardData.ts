import { useQuery } from "@tanstack/react-query";
import { db } from "@/lib/db";
import { useAuthStore } from "@/store";
import { computeStreak } from "@/utils";
import { fetchDailyGoalDefault } from "@/hooks/useProfile";
import { State } from "ts-fsrs";

type DeckStats = {
  id: string;
  name: string;
  parent_id: string | null;
  daily_goal: number;
  totalCards: number;
  nextDue: string | null;
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

export const useDashboardData = () => {
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
        db.revlog
          .where("user_id")
          .equals(userId ?? "")
          .toArray(),
        fetchDailyGoalDefault(userId),
      ]);

      const activeDeckIds = new Set(decks.map((deck) => deck.id));

      const activeCards = cards.filter((card) =>
        activeDeckIds.has(card.deck_id),
      );

      const cardStateMap = new Map(allCardStates.map((s) => [s.card_id, s]));

      const cardDeckMap = new Map(
        activeCards.map((card) => [card.id, card.deck_id]),
      );

      const pendingToday = allCardStates.filter(
        (s) => s.state === State.New && cardDeckMap.has(s.card_id),
      ).length;

      const streak = computeStreak(allRevlogs.map((r) => r.reviewed_at));
      const studiedToday = new Set(todayRevlogs.map((r) => r.card_id)).size;

      const studyTimeSeconds = Math.round(
        todayRevlogs.reduce((sum, r) => sum + r.review_time_ms, 0) / 1000,
      );

      const avgSecondsPerCard =
        studiedToday > 0 ? Math.round(studyTimeSeconds / studiedToday) : 0;

      const globalGoal = profileRes.data?.daily_goal_default ?? 20;

      const deckCounters = new Map<
        string,
        {
          totalCards: number;
          nextDue: string | null;
          newCount: number;
          learningCount: number;
          reviewCount: number;
        }
      >();

      for (const card of activeCards) {
        const state = cardStateMap.get(card.id);
        const deckId = cardDeckMap.get(card.id);
        if (!deckId) continue;

        if (!deckCounters.has(deckId)) {
          deckCounters.set(deckId, {
            totalCards: 0,
            nextDue: null,
            newCount: 0,
            learningCount: 0,
            reviewCount: 0,
          });
        }

        const counter = deckCounters.get(deckId)!;
        counter.totalCards++;

        if (!state) continue;

        if (counter.nextDue === null || state.due < counter.nextDue) {
          counter.nextDue = state.due;
        }

        if (state.due > todayEndIso) continue;

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
          totalCards: 0,
          nextDue: null,
          newCount: 0,
          learningCount: 0,
          reviewCount: 0,
        }),
      }));

      return {
        totalDecks: decks.length,
        totalCards: activeCards.length,
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
};
