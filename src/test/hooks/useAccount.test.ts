import { db } from "@/lib/db";
import { State } from "ts-fsrs";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useResetStats } from "@/hooks/useAccount";

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

vi.mock("@/lib/supabase", () => {
  const chain = (data: unknown = []): Record<string, unknown> => ({
    select: () => chain(data),
    eq: () => chain(data),
    in: () => chain(data),
    delete: () => chain(null),
    update: () => chain(null),
    single: () => Promise.resolve({ data, error: null }),
    then: (fn: (v: { data: unknown; error: null }) => unknown) =>
      Promise.resolve({ data, error: null }).then(fn),
  });
  return {
    supabase: {
      from: () => chain([]),
      auth: {
        getUser: () => Promise.resolve({ data: { user: { id: "test-user" } } }),
      },
    },
  };
});

vi.mock("@/hooks/useSync", () => ({ resetSyncState: vi.fn() }));

beforeEach(clearDb);

describe("useResetStats", () => {
  it("clears revlog and session_log but keeps cards and decks intact", async () => {
    const deck = makeDeck({ id: crypto.randomUUID() });
    const card = makeCard({ deck_id: deck.id });

    await db.decks.add(deck);
    await db.cards.add(card);

    await db.card_state.add(
      makeCardState(card.id, { state: State.Review, reps: 10 }),
    );

    await db.revlog.add({
      id: crypto.randomUUID(),
      card_id: card.id,
      user_id: "test-user",
      rating: 3,
      scheduled_days: 5,
      elapsed_days: 5,
      review_time_ms: 2000,
      reviewed_at: new Date().toISOString(),
      pending_sync: 0,
    });

    await db.session_log.add({
      id: crypto.randomUUID(),
      deck_id: deck.id,
      user_id: "test-user",
      started_at: new Date().toISOString(),
      ended_at: new Date().toISOString(),
      cards_reviewed: 1,
      time_elapsed_ms: 60000,
      pending_sync: 0,
    });

    const { result } = renderHook(() => useResetStats(), {
      wrapper: makeWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync();
    });

    expect(await db.decks.count()).toBe(1);
    expect(await db.cards.count()).toBe(1);
    expect(await db.revlog.count()).toBe(0);
    expect(await db.session_log.count()).toBe(0);

    const state = (await db.card_state.toArray())[0];
    expect(state.reps).toBe(0);
    expect(state.state).toBe(State.New);
  });
});
