import { db } from "@/lib/db";
import { State } from "ts-fsrs";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useDashboardData } from "@/hooks/useDashboardData";

import {
  clearDb,
  makeWrapper,
  makeDeck,
  makeCard,
  makeCardState,
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
  renderHook(() => useDashboardData(), { wrapper: makeWrapper() });

describe("useDashboardData — studiedToday & avgSecondsPerCard", () => {
  it("counts unique cards studied today and computes average time", async () => {
    const today = new Date().toISOString();

    await db.revlog.bulkAdd([
      {
        id: crypto.randomUUID(),
        card_id: "card-a",
        user_id: "test-user",
        rating: 3,
        scheduled_days: 1,
        elapsed_days: 0,
        review_time_ms: 6000,
        reviewed_at: today,
        pending_sync: 0,
      },
      {
        id: crypto.randomUUID(),
        card_id: "card-b",
        user_id: "test-user",
        rating: 3,
        scheduled_days: 1,
        elapsed_days: 0,
        review_time_ms: 4000,
        reviewed_at: today,
        pending_sync: 0,
      },
      {
        id: crypto.randomUUID(),
        card_id: "card-a",
        user_id: "test-user",
        rating: 4,
        scheduled_days: 2,
        elapsed_days: 0,
        review_time_ms: 2000,
        reviewed_at: today,
        pending_sync: 0,
      },
    ]);

    const { result } = rendered();
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.studiedToday).toBe(2);
    expect(result.current.data?.avgSecondsPerCard).toBe(6);
  });
});

describe("useDashboardData — pendingToday", () => {
  it("counts all New-state card_states regardless of due date", async () => {
    const cards = [makeCard(), makeCard(), makeCard()];

    await db.cards.bulkAdd(cards);

    await db.card_state.bulkAdd([
      makeCardState(cards[0].id, { state: State.New }),
      makeCardState(cards[1].id, { state: State.New }),
      makeCardState(cards[2].id, { state: State.Review }),
    ]);

    const { result } = rendered();
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.pendingToday).toBe(2);
  });
});

describe("useDashboardData — deckStats", () => {
  it("groups due cards by state per deck", async () => {
    const deckId = crypto.randomUUID();
    const deck = makeDeck({ id: deckId, user_id: "test-user" });
    await db.decks.add(deck);

    const dueDate = new Date(Date.now() - 1000).toISOString();
    const futureDate = new Date(Date.now() + 7 * 86_400_000).toISOString();

    const cards = [
      makeCard({ deck_id: deckId }),
      makeCard({ deck_id: deckId }),
      makeCard({ deck_id: deckId }),
    ];

    await db.cards.bulkAdd(cards);

    await db.card_state.bulkAdd([
      makeCardState(cards[0].id, { state: State.New, due: dueDate }),
      makeCardState(cards[1].id, { state: State.Review, due: dueDate }),
      makeCardState(cards[2].id, { state: State.New, due: futureDate }),
    ]);

    const { result } = rendered();
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const stats = result.current.data?.deckStats.find((d) => d.id === deckId);
    expect(stats?.newCount).toBe(1);
    expect(stats?.reviewCount).toBe(1);
    expect(stats?.learningCount).toBe(0);
  });
});
