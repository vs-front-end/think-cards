import { State } from "ts-fsrs";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";

import { useResetData, useResetStats } from "@/hooks/useAccount";
import { db } from "@/lib/db";
import {
  clearDb,
  makeWrapper,
  makeDeck,
  makeCard,
  makeCardState,
} from "@/test/helpers";

const mocks = vi.hoisted(() => ({
  rpc: vi.fn(),
}));

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
      rpc: mocks.rpc,
      auth: {
        getUser: () => Promise.resolve({ data: { user: { id: "test-user" } } }),
      },
    },
  };
});

vi.mock("@/hooks/useSync", () => ({ resetSyncState: vi.fn() }));

beforeEach(async () => {
  await clearDb();
  vi.clearAllMocks();
  mocks.rpc.mockResolvedValue({
    data: "2026-07-25T12:00:00.000Z",
    error: null,
  });
});

const mutateAndFlush = async (mutation: () => Promise<unknown>) => {
  await act(async () => {
    await mutation();
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
};

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
      review_type: "scheduled",
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

    await mutateAndFlush(result.current.mutateAsync);

    expect(await db.decks.count()).toBe(1);
    expect(await db.cards.count()).toBe(1);
    expect(await db.revlog.count()).toBe(0);
    expect(await db.session_log.count()).toBe(0);

    const state = (await db.card_state.toArray())[0];
    expect(state.reps).toBe(0);
    expect(state.state).toBe(State.New);
    expect(mocks.rpc).toHaveBeenCalledWith("reset_statistics");
  });

  it(
    "resets every local state in a large account through one server operation",
    async () => {
      const deck = makeDeck({ id: "large-deck", user_id: "test-user" });

      const cards = Array.from({ length: 1_205 }, (_, index) =>
        makeCard({ id: `card-${index}`, deck_id: deck.id }),
      );

      const states = cards.map((card, index) =>
        makeCardState(card.id, {
          id: `state-${index}`,
          state: State.Review,
          reps: 10,
        }),
      );

      await db.decks.add(deck);
      await db.cards.bulkAdd(cards);
      await db.card_state.bulkAdd(states);

      const { result } = renderHook(() => useResetStats(), {
        wrapper: makeWrapper(),
      });

      await mutateAndFlush(result.current.mutateAsync);

      const resetStates = await db.card_state.toArray();
      expect(resetStates).toHaveLength(1_205);

      expect(
        resetStates.every(
          (state) =>
            state.state === State.New &&
            state.reps === 0 &&
            state.pending_sync === 0,
        ),
      ).toBe(true);

      expect(mocks.rpc).toHaveBeenCalledTimes(1);
      expect(mocks.rpc).toHaveBeenCalledWith("reset_statistics");
    },
    15_000,
  );
});

describe("useResetData", () => {
  it("clears every local study table", async () => {
    const deck = makeDeck();
    const card = makeCard({ deck_id: deck.id });
    const state = makeCardState(card.id);

    await db.decks.add(deck);
    await db.cards.add(card);
    await db.card_state.add(state);
    await db.sync_meta.add({
      user_id: "test-user",
      last_synced_at: new Date().toISOString(),
      initial_pull_done: true,
      stats_reset_at: null,
      data_reset_at: null,
    });

    const { result } = renderHook(() => useResetData(), {
      wrapper: makeWrapper(),
    });

    await mutateAndFlush(result.current.mutateAsync);

    expect(await db.decks.count()).toBe(0);
    expect(await db.cards.count()).toBe(0);
    expect(await db.card_state.count()).toBe(0);

    expect(await db.sync_meta.get("test-user")).toEqual({
      user_id: "test-user",
      last_synced_at: "2026-07-25T12:00:00.000Z",
      initial_pull_done: true,
      stats_reset_at: "2026-07-25T12:00:00.000Z",
      data_reset_at: "2026-07-25T12:00:00.000Z",
    });

    expect(mocks.rpc).toHaveBeenCalledWith("reset_all_data");
  });
});
