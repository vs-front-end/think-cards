import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useResetData, useResetStats } from "@/hooks/useAccount";
import { db } from "@/lib/db";
import {
  clearDb,
  makeCard,
  makeDeck,
  makeWrapper,
} from "@/test/helpers";

const mocks = vi.hoisted(() => ({
  failTable: "",
  from: vi.fn(),
  getUser: vi.fn(),
  rpc: vi.fn(),
}));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: { getUser: mocks.getUser },
    from: mocks.from,
    rpc: mocks.rpc,
  },
}));

vi.mock("@/hooks/useSync", () => ({ resetSyncState: vi.fn() }));
vi.mock("@/store", () => ({
  useAuthStore: { getState: () => ({ logout: vi.fn() }) },
}));

beforeEach(async () => {
  await clearDb();
  vi.clearAllMocks();
  mocks.failTable = "";
  mocks.getUser.mockResolvedValue({
    data: { user: { id: "test-user" } },
    error: null,
  });
  mocks.rpc.mockImplementation((functionName: string) => {
    const message =
      functionName === "reset_statistics"
        ? "Remote statistics reset failed"
        : "Remote data reset failed";

    return Promise.resolve({ data: null, error: new Error(message) });
  });

  mocks.from.mockImplementation((table: string) => {
    let operation = "select";
    const query = {
      delete: () => {
        operation = "delete";
        return query;
      },
      eq: () => query,
      in: () => query,
      select: () => query,
      then: (
        resolve: (value: {
          data: Array<{ id: string }> | null;
          error: Error | null;
        }) => unknown,
        reject?: (reason: unknown) => unknown,
      ) => {
        const error =
          mocks.failTable === table && operation === "delete"
            ? new Error(`Remote ${table} deletion failed`)
            : null;
        return Promise.resolve({ data: [], error }).then(resolve, reject);
      },
      update: () => {
        operation = "update";
        return query;
      },
    };
    return query;
  });
});

describe("destructive account operations", () => {
  it("keeps local statistics when the remote reset fails", async () => {
    const deck = makeDeck();
    const card = makeCard({ deck_id: deck.id });
    await db.decks.add(deck);
    await db.cards.add(card);
    await db.revlog.add({
      id: crypto.randomUUID(),
      card_id: card.id,
      user_id: "test-user",
      rating: 3,
      scheduled_days: 2,
      elapsed_days: 2,
      review_time_ms: 500,
      reviewed_at: new Date().toISOString(),
      review_type: "scheduled",
      pending_sync: 0,
    });
    mocks.failTable = "revlog";
    const { result } = renderHook(() => useResetStats(), {
      wrapper: makeWrapper(),
    });

    await expect(result.current.mutateAsync()).rejects.toThrow(
      "Remote statistics reset failed",
    );
    expect(await db.revlog.count()).toBe(1);
  });

  it("keeps the local database when remote data deletion fails", async () => {
    const deck = makeDeck();
    await db.decks.add(deck);
    const { result } = renderHook(() => useResetData(), {
      wrapper: makeWrapper(),
    });

    await expect(result.current.mutateAsync()).rejects.toThrow(
      "Remote data reset failed",
    );
    expect(await db.decks.get(deck.id)).toEqual(deck);
  });
});
