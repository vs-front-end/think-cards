import { describe, it, expect, beforeEach, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";

import { db } from "@/lib/db";
import { clearDb, makeWrapper, makeDeck, makeCard } from "@/test/helpers";

import {
  useCreateDeck,
  useDecks,
  useDeleteDeck,
  useUpdateDeck,
} from "@/hooks/useDecks";

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

describe("deck CRUD", () => {
  it("creates and reads a deck marked for synchronization", async () => {
    const createHook = renderHook(() => useCreateDeck(), {
      wrapper: makeWrapper(),
    });

    let createdId = "";
    await act(async () => {
      const created = await createHook.result.current.mutateAsync({
        name: "Biology",
        parent_id: null,
        daily_goal: 30,
        language: "en",
      });
      createdId = created.id;
    });

    const readHook = renderHook(() => useDecks());

    await waitFor(() => {
      expect(readHook.result.current.isLoading).toBe(false);
      expect(readHook.result.current.data).toHaveLength(1);
    });

    expect(readHook.result.current.data?.[0]).toMatchObject({
      id: createdId,
      user_id: "test-user",
      name: "Biology",
      daily_goal: 30,
      language: "en",
      pending_sync: 1,
      deleted_at: null,
    });
  });

  it("updates deck fields and marks the change for synchronization", async () => {
    const deck = makeDeck();
    await db.decks.add(deck);

    const { result } = renderHook(() => useUpdateDeck(), {
      wrapper: makeWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({
        id: deck.id,
        name: "Updated deck",
        parent_id: null,
        daily_goal: 40,
        language: "pt-BR",
      });
    });

    const stored = await db.decks.get(deck.id);
    expect(stored).toMatchObject({
      name: "Updated deck",
      daily_goal: 40,
      language: "pt-BR",
      pending_sync: 1,
    });
    expect(stored?.updated_at).not.toBe(deck.updated_at);
  });
});

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
