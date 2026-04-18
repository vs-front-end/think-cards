import { db } from "@/lib/db";
import { State } from "ts-fsrs";
import { createElement } from "react";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { IDeck, ICard, ICardState } from "@/lib/db";

export const clearDb = () =>
  Promise.all([
    db.decks.clear(),
    db.cards.clear(),
    db.card_state.clear(),
    db.revlog.clear(),
    db.session_log.clear(),
    db.sync_meta.clear(),
  ]);

export const makeWrapper = () => {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return ({ children }: { children: ReactNode }) => {
    return createElement(QueryClientProvider, { client: qc }, children);
  };
};

const uid = () => crypto.randomUUID();
const now = () => new Date().toISOString();

export const makeDeck = (overrides: Partial<IDeck> = {}): IDeck => ({
  id: uid(),
  user_id: "test-user",
  name: "Test Deck",
  parent_id: null,
  daily_goal: 20,
  created_at: now(),
  updated_at: now(),
  pending_sync: 0,
  deleted_at: null,
  ...overrides,
});

export const makeCard = (overrides: Partial<ICard> = {}): ICard => ({
  id: uid(),
  deck_id: uid(),
  type: "basic",
  front: "Front",
  back: "Back",
  created_at: now(),
  updated_at: now(),
  pending_sync: 0,
  deleted_at: null,
  ...overrides,
});

export const makeCardState = (
  cardId: string,
  overrides: Partial<ICardState> = {},
): ICardState => ({
  id: uid(),
  card_id: cardId,
  stability: 0,
  difficulty: 0,
  due: now(),
  last_review: null,
  state: State.New,
  reps: 0,
  lapses: 0,
  learning_steps: 0,
  updated_at: now(),
  pending_sync: 0,
  ...overrides,
});
