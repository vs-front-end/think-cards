import { db } from "@/lib/db";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMoveCards, useBulkDeleteCards } from "@/hooks/useCardsWithState";
import { clearDb, makeWrapper, makeCard } from "@/test/helpers";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("i18next", () => ({ default: { t: (k: string) => k } }));

beforeEach(clearDb);

describe("useMoveCards", () => {
  it("updates deck_id and marks pending_sync for all moved cards", async () => {
    const sourceDeckId = crypto.randomUUID();
    const targetDeckId = crypto.randomUUID();

    const cards = [
      makeCard({ deck_id: sourceDeckId }),
      makeCard({ deck_id: sourceDeckId }),
    ];

    await db.cards.bulkAdd(cards);

    const { result } = renderHook(() => useMoveCards(), {
      wrapper: makeWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({
        cardIds: cards.map((c) => c.id),
        targetDeckId,
      });
    });

    const stored = await db.cards.toArray();
    expect(stored.every((c) => c.deck_id === targetDeckId)).toBe(true);
    expect(stored.every((c) => c.pending_sync === 1)).toBe(true);
  });
});

describe("useBulkDeleteCards", () => {
  it("soft-deletes all given cards without removing them from the database", async () => {
    const cards = [makeCard(), makeCard(), makeCard()];
    await db.cards.bulkAdd(cards);

    const { result } = renderHook(() => useBulkDeleteCards(), {
      wrapper: makeWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync(cards.map((c) => c.id));
    });

    const stored = await db.cards.toArray();
    expect(stored).toHaveLength(3);
    expect(stored.every((c) => c.deleted_at !== null)).toBe(true);
    expect(stored.every((c) => c.pending_sync === 1)).toBe(true);
  });

  it("does not affect cards outside the given ids", async () => {
    const target = makeCard();
    const bystander = makeCard();
    await db.cards.bulkAdd([target, bystander]);

    const { result } = renderHook(() => useBulkDeleteCards(), {
      wrapper: makeWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync([target.id]);
    });

    const bystanderStored = await db.cards.get(bystander.id);
    expect(bystanderStored?.deleted_at).toBeNull();
  });
});
