import Dexie, { type EntityTable } from "dexie";

export type CardType = "basic" | "cloze" | "typing";
export type Rating = 1 | 2 | 3 | 4;
export type SyncFlag = 0 | 1;

export interface IDeck {
  id: string;
  user_id: string;
  name: string;
  parent_id: string | null;
  daily_goal: number;
  created_at: string;
  updated_at: string;
  pending_sync: SyncFlag;
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
  pending_sync: SyncFlag;
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
  learning_steps: number;
  updated_at: string;
  pending_sync: SyncFlag;
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
  pending_sync: SyncFlag;
}

export interface ISessionLog {
  id: string;
  deck_id: string;
  user_id: string;
  started_at: string;
  ended_at: string | null;
  cards_reviewed: number;
  time_elapsed_ms: number;
  pending_sync: SyncFlag;
}

export interface ISyncMeta {
  user_id: string;
  last_synced_at: string | null;
  initial_pull_done: boolean;
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

    this.version(3).stores({
      revlog: "id, card_id, user_id, reviewed_at, pending_sync",
      session_log: "id, deck_id, user_id, started_at, pending_sync",
    }).upgrade(async (tx) => {
      await tx.table("revlog").toCollection().modify({ pending_sync: 0 });
      await tx.table("session_log").toCollection().modify({ pending_sync: 0 });
    });

    this.version(4).stores({}).upgrade(async (tx) => {
      await tx.table("card_state").toCollection().modify((record) => {
        if (record.learning_steps === undefined) {
          record.learning_steps = 0;
        }
      });
    });

    this.version(5).stores({}).upgrade(async (tx) => {
      await tx.table("sync_meta").toCollection().modify((record) => {
        if (record.initial_pull_done === undefined) {
          record.initial_pull_done = false;
        }
      });
    });
  }
}

export const db = new ThinkCardsDB();
