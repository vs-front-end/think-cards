import { db } from "@/lib/db";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useStudySession } from "@/hooks/useStudySession";

import {
  clearDb,
  makeDeck,
  makeCard,
  makeCardState,
  makeWrapper,
} from "@/test/helpers";

vi.mock("@/store", () => {
  const mockState = { user: { id: "test-user" }, session: null };

  const useAuthStore = (selector: (s: typeof mockState) => unknown) => {
    return selector(mockState);
  };

  useAuthStore.getState = () => mockState;
  return { useAuthStore };
});

vi.mock("@/lib/sync", () => ({ syncAll: vi.fn().mockResolvedValue(true) }));

beforeEach(clearDb);

const seedDeck = async (deckId: string, cardCount = 1) => {
  await db.decks.add(makeDeck({ id: deckId }));
  for (let i = 0; i < cardCount; i++) {
    const card = makeCard({ deck_id: deckId });
    await db.cards.add(card);

    await db.card_state.add(
      makeCardState(card.id, {
        due: new Date(Date.now() - 86_400_000).toISOString(),
      }),
    );
  }
};

describe("useStudySession", () => {
  it("loads due cards into the queue", async () => {
    const deckId = crypto.randomUUID();
    await seedDeck(deckId, 3);

    const { result } = renderHook(() => useStudySession(deckId), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    expect(result.current.remainingCount).toBe(3);
    expect(result.current.currentCard).not.toBeNull();
    expect(result.current.emptyReason).toBeNull();
  });

  it("reports no_cards when the deck has no cards", async () => {
    const deckId = crypto.randomUUID();
    await db.decks.add(makeDeck({ id: deckId }));

    const { result } = renderHook(() => useStudySession(deckId), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    expect(result.current.emptyReason).toBe("no_cards");
    expect(result.current.remainingCount).toBe(0);
  });

  it("reports no_due when cards exist but none are due today", async () => {
    const deckId = crypto.randomUUID();
    await db.decks.add(makeDeck({ id: deckId }));

    const card = makeCard({ deck_id: deckId });
    await db.cards.add(card);

    await db.card_state.add(
      makeCardState(card.id, {
        due: new Date(Date.now() + 7 * 86_400_000).toISOString(),
      }),
    );

    const { result } = renderHook(() => useStudySession(deckId), {
      wrapper: makeWrapper(),
    });
    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    expect(result.current.emptyReason).toBe("no_due");
  });

  it("loads future cards in practice mode without changing their schedule", async () => {
    const deckId = crypto.randomUUID();
    await db.decks.add(makeDeck({ id: deckId }));

    const card = makeCard({ deck_id: deckId });
    const due = new Date(Date.now() + 7 * 86_400_000).toISOString();
    const state = makeCardState(card.id, { due, stability: 3, reps: 2 });

    await db.cards.add(card);
    await db.card_state.add(state);

    const { result } = renderHook(
      () => useStudySession(deckId, "practice"),
      { wrapper: makeWrapper() },
    );

    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    expect(result.current.emptyReason).toBeNull();
    expect(result.current.remainingCount).toBe(1);
    expect(result.current.previewIntervals).toBeNull();

    await act(async () => {
      await result.current.answerCard(3);
    });

    expect(await db.card_state.get(state.id)).toEqual(state);
    const practiceReviews = await db.revlog.toArray();
    expect(practiceReviews).toHaveLength(1);
    expect(practiceReviews[0].review_type).toBe("practice");
    expect(await db.session_log.count()).toBe(0);
  });

  it("does not apply the deck daily limit to the temporary practice queue", async () => {
    const deckId = crypto.randomUUID();
    await db.decks.add(makeDeck({ id: deckId, daily_goal: 1 }));

    for (let i = 0; i < 3; i++) {
      const card = makeCard({ deck_id: deckId });
      await db.cards.add(card);
      await db.card_state.add(
        makeCardState(card.id, {
          due: new Date(Date.now() + 7 * 86_400_000).toISOString(),
        }),
      );
    }

    const { result } = renderHook(
      () => useStudySession(deckId, "practice"),
      { wrapper: makeWrapper() },
    );

    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    expect(result.current.remainingCount).toBe(3);
  });

  it("shows each practice card only once even when it is missed", async () => {
    const deckId = crypto.randomUUID();
    await seedDeck(deckId);

    const { result } = renderHook(
      () => useStudySession(deckId, "practice"),
      { wrapper: makeWrapper() },
    );

    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    await act(async () => {
      await result.current.answerCard(1);
    });

    expect(result.current.remainingCount).toBe(0);
    expect(result.current.isDone).toBe(true);
    const practiceReviews = await db.revlog.toArray();
    expect(practiceReviews).toHaveLength(1);
    expect(practiceReviews[0].review_type).toBe("practice");
  });

  it("ignores overlapping answers for the same practice card", async () => {
    const deckId = crypto.randomUUID();
    await seedDeck(deckId);

    const { result } = renderHook(
      () => useStudySession(deckId, "practice"),
      { wrapper: makeWrapper() },
    );

    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    await act(async () => {
      await Promise.all([
        result.current.answerCard(3),
        result.current.answerCard(3),
      ]);
    });

    expect(result.current.answeredCount).toBe(1);
    expect(await db.revlog.count()).toBe(1);
  });

  it("answerCard updates card_state via FSRS and appends a revlog entry", async () => {
    const deckId = crypto.randomUUID();
    await seedDeck(deckId);

    const { result } = renderHook(() => useStudySession(deckId), {
      wrapper: makeWrapper(),
    });
    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    const stateId = (await db.card_state.toArray())[0].id;

    await act(async () => {
      await result.current.answerCard(3);
    });

    const updatedState = await db.card_state.get(stateId);
    const revlogs = await db.revlog.toArray();

    expect(updatedState?.reps).toBe(1);
    expect(updatedState?.pending_sync).toBe(1);
    expect(revlogs).toHaveLength(1);
    expect(revlogs[0].rating).toBe(3);
    expect(result.current.answeredCount).toBe(1);
    expect(result.current.remainingCount).toBe(0);
  });
});
