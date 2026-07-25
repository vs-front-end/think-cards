import { beforeEach, describe, expect, it, vi } from "vitest";

import { syncAll } from "@/lib/sync";
import { db } from "@/lib/db";
import { useSyncStore } from "@/store";
import {
  clearDb,
  makeCard,
  makeCardState,
  makeDeck,
} from "@/test/helpers";

type RemoteRow = Record<string, unknown>;

type QueryResult = {
  data: RemoteRow[] | null;
  error: Error | null;
};

type UpsertOptions = {
  onConflict?: string;
};

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
  getSession: vi.fn(),
  rpc: vi.fn(),
  selectErrorTables: new Set<string>(),
  tables: new Map<string, RemoteRow[]>(),
  upsertCalls: new Array<{ table: string; rows: RemoteRow[] }>(),
  upsertErrorTables: new Set<string>(),
}));

class QueryBuilder implements PromiseLike<QueryResult> {
  private readonly table: string;
  private greaterThan: { column: string; value: string } | null = null;
  private maxRows: number | null = null;
  private rangeStart = 0;
  private rangeEnd: number | null = null;

  constructor(table: string) {
    this.table = table;
  }

  select(): QueryBuilder {
    return this;
  }

  order(): QueryBuilder {
    return this;
  }

  gt(column: string, value: string): QueryBuilder {
    this.greaterThan = { column, value };
    return this;
  }

  limit(count: number): QueryBuilder {
    this.maxRows = count;
    return this;
  }

  range(start: number, end: number): QueryBuilder {
    this.rangeStart = start;
    this.rangeEnd = end;
    return this;
  }

  async upsert(
    rows: RemoteRow[],
    options: UpsertOptions = {},
  ): Promise<{ error: Error | null }> {
    mocks.upsertCalls.push({ table: this.table, rows });

    if (mocks.upsertErrorTables.has(this.table)) {
      return { error: new Error(`Failed to upsert ${this.table}`) };
    }

    const conflictKey = options.onConflict ?? "id";
    const storedRows = mocks.tables.get(this.table) ?? [];

    for (const row of rows) {
      const existingIndex = storedRows.findIndex(
        (stored) => stored[conflictKey] === row[conflictKey],
      );

      if (existingIndex === -1) {
        storedRows.push({ ...row });
      } else {
        storedRows[existingIndex] = { ...row };
      }
    }

    mocks.tables.set(this.table, storedRows);
    return { error: null };
  }

  then<TResult1 = QueryResult, TResult2 = never>(
    onfulfilled?:
      | ((value: QueryResult) => TResult1 | PromiseLike<TResult1>)
      | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    return Promise.resolve(this.result()).then(onfulfilled, onrejected);
  }

  private result(): QueryResult {
    if (mocks.selectErrorTables.has(this.table)) {
      return {
        data: null,
        error: new Error(`Failed to select ${this.table}`),
      };
    }

    let rows = [...(mocks.tables.get(this.table) ?? [])];

    if (this.greaterThan) {
      const { column, value } = this.greaterThan;
      rows = rows.filter((row) => String(row[column]) > value);
    }

    const rangeEnd = this.rangeEnd ?? rows.length - 1;
    rows = rows.slice(this.rangeStart, rangeEnd + 1);

    if (this.maxRows !== null) {
      rows = rows.slice(0, this.maxRows);
    }

    return { data: rows, error: null };
  }
}

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: { getSession: mocks.getSession },
    from: mocks.from,
    rpc: mocks.rpc,
  },
}));

const tableNames = [
  "decks",
  "cards",
  "card_state",
  "revlog",
  "session_log",
];

beforeEach(async () => {
  await clearDb();
  vi.clearAllMocks();
  mocks.selectErrorTables.clear();
  mocks.tables.clear();
  mocks.upsertCalls.length = 0;
  mocks.upsertErrorTables.clear();

  for (const table of tableNames) {
    mocks.tables.set(table, []);
  }

  mocks.from.mockImplementation((table: string) => new QueryBuilder(table));
  mocks.getSession.mockResolvedValue({
    data: { session: { access_token: "token" } },
  });
  mocks.rpc.mockResolvedValue({
    data: "2026-07-25T12:00:00.000Z",
    error: null,
  });
  Object.defineProperty(navigator, "onLine", {
    configurable: true,
    value: true,
  });
  useSyncStore.setState({ isSyncing: false, initialSyncDone: false });
});

describe("syncAll guards", () => {
  it("does nothing while offline", async () => {
    Object.defineProperty(navigator, "onLine", {
      configurable: true,
      value: false,
    });

    expect(await syncAll("test-user")).toBe(false);
    expect(mocks.getSession).not.toHaveBeenCalled();
  });

  it("does nothing without an authenticated session", async () => {
    mocks.getSession.mockResolvedValue({ data: { session: null } });

    expect(await syncAll("test-user")).toBe(false);
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it("skips work when neither local nor remote data changed", async () => {
    await db.sync_meta.put({
      user_id: "test-user",
      last_synced_at: "2026-07-25T10:00:00.000Z",
      initial_pull_done: true,
    });

    expect(await syncAll("test-user")).toBe(false);
    expect(mocks.upsertCalls).toHaveLength(0);
  });
});

describe("syncAll push", () => {
  it("pushes local records without sync metadata and marks them synced", async () => {
    const deck = makeDeck({ pending_sync: 1 });
    const card = makeCard({ deck_id: deck.id, pending_sync: 1 });
    const state = makeCardState(card.id, { pending_sync: 1 });
    await db.decks.add(deck);
    await db.cards.add(card);
    await db.card_state.add(state);
    const revlogId = crypto.randomUUID();
    const sessionId = crypto.randomUUID();
    await db.revlog.add({
      id: revlogId,
      card_id: card.id,
      user_id: "test-user",
      rating: 3,
      scheduled_days: 2,
      elapsed_days: 2,
      review_time_ms: 500,
      reviewed_at: new Date().toISOString(),
      pending_sync: 1,
    });
    await db.session_log.add({
      id: sessionId,
      deck_id: deck.id,
      user_id: "test-user",
      started_at: new Date().toISOString(),
      ended_at: null,
      cards_reviewed: 1,
      time_elapsed_ms: 500,
      pending_sync: 1,
    });

    expect(await syncAll("test-user")).toBe(true);

    const pushedRows = mocks.upsertCalls.flatMap((call) => call.rows);
    expect(
      pushedRows.every((row) => !Object.hasOwn(row, "pending_sync")),
    ).toBe(true);
    expect((await db.decks.get(deck.id))?.pending_sync).toBe(0);
    expect((await db.cards.get(card.id))?.pending_sync).toBe(0);
    expect((await db.card_state.get(state.id))?.pending_sync).toBe(0);
    expect((await db.revlog.get(revlogId))?.pending_sync).toBe(0);
    expect((await db.session_log.get(sessionId))?.pending_sync).toBe(0);
    expect(await db.sync_meta.get("test-user")).toEqual({
      user_id: "test-user",
      last_synced_at: "2026-07-25T12:00:00.000Z",
      initial_pull_done: true,
    });
  });

  it("keeps a failed record pending and always releases the sync lock", async () => {
    const card = makeCard({ pending_sync: 1 });
    await db.cards.add(card);
    mocks.upsertErrorTables.add("cards");

    await expect(syncAll("test-user")).rejects.toThrow(
      "Failed to upsert cards",
    );

    expect((await db.cards.get(card.id))?.pending_sync).toBe(1);
    expect(useSyncStore.getState().isSyncing).toBe(false);
    expect(await db.sync_meta.get("test-user")).toBeUndefined();
  });
});

describe("syncAll pull", () => {
  it("applies a newer remote record and stores the server timestamp", async () => {
    const deck = makeDeck({
      id: "deck-id",
      name: "Local name",
      updated_at: "2026-07-25T09:00:00.000Z",
    });
    await db.decks.add(deck);
    await db.sync_meta.put({
      user_id: "test-user",
      last_synced_at: "2026-07-25T08:00:00.000Z",
      initial_pull_done: true,
    });
    mocks.tables.set("decks", [
      {
        ...deck,
        name: "Remote name",
        updated_at: "2026-07-25T11:00:00.000Z",
      },
    ]);

    expect(await syncAll("test-user")).toBe(true);

    expect(await db.decks.get(deck.id)).toMatchObject({
      name: "Remote name",
      updated_at: "2026-07-25T11:00:00.000Z",
      pending_sync: 0,
    });
    expect(
      (await db.sync_meta.get("test-user"))?.last_synced_at,
    ).toBe("2026-07-25T12:00:00.000Z");
  });

  it("applies a remote soft deletion locally", async () => {
    const card = makeCard({
      id: "card-id",
      updated_at: "2026-07-25T09:00:00.000Z",
    });
    await db.cards.add(card);
    await db.sync_meta.put({
      user_id: "test-user",
      last_synced_at: "2026-07-25T08:00:00.000Z",
      initial_pull_done: true,
    });
    mocks.tables.set("cards", [
      {
        ...card,
        deleted_at: "2026-07-25T11:00:00.000Z",
        updated_at: "2026-07-25T11:00:00.000Z",
      },
    ]);

    expect(await syncAll("test-user")).toBe(true);

    expect(await db.cards.get(card.id)).toMatchObject({
      deleted_at: "2026-07-25T11:00:00.000Z",
      pending_sync: 0,
    });
  });

  it("does not overwrite a newer local record with older remote data", async () => {
    const deck = makeDeck({
      id: "deck-id",
      name: "Newer local name",
      updated_at: "2026-07-25T12:00:00.000Z",
    });
    await db.decks.add(deck);
    await db.sync_meta.put({
      user_id: "test-user",
      last_synced_at: "2026-07-25T08:00:00.000Z",
      initial_pull_done: true,
    });
    mocks.tables.set("decks", [
      {
        ...deck,
        name: "Older remote name",
        updated_at: "2026-07-25T11:00:00.000Z",
      },
    ]);

    expect(await syncAll("test-user")).toBe(true);
    expect((await db.decks.get(deck.id))?.name).toBe("Newer local name");
  });

  it("pulls remote records beyond the first 500-row page", async () => {
    const remoteDecks = Array.from({ length: 501 }, (_, index) => ({
      ...makeDeck({
        id: `deck-${index}`,
        name: `Deck ${index}`,
      }),
    }));
    mocks.tables.set("decks", remoteDecks);

    expect(await syncAll("test-user")).toBe(true);
    expect(await db.decks.count()).toBe(501);
    expect((await db.decks.get("deck-500"))?.name).toBe("Deck 500");
  });
});
