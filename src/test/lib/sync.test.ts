import { beforeEach, describe, expect, it, vi } from "vitest";

import { flushPendingChanges, syncAll } from "@/lib/sync";
import { db } from "@/lib/db";
import { useSyncStore } from "@/store";
import { clearDb, makeCard, makeCardState, makeDeck } from "@/test/helpers";

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
  upsertGates: new Map<string, Promise<void>>(),
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

    await mocks.upsertGates.get(this.table);

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

const tableNames = ["decks", "cards", "card_state", "revlog", "session_log"];

beforeEach(async () => {
  await clearDb();
  vi.clearAllMocks();
  mocks.selectErrorTables.clear();
  mocks.tables.clear();
  mocks.upsertGates.clear();
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
      stats_reset_at: null,
      data_reset_at: null,
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
      review_type: "practice",
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
    expect(pushedRows.every((row) => !Object.hasOwn(row, "pending_sync"))).toBe(
      true,
    );
    expect((await db.decks.get(deck.id))?.pending_sync).toBe(0);
    expect((await db.cards.get(card.id))?.pending_sync).toBe(0);
    expect((await db.card_state.get(state.id))?.pending_sync).toBe(0);
    expect((await db.revlog.get(revlogId))?.pending_sync).toBe(0);
    expect(
      pushedRows.find((row) => row.id === revlogId)?.review_type,
    ).toBe("practice");
    expect((await db.session_log.get(sessionId))?.pending_sync).toBe(0);
    expect(await db.sync_meta.get("test-user")).toEqual({
      user_id: "test-user",
      last_synced_at: "2026-07-25T12:00:00.000Z",
      initial_pull_done: true,
      stats_reset_at: null,
      data_reset_at: null,
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

  it("does not fall back to the device clock when the server watermark fails", async () => {
    const card = makeCard({ pending_sync: 1 });
    await db.cards.add(card);

    mocks.rpc.mockResolvedValue({
      data: null,
      error: new Error("Server clock unavailable"),
    });

    await expect(syncAll("test-user")).rejects.toThrow(
      "Server clock unavailable",
    );

    expect(mocks.upsertCalls).toHaveLength(0);
    expect((await db.cards.get(card.id))?.pending_sync).toBe(1);
    expect(await db.sync_meta.get("test-user")).toBeUndefined();
    expect(useSyncStore.getState().isSyncing).toBe(false);
  });

  it("does not acknowledge a newer local edit that was not in the uploaded snapshot", async () => {
    const firstUpdatedAt = "2026-07-25T10:00:00.000Z";
    const deletedAt = "2026-07-25T10:01:00.000Z";

    const card = makeCard({
      id: "card-race",
      updated_at: firstUpdatedAt,
      pending_sync: 1,
    });

    await db.cards.add(card);

    let releaseUpload: (() => void) | undefined;
    mocks.upsertGates.set(
      "cards",
      new Promise<void>((resolve) => {
        releaseUpload = resolve;
      }),
    );

    const firstSync = syncAll("test-user");

    await vi.waitFor(() =>
      expect(mocks.upsertCalls.some((call) => call.table === "cards")).toBe(
        true,
      ),
    );

    await db.cards.update(card.id, {
      deleted_at: deletedAt,
      updated_at: deletedAt,
      pending_sync: 1,
    });

    const coalescedSync = syncAll("test-user");
    mocks.upsertGates.delete("cards");
    releaseUpload?.();

    await Promise.all([firstSync, coalescedSync]);

    const cardPushes = mocks.upsertCalls.filter(
      (call) => call.table === "cards",
    );

    expect(cardPushes).toHaveLength(2);

    expect(cardPushes[0].rows[0]).toMatchObject({
      updated_at: firstUpdatedAt,
      deleted_at: null,
    });

    expect(cardPushes[1].rows[0]).toMatchObject({
      updated_at: deletedAt,
      deleted_at: deletedAt,
    });

    expect(await db.cards.get(card.id)).toMatchObject({
      deleted_at: deletedAt,
      pending_sync: 0,
    });
  });

  it("waits for an in-flight upload before reporting that pending changes are flushed", async () => {
    const card = makeCard({ pending_sync: 1 });
    await db.cards.add(card);

    let releaseUpload: (() => void) | undefined;
    mocks.upsertGates.set(
      "cards",
      new Promise<void>((resolve) => {
        releaseUpload = resolve;
      }),
    );

    const runningSync = syncAll("test-user");
    await vi.waitFor(() =>
      expect(mocks.upsertCalls.some((call) => call.table === "cards")).toBe(
        true,
      ),
    );

    let flushFinished = false;
    const flush = flushPendingChanges("test-user").then((result) => {
      flushFinished = true;
      return result;
    });

    await Promise.resolve();
    expect(flushFinished).toBe(false);

    mocks.upsertGates.delete("cards");
    releaseUpload?.();

    await expect(flush).resolves.toBe(true);
    await runningSync;
  });
});

describe("syncAll pull", () => {
  it("preserves the type of a remote practice review", async () => {
    const reviewId = crypto.randomUUID();
    mocks.tables.set("revlog", [
      {
        id: reviewId,
        card_id: crypto.randomUUID(),
        user_id: "test-user",
        rating: 3,
        scheduled_days: 0,
        elapsed_days: 0,
        review_time_ms: 500,
        reviewed_at: "2026-07-25T11:00:00.000Z",
        sync_updated_at: "2026-07-25T11:00:00.000Z",
        review_type: "practice",
      },
    ]);

    expect(await syncAll("test-user")).toBe(true);
    expect((await db.revlog.get(reviewId))?.review_type).toBe("practice");
  });

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
      stats_reset_at: null,
      data_reset_at: null,
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
    expect((await db.sync_meta.get("test-user"))?.last_synced_at).toBe(
      "2026-07-25T12:00:00.000Z",
    );
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
      stats_reset_at: null,
      data_reset_at: null,
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

  it("stores a remote tombstone even when the record is absent locally", async () => {
    mocks.tables.set("cards", [
      {
        ...makeCard({
          id: "remote-deleted-card",
          updated_at: "2026-07-25T11:00:00.000Z",
        }),
        deleted_at: "2026-07-25T11:00:00.000Z",
      },
    ]);

    expect(await syncAll("test-user")).toBe(true);

    expect(await db.cards.get("remote-deleted-card")).toMatchObject({
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
      stats_reset_at: null,
      data_reset_at: null,
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

  it("propagates a remote statistics reset and removes stale local logs", async () => {
    const resetAt = "2026-07-25T11:30:00.000Z";
    const deck = makeDeck({ id: "deck-reset", user_id: "test-user" });
    const card = makeCard({ id: "card-reset", deck_id: deck.id });

    const state = makeCardState(card.id, {
      id: "state-reset",
      state: 2,
      reps: 12,
      updated_at: "2026-07-25T10:00:00.000Z",
    });

    await db.decks.add(deck);
    await db.cards.add(card);
    await db.card_state.add(state);

    await db.revlog.add({
      id: "old-review",
      card_id: card.id,
      user_id: "test-user",
      rating: 3,
      scheduled_days: 2,
      elapsed_days: 2,
      review_time_ms: 500,
      reviewed_at: "2026-07-25T10:00:00.000Z",
      review_type: "scheduled",
      pending_sync: 1,
    });

    await db.session_log.add({
      id: "old-session",
      deck_id: deck.id,
      user_id: "test-user",
      started_at: "2026-07-25T10:00:00.000Z",
      ended_at: "2026-07-25T10:05:00.000Z",
      cards_reviewed: 1,
      time_elapsed_ms: 300_000,
      pending_sync: 1,
    });

    await db.sync_meta.put({
      user_id: "test-user",
      last_synced_at: "2026-07-25T10:30:00.000Z",
      initial_pull_done: true,
      stats_reset_at: null,
      data_reset_at: null,
    });

    mocks.tables.set("profiles", [{ stats_reset_at: resetAt }]);
    mocks.tables.set("card_state", [
      {
        ...state,
        state: 0,
        reps: 0,
        updated_at: resetAt,
      },
    ]);

    expect(await syncAll("test-user")).toBe(true);

    expect(await db.revlog.count()).toBe(0);
    expect(await db.session_log.count()).toBe(0);

    expect(await db.card_state.get(state.id)).toMatchObject({
      state: 0,
      reps: 0,
      pending_sync: 0,
    });

    expect(await db.sync_meta.get("test-user")).toMatchObject({
      stats_reset_at: resetAt,
    });

    expect(
      mocks.upsertCalls.some(
        (call) => call.table === "revlog" || call.table === "session_log",
      ),
    ).toBe(false);
  });

  it("propagates a remote full-data reset before stale pending rows can be pushed", async () => {
    const resetAt = "2026-07-25T11:45:00.000Z";
    const deck = makeDeck({
      id: "stale-deck",
      user_id: "test-user",
      pending_sync: 1,
    });
    const card = makeCard({
      id: "stale-card",
      deck_id: deck.id,
      pending_sync: 1,
    });
    const state = makeCardState(card.id, { pending_sync: 1 });

    await db.decks.add(deck);
    await db.cards.add(card);
    await db.card_state.add(state);

    await db.sync_meta.put({
      user_id: "test-user",
      last_synced_at: "2026-07-25T10:30:00.000Z",
      initial_pull_done: true,
      stats_reset_at: null,
      data_reset_at: null,
    });

    mocks.tables.set("profiles", [
      {
        stats_reset_at: resetAt,
        data_reset_at: resetAt,
      },
    ]);

    expect(await syncAll("test-user")).toBe(true);

    expect(await db.decks.count()).toBe(0);
    expect(await db.cards.count()).toBe(0);
    expect(await db.card_state.count()).toBe(0);

    expect(await db.sync_meta.get("test-user")).toMatchObject({
      stats_reset_at: resetAt,
      data_reset_at: resetAt,
    });

    expect(mocks.upsertCalls).toHaveLength(0);
  });

  it("stores the server watermark captured before pull work completes", async () => {
    mocks.rpc.mockResolvedValueOnce({
      data: "2026-07-25T12:00:00.000Z",
      error: null,
    });

    mocks.tables.set("decks", [
      {
        ...makeDeck({
          id: "changed-during-sync",
          updated_at: "2026-07-25T12:00:01.000Z",
        }),
      },
    ]);

    expect(await syncAll("test-user")).toBe(true);

    expect(await db.sync_meta.get("test-user")).toMatchObject({
      last_synced_at: "2026-07-25T12:00:00.000Z",
    });
  });
});
