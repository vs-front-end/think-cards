import { db } from "@/lib/db";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCreateCard, useDeleteCard } from "@/hooks/useCards";
import { clearDb, makeWrapper, makeCard } from "@/test/helpers";

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
