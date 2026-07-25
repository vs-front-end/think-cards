import { describe, it, expect, beforeEach, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";

import { db } from "@/lib/db";
import { clearDb, makeWrapper, makeCard } from "@/test/helpers";

import {
  useCardById,
  useCards,
  useCreateCard,
  useDeleteCard,
  useUpdateCard,
} from "@/hooks/useCards";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("i18next", () => ({ default: { t: (k: string) => k } }));

beforeEach(clearDb);

describe("useCreateCard", () => {
  it("creates a card and its FSRS state atomically", async () => {
    const { result } = renderHook(() => useCreateCard(), {
      wrapper: makeWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({
        deck_id: crypto.randomUUID(),
        type: "basic",
        front: "What is 2+2?",
        back: "4",
      });
    });

    const cards = await db.cards.toArray();
    const states = await db.card_state.toArray();

    expect(cards).toHaveLength(1);
    expect(cards[0].front).toBe("What is 2+2?");
    expect(cards[0].pending_sync).toBe(1);
    expect(states).toHaveLength(1);
    expect(states[0].card_id).toBe(cards[0].id);
  });
});

describe("useDeleteCard", () => {
  it("soft-deletes the card without removing it from the database", async () => {
    const card = makeCard();
    await db.cards.add(card);

    const { result } = renderHook(() => useDeleteCard(), {
      wrapper: makeWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync(card.id);
    });

    const stored = await db.cards.get(card.id);
    expect(stored?.deleted_at).not.toBeNull();
    expect(stored?.pending_sync).toBe(1);
  });
});

describe("useUpdateCard", () => {
  it("updates content, type and deck while marking the card for sync", async () => {
    const card = makeCard();
    const targetDeckId = crypto.randomUUID();
    await db.cards.add(card);

    const { result } = renderHook(() => useUpdateCard(), {
      wrapper: makeWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({
        id: card.id,
        front: "Updated front",
        back: "Updated back",
        deck_id: targetDeckId,
        type: "typing",
      });
    });

    const stored = await db.cards.get(card.id);
    expect(stored).toMatchObject({
      front: "Updated front",
      back: "Updated back",
      deck_id: targetDeckId,
      type: "typing",
      pending_sync: 1,
    });
    expect(stored?.updated_at).not.toBe(card.updated_at);
  });
});

describe("card reads", () => {
  it("reads a card by id and excludes soft-deleted cards from a deck", async () => {
    const deckId = crypto.randomUUID();
    const visible = makeCard({ deck_id: deckId });
    const deleted = makeCard({
      deck_id: deckId,
      deleted_at: new Date().toISOString(),
    });
    await db.cards.bulkAdd([visible, deleted]);

    const byId = renderHook(() => useCardById(visible.id));
    const list = renderHook(() => useCards(deckId));

    await waitFor(() => {
      expect(byId.result.current.isLoading).toBe(false);
      expect(list.result.current.isLoading).toBe(false);
    });

    expect(byId.result.current.data?.id).toBe(visible.id);
    expect(list.result.current.data.map((card) => card.id)).toEqual([
      visible.id,
    ]);
  });
});
