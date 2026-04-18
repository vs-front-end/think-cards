import { db } from "@/lib/db";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDeleteDeck } from "@/hooks/useDecks";
import { clearDb, makeWrapper, makeDeck, makeCard } from "@/test/helpers";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("i18next", () => ({ default: { t: (k: string) => k } }));

vi.mock("@/store", () => {
  const mockState = { user: { id: "test-user" }, session: null };

  const useAuthStore = (selector: (s: typeof mockState) => unknown) => {
    return selector(mockState);
  };

  useAuthStore.getState = () => mockState;
  return { useAuthStore };
});

beforeEach(clearDb);

describe("useDeleteDeck", () => {
  it("recursively soft-deletes a deck, its children, and all their cards", async () => {
    const rootId = crypto.randomUUID();
    const childId = crypto.randomUUID();

    await db.decks.bulkAdd([
      makeDeck({ id: rootId }),
      makeDeck({ id: childId, parent_id: rootId }),
    ]);

    await db.cards.bulkAdd([
      makeCard({ deck_id: rootId }),
      makeCard({ deck_id: childId }),
    ]);

    const { result } = renderHook(() => useDeleteDeck(), {
      wrapper: makeWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync(rootId);
    });

    const decks = await db.decks.toArray();
    const cards = await db.cards.toArray();

    expect(decks.every((d) => d.deleted_at !== null)).toBe(true);
    expect(decks.every((d) => d.pending_sync === 1)).toBe(true);
    expect(cards.every((c) => c.deleted_at !== null)).toBe(true);
  });

  it("does not affect unrelated decks or their cards", async () => {
    const targetId = crypto.randomUUID();
    const otherId = crypto.randomUUID();

    await db.decks.bulkAdd([
      makeDeck({ id: targetId }),
      makeDeck({ id: otherId }),
    ]);

    await db.cards.add(makeCard({ deck_id: otherId }));

    const { result } = renderHook(() => useDeleteDeck(), {
      wrapper: makeWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync(targetId);
    });

    const otherDeck = await db.decks.get(otherId);
    const otherCard = (await db.cards.toArray())[0];

    expect(otherDeck?.deleted_at).toBeNull();
    expect(otherCard.deleted_at).toBeNull();
  });
});
