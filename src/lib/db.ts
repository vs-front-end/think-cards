import Dexie, { type EntityTable } from "dexie";

export type CardType = "basic" | "cloze" | "typing";
export type Rating = 1 | 2 | 3 | 4;

export interface IDeck {
  id: string;
  user_id: string;
  name: string;
  parent_id: string | null;
  daily_goal: number;
  created_at: string;
  updated_at: string;
  pending_sync: boolean;
  deleted_at: string | null;
}

export interface ICard {
  id: string;
  deck_id: string;
  type: CardType;
  front: string;
  back: string;
  created_at: string;
  updated_at: string;
  pending_sync: boolean;
  deleted_at: string | null;
}

export interface ICardState {
  id: string;
  card_id: string;
  stability: number;
  difficulty: number;
  due: string;
  last_review: string | null;
  state: number;
  reps: number;
  lapses: number;
  updated_at: string;
  pending_sync: boolean;
}

export interface IRevlog {
  id: string;
  card_id: string;
  user_id: string;
  rating: Rating;
  scheduled_days: number;
  elapsed_days: number;
  review_time_ms: number;
  reviewed_at: string;
}

export interface ISessionLog {
  id: string;
  deck_id: string;
  user_id: string;
  started_at: string;
  ended_at: string | null;
  cards_reviewed: number;
  time_elapsed_ms: number;
}

export interface ISyncMeta {
  user_id: string;
  last_synced_at: string | null;
}

class ThinkCardsDB extends Dexie {
  decks!: EntityTable<IDeck, "id">;
  cards!: EntityTable<ICard, "id">;
  card_state!: EntityTable<ICardState, "id">;
  revlog!: EntityTable<IRevlog, "id">;
  session_log!: EntityTable<ISessionLog, "id">;
  sync_meta!: EntityTable<ISyncMeta, "user_id">;

  constructor() {
    super("ThinkCardsDB");
    this.version(1).stores({
      decks: "id, user_id, parent_id, pending_sync, deleted_at",
      cards: "id, deck_id, type, pending_sync, deleted_at",
      card_state: "id, card_id, due, state, pending_sync",
      revlog: "id, card_id, reviewed_at",
      session_log: "id, deck_id, started_at",
      sync_meta: "user_id",
    });

    this.version(2).stores({
      revlog: "id, card_id, user_id, reviewed_at",
      session_log: "id, deck_id, user_id, started_at",
    });
  }
}

export const db = new ThinkCardsDB();
