import { createEmptyCard } from "ts-fsrs";

import { clearLocalDb, db } from "@/lib/db";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import { useSyncStore } from "@/store/syncStore";
import type { ICard, ICardState, IDeck, ISyncMeta } from "@/lib/db";

const PAGE_SIZE = 500;
let operationQueue: Promise<void> = Promise.resolve();
let activeSync: Promise<boolean> | null = null;
let syncRerunRequested = false;

const getSyncMeta = async (
  userId: string,
): Promise<{
  lastSyncedAt: string | null;
  initialPullDone: boolean;
  statsResetAt: string | null;
  dataResetAt: string | null;
}> => {
  const meta = await db.sync_meta.get(userId);

  return {
    lastSyncedAt: meta?.last_synced_at ?? null,
    initialPullDone: meta?.initial_pull_done ?? false,
    statsResetAt: meta?.stats_reset_at ?? null,
    dataResetAt: meta?.data_reset_at ?? null,
  };
};

export const countPendingChanges = async (): Promise<number> => {
  const [decks, cards, cardState, revlog, sessionLog] = await Promise.all([
    db.decks.where("pending_sync").equals(1).count(),
    db.cards.where("pending_sync").equals(1).count(),
    db.card_state.where("pending_sync").equals(1).count(),
    db.revlog.where("pending_sync").equals(1).count(),
    db.session_log.where("pending_sync").equals(1).count(),
  ]);

  return decks + cards + cardState + revlog + sessionLog;
};

const enqueueOperation = <T>(operation: () => Promise<T>): Promise<T> => {
  const result = operationQueue.then(operation, operation);
  operationQueue = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
};

export const runExclusiveDataOperation = <T>(
  operation: () => Promise<T>,
): Promise<T> => enqueueOperation(operation);

const getRemoteResetState = async (): Promise<{
  statsResetAt: string | null;
  dataResetAt: string | null;
}> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("stats_reset_at, data_reset_at")
    .limit(1);

  if (error) throw error;

  const statsResetAt = data?.[0]?.stats_reset_at;
  const dataResetAt = data?.[0]?.data_reset_at;

  return {
    statsResetAt: typeof statsResetAt === "string" ? statsResetAt : null,
    dataResetAt: typeof dataResetAt === "string" ? dataResetAt : null,
  };
};

export const applyStatsResetLocally = async (
  userId: string,
  resetAt: string,
): Promise<void> => {
  const decks = await db.decks.where("user_id").equals(userId).toArray();
  const deckIds = decks.map((deck) => deck.id);

  const cards = deckIds.length
    ? await db.cards.where("deck_id").anyOf(deckIds).toArray()
    : [];

  const cardIds = cards.map((card) => card.id);

  const pendingByCardId = new Map(
    cards.map((card) => [card.id, card.pending_sync]),
  );

  const fresh = createEmptyCard(new Date(resetAt));

  await db.transaction(
    "rw",
    db.card_state,
    db.revlog,
    db.session_log,
    async () => {
      await Promise.all([
        db.revlog.where("user_id").equals(userId).delete(),
        db.session_log.where("user_id").equals(userId).delete(),
      ]);

      if (!cardIds.length) return;

      const states = await db.card_state
        .where("card_id")
        .anyOf(cardIds)
        .toArray();

      await db.card_state.bulkPut(
        states.map((state) => ({
          ...state,
          stability: fresh.stability,
          difficulty: fresh.difficulty,
          due: fresh.due.toISOString(),
          last_review: null,
          state: fresh.state,
          reps: fresh.reps,
          lapses: fresh.lapses,
          learning_steps: fresh.learning_steps,
          updated_at: resetAt,
          pending_sync: pendingByCardId.get(state.card_id) ? 1 : 0,
        })),
      );
    },
  );
};

const hasRemoteChanges = async (lastSyncedAt: string): Promise<boolean> => {
  const [decksRes, cardsRes, cardStateRes, revlogRes, sessionLogRes] =
    await Promise.all([
      supabase
        .from("decks")
        .select("id")
        .gt("updated_at", lastSyncedAt)
        .limit(1),

      supabase
        .from("cards")
        .select("id")
        .gt("updated_at", lastSyncedAt)
        .limit(1),

      supabase
        .from("card_state")
        .select("id")
        .gt("updated_at", lastSyncedAt)
        .limit(1),

      supabase
        .from("revlog")
        .select("id")
        .gt("sync_updated_at", lastSyncedAt)
        .limit(1),

      supabase
        .from("session_log")
        .select("id")
        .gt("sync_updated_at", lastSyncedAt)
        .limit(1),
    ]);

  const error = [
    decksRes,
    cardsRes,
    cardStateRes,
    revlogRes,
    sessionLogRes,
  ].find((result) => result.error)?.error;

  if (error) throw error;

  return (
    (decksRes.data?.length ?? 0) > 0 ||
    (cardsRes.data?.length ?? 0) > 0 ||
    (cardStateRes.data?.length ?? 0) > 0 ||
    (revlogRes.data?.length ?? 0) > 0 ||
    (sessionLogRes.data?.length ?? 0) > 0
  );
};

const pushTable = async <T extends Record<string, unknown>>(
  tableName: string,
  rows: T[],
  onConflict = "id",
): Promise<void> => {
  if (!rows.length) return;

  for (let i = 0; i < rows.length; i += PAGE_SIZE) {
    const batch = rows.slice(i, i + PAGE_SIZE);

    const { error } = await supabase.from(tableName).upsert(batch, {
      onConflict,
    });

    if (error) throw error;
  }
};

const markDecksSyncedIfUnchanged = async (rows: IDeck[]): Promise<void> => {
  const pendingRows = rows.filter((row) => row.pending_sync === 1);
  const currentRows = await db.decks.bulkGet(pendingRows.map((row) => row.id));

  await db.decks.bulkUpdate(
    pendingRows.flatMap((sent, index) => {
      const current = currentRows[index];
      if (
        !current ||
        current.pending_sync !== 1 ||
        current.updated_at !== sent.updated_at
      ) {
        return [];
      }

      return [{ key: sent.id, changes: { pending_sync: 0 as const } }];
    }),
  );
};

const markCardsSyncedIfUnchanged = async (rows: ICard[]): Promise<void> => {
  const pendingRows = rows.filter((row) => row.pending_sync === 1);
  const currentRows = await db.cards.bulkGet(pendingRows.map((row) => row.id));

  await db.cards.bulkUpdate(
    pendingRows.flatMap((sent, index) => {
      const current = currentRows[index];
      if (
        !current ||
        current.pending_sync !== 1 ||
        current.updated_at !== sent.updated_at
      ) {
        return [];
      }

      return [{ key: sent.id, changes: { pending_sync: 0 as const } }];
    }),
  );
};

const markCardStatesSyncedIfUnchanged = async (
  rows: ICardState[],
): Promise<void> => {
  const pendingRows = rows.filter((row) => row.pending_sync === 1);
  const currentRows = await db.card_state.bulkGet(
    pendingRows.map((row) => row.id),
  );

  await db.card_state.bulkUpdate(
    pendingRows.flatMap((sent, index) => {
      const current = currentRows[index];
      if (
        !current ||
        current.pending_sync !== 1 ||
        current.updated_at !== sent.updated_at
      ) {
        return [];
      }

      return [{ key: sent.id, changes: { pending_sync: 0 as const } }];
    }),
  );
};

const pushDecks = async (full: boolean): Promise<void> => {
  const rows = full
    ? await db.decks.toArray()
    : await db.decks.where("pending_sync").equals(1).toArray();

  if (!rows.length) return;

  await pushTable(
    "decks",
    rows.map(({ pending_sync: _, ...rest }) => rest),
  );

  await markDecksSyncedIfUnchanged(rows);
};

const pushCards = async (full: boolean): Promise<void> => {
  const rows = full
    ? await db.cards.toArray()
    : await db.cards.where("pending_sync").equals(1).toArray();

  if (!rows.length) return;

  await pushTable(
    "cards",
    rows.map(({ pending_sync: _, ...rest }) => rest),
  );

  await markCardsSyncedIfUnchanged(rows);
};

const pushCardState = async (full: boolean): Promise<void> => {
  const rows = full
    ? await db.card_state.toArray()
    : await db.card_state.where("pending_sync").equals(1).toArray();

  if (!rows.length) return;

  await pushTable(
    "card_state",
    rows.map(({ pending_sync: _, ...rest }) => rest),
    "card_id",
  );

  await markCardStatesSyncedIfUnchanged(rows);
};

const pushRevlog = async (): Promise<void> => {
  const rows = await db.revlog.where("pending_sync").equals(1).toArray();
  if (!rows.length) return;

  await pushTable(
    "revlog",
    rows.map(({ pending_sync: _, ...rest }) => rest),
  );

  await db.revlog.bulkUpdate(
    rows.map(({ id }) => ({ key: id, changes: { pending_sync: 0 } })),
  );
};

const pushSessionLog = async (): Promise<void> => {
  const rows = await db.session_log.where("pending_sync").equals(1).toArray();
  if (!rows.length) return;

  await pushTable(
    "session_log",
    rows.map(({ pending_sync: _, ...rest }) => rest),
  );

  await db.session_log.bulkUpdate(
    rows.map(({ id }) => ({ key: id, changes: { pending_sync: 0 } })),
  );
};

const push = async (full: boolean): Promise<void> => {
  await pushDecks(full);
  await Promise.all([pushCards(full), pushSessionLog()]);
  await Promise.all([pushCardState(full), pushRevlog()]);
};

const fetchAllPages = async <T>(
  table: string,
  column: string,
  since: string | null,
  orderColumn?: string,
): Promise<T[]> => {
  const all: T[] = [];
  let from = 0;

  while (true) {
    let query = supabase
      .from(table)
      .select("*")
      .order(orderColumn ?? column, { ascending: true })
      .order("id", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

    if (since !== null) {
      query = query.gt(column, since);
    }

    const { data, error } = await query;

    if (error) throw error;
    if (!data?.length) break;

    all.push(...(data as T[]));
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return all;
};

const pullDecks = async (lastSyncedAt: string | null): Promise<void> => {
  const data = await fetchAllPages<Record<string, unknown>>(
    "decks",
    "updated_at",
    lastSyncedAt,
  );

  if (!data.length) return;

  const ids = data.map((r) => r.id as string);
  const locals = await db.decks.bulkGet(ids);
  const localMap = new Map(locals.filter(Boolean).map((l) => [l!.id, l!]));

  for (const remote of data) {
    const id = remote.id as string;
    const local = localMap.get(id);

    if (!local || (remote.updated_at as string) > local.updated_at) {
      await db.decks.put({
        ...(remote as Record<string, unknown>),
        pending_sync: 0,
      } as Parameters<typeof db.decks.put>[0]);
    }
  }
};

const pullCards = async (lastSyncedAt: string | null): Promise<void> => {
  const data = await fetchAllPages<Record<string, unknown>>(
    "cards",
    "updated_at",
    lastSyncedAt,
  );

  if (!data.length) return;

  const ids = data.map((r) => r.id as string);
  const locals = await db.cards.bulkGet(ids);
  const localMap = new Map(locals.filter(Boolean).map((l) => [l!.id, l!]));

  for (const remote of data) {
    const id = remote.id as string;
    const local = localMap.get(id);

    if (!local || (remote.updated_at as string) > local.updated_at) {
      await db.cards.put({
        ...(remote as Record<string, unknown>),
        pending_sync: 0,
      } as Parameters<typeof db.cards.put>[0]);
    }
  }
};

const pullCardState = async (lastSyncedAt: string | null): Promise<void> => {
  const data = await fetchAllPages<Record<string, unknown>>(
    "card_state",
    "updated_at",
    lastSyncedAt,
  );

  if (!data.length) return;

  const ids = data.map((r) => r.id as string);
  const locals = await db.card_state.bulkGet(ids);
  const localMap = new Map(locals.filter(Boolean).map((l) => [l!.id, l!]));

  for (const remote of data) {
    const local = localMap.get(remote.id as string);

    if (!local || (remote.updated_at as string) > local.updated_at) {
      await db.card_state.put({
        ...(remote as Record<string, unknown>),
        pending_sync: 0,
      } as Parameters<typeof db.card_state.put>[0]);
    }
  }
};

const pullRevlog = async (lastSyncedAt: string | null): Promise<void> => {
  const data = await fetchAllPages<Record<string, unknown>>(
    "revlog",
    "sync_updated_at",
    lastSyncedAt,
  );

  if (!data.length) return;

  const existingIds = new Set(
    (await db.revlog.bulkGet(data.map((r) => r.id as string)))
      .filter(Boolean)
      .map((r) => r!.id),
  );

  const newEntries = data
    .filter((r) => !existingIds.has(r.id as string))
    .map(
      (r) => ({ ...r, pending_sync: 0 }) as Parameters<typeof db.revlog.add>[0],
    );

  if (newEntries.length) {
    await db.revlog.bulkAdd(newEntries);
  }
};

const pullSessionLog = async (lastSyncedAt: string | null): Promise<void> => {
  const data = await fetchAllPages<Record<string, unknown>>(
    "session_log",
    "sync_updated_at",
    lastSyncedAt,
  );

  if (!data.length) return;

  const existingIds = new Set(
    (await db.session_log.bulkGet(data.map((s) => s.id as string)))
      .filter(Boolean)
      .map((s) => s!.id),
  );

  const newEntries = data
    .filter((s) => !existingIds.has(s.id as string))
    .map(
      (s) =>
        ({ ...s, pending_sync: 0 }) as Parameters<typeof db.session_log.add>[0],
    );

  if (newEntries.length) {
    await db.session_log.bulkAdd(newEntries);
  }
};

const pull = async (lastSyncedAt: string | null): Promise<void> => {
  await Promise.all([
    pullDecks(lastSyncedAt),
    pullCards(lastSyncedAt),
    pullCardState(lastSyncedAt),
    pullRevlog(lastSyncedAt),
    pullSessionLog(lastSyncedAt),
  ]);
};

const getServerTimestamp = async (): Promise<string> => {
  const { data, error } = await supabase.rpc("get_server_time");
  if (error) throw error;
  if (typeof data !== "string") {
    throw new Error("Invalid server timestamp");
  }
  return data as string;
};

const performSync = async (userId: string): Promise<boolean> => {
  if (!navigator.onLine) return false;

  const { setIsSyncing } = useSyncStore.getState();
  setIsSyncing(true);

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) return false;

    let {
      lastSyncedAt,
      initialPullDone,
      statsResetAt,
      dataResetAt,
    } = await getSyncMeta(userId);
    const {
      statsResetAt: remoteStatsResetAt,
      dataResetAt: remoteDataResetAt,
    } = await getRemoteResetState();
    const dataResetPending =
      remoteDataResetAt !== null &&
      (dataResetAt === null || remoteDataResetAt > dataResetAt);
    const resetPending =
      remoteStatsResetAt !== null &&
      (statsResetAt === null || remoteStatsResetAt > statsResetAt);

    if (dataResetPending) {
      await clearLocalDb();
      lastSyncedAt = null;
      initialPullDone = false;
      statsResetAt = remoteStatsResetAt;
      dataResetAt = remoteDataResetAt;
    } else if (resetPending) {
      await applyStatsResetLocally(userId, remoteStatsResetAt);
    }

    const pendingCount = await countPendingChanges();
    const pullSince = initialPullDone ? lastSyncedAt : null;
    const needsPull =
      resetPending || (pullSince ? await hasRemoteChanges(pullSince) : true);

    if (!pendingCount && !needsPull) return false;

    const syncStartedAt = await getServerTimestamp();
    const full = lastSyncedAt === null;
    await push(full);
    await pull(pullSince);

    const meta: ISyncMeta = {
      user_id: userId,
      last_synced_at: syncStartedAt,
      initial_pull_done: true,
      stats_reset_at: remoteStatsResetAt ?? statsResetAt,
      data_reset_at: remoteDataResetAt ?? dataResetAt,
    };

    await db.sync_meta.put(meta);

    return true;
  } finally {
    setIsSyncing(false);
  }
};

export const syncAll = (userId: string): Promise<boolean> => {
  if (activeSync) {
    syncRerunRequested = true;
    return activeSync;
  }

  activeSync = enqueueOperation(async () => {
    let synced = false;

    do {
      syncRerunRequested = false;
      synced = (await performSync(userId)) || synced;
    } while (syncRerunRequested && navigator.onLine);

    return synced;
  }).finally(() => {
    activeSync = null;
  });

  return activeSync;
};

export const requestSync = (): Promise<boolean> => {
  const userId = useAuthStore.getState().user?.id;
  if (!userId || !navigator.onLine) return Promise.resolve(false);
  return syncAll(userId);
};

export const flushPendingChanges = async (userId: string): Promise<boolean> => {
  if (activeSync) {
    await activeSync;
  }

  if ((await countPendingChanges()) === 0) return true;
  if (!navigator.onLine) return false;

  await syncAll(userId);
  return (await countPendingChanges()) === 0;
};
