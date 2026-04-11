import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fsrs, Rating, State } from "ts-fsrs";
import type { Grade, IPreview } from "ts-fsrs";
import { db } from "@/lib/db";
import type { ICard, ICardState, Rating as DBRating } from "@/lib/db";
import { useAuthStore } from "@/store";
import { syncAll } from "@/lib/sync";
import { getAllDescendantDeckIds } from "@/utils";

type QueuedCard = {
  card: ICard;
  state: ICardState;
};

type SessionStats = {
  answeredCount: number;
  sessionTimeMs: number;
  dailyGoal: number;
  studiedToday: number;
};

type RatingPreview = {
  [key in 1 | 2 | 3 | 4]: string;
};

function formatInterval(due: Date, now: Date): string {
  const diffMs = due.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 1) return "< 1 day";
  if (diffDays === 1) return "1 day";

  return `${diffDays} days`;
}

function stateOrder(state: number): number {
  if (state === State.Learning || state === State.Relearning) return 0;
  if (state === State.Review) return 1;
  return 2;
}

function interleaveDecks(
  buckets: Map<string, QueuedCard[]>,
  totalLimit: number,
): QueuedCard[] {
  const queues = [...buckets.values()].filter((b) => b.length > 0);
  const result: QueuedCard[] = [];

  let i = 0;

  while (result.length < totalLimit) {
    let advanced = false;

    for (let qi = 0; qi < queues.length; qi++) {
      const idx = (i + qi) % queues.length;
      const queue = queues[idx];

      if (queue.length > 0) {
        result.push(queue.shift()!);
        advanced = true;

        if (result.length >= totalLimit) break;
      }
    }

    if (!advanced) break;
    i = (i + 1) % queues.length;
  }

  return result;
}

export const useStudySession = (deckId: string) => {
  const startedAt = useRef(new Date());
  const cardShownAt = useRef(new Date());
  const sessionSaved = useRef(false);
  const saveSessionRef = useRef<() => Promise<void>>(() => Promise.resolve());

  const f = useMemo(() => fsrs(), []);
  const userId = useAuthStore((s) => s.user?.id ?? null);

  const [queue, setQueue] = useState<QueuedCard[]>([]);
  const [index, setIndex] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!deckId) return;

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    async function load() {
      const deckIds = await getAllDescendantDeckIds(deckId);

      const deckRecords = await db.decks
        .where("id")
        .anyOf(deckIds)
        .filter((d) => d.deleted_at === null)
        .toArray();

      const deckLimitMap = new Map(
        deckRecords.map((d) => [d.id, d.daily_goal]),
      );
      const rootLimit = deckLimitMap.get(deckId) ?? 9999;

      const allCards = await db.cards
        .where("deck_id")
        .anyOf(deckIds)
        .filter((c) => c.deleted_at === null)
        .toArray();

      const cardIds = allCards.map((c) => c.id);

      const dueStates = await db.card_state
        .where("card_id")
        .anyOf(cardIds)
        .filter((s) => new Date(s.due) <= today)
        .toArray();

      const cardMap = new Map(allCards.map((c) => [c.id, c]));

      const buckets = new Map<string, QueuedCard[]>();

      for (const did of deckIds) {
        buckets.set(did, []);
      }

      for (const state of dueStates) {
        const card = cardMap.get(state.card_id);
        if (!card) continue;
        buckets.get(card.deck_id)?.push({ card, state });
      }

      for (const [did, bucket] of buckets) {
        bucket.sort(
          (a, b) => stateOrder(a.state.state) - stateOrder(b.state.state),
        );

        const limit =
          did === deckId ? Infinity : (deckLimitMap.get(did) ?? 9999);
        if (bucket.length > limit) {
          bucket.splice(limit);
        }
      }

      const queued = interleaveDecks(buckets, rootLimit);

      setQueue(queued);
      setIsLoaded(true);
    }

    load().catch(console.error);
  }, [deckId]);

  const currentItem = queue[index] ?? null;

  const previewIntervals = useMemo((): RatingPreview | null => {
    if (!currentItem) return null;

    const now = new Date();

    const fsrsCard = {
      due: new Date(currentItem.state.due),
      stability: currentItem.state.stability,
      difficulty: currentItem.state.difficulty,
      elapsed_days: 0,
      scheduled_days: 0,
      reps: currentItem.state.reps,
      lapses: currentItem.state.lapses,
      learning_steps: currentItem.state.learning_steps ?? 0,
      state: currentItem.state.state as State,
      last_review: currentItem.state.last_review
        ? new Date(currentItem.state.last_review)
        : undefined,
    };

    const scheduling: IPreview = f.repeat(fsrsCard, now);

    return {
      1: formatInterval(scheduling[Rating.Again].card.due, now),
      2: formatInterval(scheduling[Rating.Hard].card.due, now),
      3: formatInterval(scheduling[Rating.Good].card.due, now),
      4: formatInterval(scheduling[Rating.Easy].card.due, now),
    };
  }, [currentItem, f]);

  const answerCard = useCallback(
    async (rating: 1 | 2 | 3 | 4) => {
      if (!currentItem || !userId) return;

      const now = new Date();
      const grade = rating as Grade;

      const fsrsCard = {
        due: new Date(currentItem.state.due),
        stability: currentItem.state.stability,
        difficulty: currentItem.state.difficulty,
        elapsed_days: 0,
        scheduled_days: 0,
        reps: currentItem.state.reps,
        lapses: currentItem.state.lapses,
        learning_steps: currentItem.state.learning_steps ?? 0,
        state: currentItem.state.state as State,
        last_review: currentItem.state.last_review
          ? new Date(currentItem.state.last_review)
          : undefined,
      };

      const result = f.next(fsrsCard, now, grade);
      const { card: nextCard, log } = result;

      await db.card_state.update(currentItem.state.id, {
        stability: nextCard.stability,
        difficulty: nextCard.difficulty,
        due: nextCard.due.toISOString(),
        last_review: now.toISOString(),
        state: nextCard.state,
        reps: nextCard.reps,
        lapses: nextCard.lapses,
        learning_steps: nextCard.learning_steps,
        updated_at: now.toISOString(),
        pending_sync: 1,
      });

      const elapsedMs = now.getTime() - cardShownAt.current.getTime();

      await db.revlog.add({
        id: crypto.randomUUID(),
        card_id: currentItem.card.id,
        user_id: userId,
        rating: rating as DBRating,
        scheduled_days: log.scheduled_days,
        elapsed_days: log.elapsed_days,
        review_time_ms: elapsedMs,
        reviewed_at: now.toISOString(),
        pending_sync: 1,
      });

      setAnsweredCount((n) => n + 1);
      setIndex((i) => i + 1);
      cardShownAt.current = new Date();
    },
    [currentItem, f],
  );

  const saveSession = useCallback(async () => {
    if (sessionSaved.current || answeredCount === 0 || !userId) return;
    sessionSaved.current = true;

    const now = new Date();

    await db.session_log.add({
      id: crypto.randomUUID(),
      deck_id: deckId,
      user_id: userId,
      started_at: startedAt.current.toISOString(),
      ended_at: now.toISOString(),
      cards_reviewed: answeredCount,
      time_elapsed_ms: now.getTime() - startedAt.current.getTime(),
      pending_sync: 1,
    });

    const uid = useAuthStore.getState().user?.id;
    if (uid) syncAll(uid).catch(console.error);
  }, [deckId, answeredCount]);

  saveSessionRef.current = saveSession;

  useEffect(() => {
    return () => {
      saveSessionRef.current().catch(console.error);
    };
  }, []);

  const isDone = isLoaded && index >= queue.length;

  const stats: SessionStats = {
    answeredCount,
    sessionTimeMs: 0,
    dailyGoal: 20,
    studiedToday: answeredCount,
  };

  return {
    currentCard: currentItem?.card ?? null,
    currentState: currentItem?.state ?? null,
    remainingCount: Math.max(0, queue.length - index),
    answeredCount,
    isDone,
    isLoaded,
    previewIntervals,
    sessionStats: stats,
    startedAt: startedAt.current,
    answerCard,
    saveSession,
  };
};
