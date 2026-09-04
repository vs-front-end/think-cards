import { db } from "@/lib/db";
import { State } from "ts-fsrs";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useStatisticsData } from "@/hooks/useStatisticsData";

import {
  clearDb,
  makeWrapper,
  makeCard,
  makeCardState,
  makeDeck,
} from "@/test/helpers";

vi.mock("@/store", () => {
  const mockState = { user: { id: "test-user" }, session: null };

  const useAuthStore = (selector: (s: typeof mockState) => unknown) => {
    return selector(mockState);
  };

  useAuthStore.getState = () => mockState;
  return { useAuthStore };
});

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () =>
            Promise.resolve({ data: { daily_goal_default: 20 }, error: null }),
        }),
      }),
    }),
  },
}));

beforeEach(clearDb);

const rendered = () =>
  renderHook(() => useStatisticsData(), { wrapper: makeWrapper() });

describe("useStatisticsData — distribution", () => {
  it("counts cards by FSRS state", async () => {
    const deck = makeDeck({ user_id: "test-user" });

    const cards = [
      makeCard({ deck_id: deck.id }),
      makeCard({ deck_id: deck.id }),
      makeCard({ deck_id: deck.id }),
      makeCard({ deck_id: deck.id }),
    ];

    await db.decks.add(deck);
    await db.cards.bulkAdd(cards);

    await db.card_state.bulkAdd([
      makeCardState(cards[0].id, { state: State.New }),
      makeCardState(cards[1].id, { state: State.New }),
      makeCardState(cards[2].id, { state: State.Learning }),
      makeCardState(cards[3].id, { state: State.Review }),
    ]);

    const { result } = rendered();
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.distribution).toEqual({
      new: 2,
      learning: 1,
      review: 1,
      total: 4,
    });
  });

  it("excludes cards that belong to soft-deleted decks", async () => {
    const activeDeck = makeDeck({ id: "active-deck", user_id: "test-user" });

    const deletedDeck = makeDeck({
      id: "deleted-deck",
      user_id: "test-user",
      deleted_at: new Date().toISOString(),
    });

    const activeCard = makeCard({ deck_id: activeDeck.id });
    const orphanedCard = makeCard({ deck_id: deletedDeck.id });

    await db.decks.bulkAdd([activeDeck, deletedDeck]);
    await db.cards.bulkAdd([activeCard, orphanedCard]);

    await db.card_state.bulkAdd([
      makeCardState(activeCard.id, { state: State.New }),
      makeCardState(orphanedCard.id, { state: State.Review }),
    ]);

    const { result } = rendered();
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.distribution).toEqual({
      new: 1,
      learning: 0,
      review: 0,
      total: 1,
    });
  });
});

describe("useStatisticsData — trueRetention", () => {
  it("calculates non-Again rate for mature card reviews only", async () => {
    const deck = makeDeck({ user_id: "test-user" });
    const newCard = makeCard({ deck_id: deck.id });
    const matureCard = makeCard({ deck_id: deck.id });

    await db.decks.add(deck);
    await db.cards.bulkAdd([newCard, matureCard]);

    await db.card_state.bulkAdd([
      makeCardState(newCard.id, { state: State.New }),
      makeCardState(matureCard.id, { state: State.Review }),
    ]);

    const now = new Date().toISOString();
    await db.revlog.bulkAdd([
      {
        id: crypto.randomUUID(),
        card_id: matureCard.id,
        user_id: "test-user",
        rating: 1,
        scheduled_days: 0,
        elapsed_days: 0,
        review_time_ms: 1000,
        reviewed_at: now,
        review_type: "practice",
        pending_sync: 0,
      },
      {
        id: crypto.randomUUID(),
        card_id: matureCard.id,
        user_id: "test-user",
        rating: 3,
        scheduled_days: 1,
        elapsed_days: 1,
        review_time_ms: 1000,
        reviewed_at: now,
        review_type: "scheduled",
        pending_sync: 0,
      },
      {
        id: crypto.randomUUID(),
        card_id: matureCard.id,
        user_id: "test-user",
        rating: 4,
        scheduled_days: 2,
        elapsed_days: 1,
        review_time_ms: 1000,
        reviewed_at: now,
        review_type: "scheduled",
        pending_sync: 0,
      },
      {
        id: crypto.randomUUID(),
        card_id: newCard.id,
        user_id: "test-user",
        rating: 1,
        scheduled_days: 0,
        elapsed_days: 0,
        review_time_ms: 1000,
        reviewed_at: now,
        review_type: "scheduled",
        pending_sync: 0,
      },
    ]);

    const { result } = rendered();
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.trueRetention).toBe(100);
  });

  it("returns 0 retention when no mature cards have been reviewed", async () => {
    const { result } = rendered();
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.trueRetention).toBe(0);
  });
});

describe("useStatisticsData — studiedToday", () => {
  it("counts unique cards reviewed today", async () => {
    const todayIso = new Date().toISOString();
    const oldIso = "2020-01-01T10:00:00.000Z";

    await db.revlog.bulkAdd([
      {
        id: crypto.randomUUID(),
        card_id: "card-a",
        user_id: "test-user",
        rating: 3,
        scheduled_days: 1,
        elapsed_days: 1,
        review_time_ms: 1000,
        reviewed_at: todayIso,
        review_type: "scheduled",
        pending_sync: 0,
      },
      {
        id: crypto.randomUUID(),
        card_id: "card-a",
        user_id: "test-user",
        rating: 3,
        scheduled_days: 1,
        elapsed_days: 1,
        review_time_ms: 1000,
        reviewed_at: todayIso,
        review_type: "scheduled",
        pending_sync: 0,
      },
      {
        id: crypto.randomUUID(),
        card_id: "card-b",
        user_id: "test-user",
        rating: 3,
        scheduled_days: 1,
        elapsed_days: 1,
        review_time_ms: 1000,
        reviewed_at: todayIso,
        review_type: "practice",
        pending_sync: 0,
      },
      {
        id: crypto.randomUUID(),
        card_id: "card-c",
        user_id: "test-user",
        rating: 3,
        scheduled_days: 1,
        elapsed_days: 1,
        review_time_ms: 1000,
        reviewed_at: oldIso,
        review_type: "scheduled",
        pending_sync: 0,
      },
    ]);

    const { result } = rendered();
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.studiedToday).toBe(2);
  });
});
