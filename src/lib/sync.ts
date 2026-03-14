import { db } from "@/lib/db";
import { supabase } from "@/lib/supabase";
import { useSyncStore } from "@/store";

type SyncableTable =
  | "decks"
  | "cards"
  | "card_state"
  | "revlog"
  | "session_log";

const SYNCABLE_TABLES: SyncableTable[] = [
  "decks",
  "cards",
  "card_state",
  "revlog",
  "session_log",
];

const PAGE_SIZE = 500;

async function getLastSyncedAt(userId: string): Promise<string | null> {
  const meta = await db.sync_meta.get(userId);
  return meta?.last_synced_at ?? null;
}

async function countPending(): Promise<number> {
  const [decks, cards, cardState, revlog, sessionLog] = await Promise.all([
    db.decks.where("pending_sync").equals(1).count(),
    db.cards.where("pending_sync").equals(1).count(),
    db.card_state.where("pending_sync").equals(1).count(),
    db.revlog.where("pending_sync").equals(1).count(),
    db.session_log.where("pending_sync").equals(1).count(),
  ]);
  return decks + cards + cardState + revlog + sessionLog;
}

async function hasRemoteChanges(lastSyncedAt: string): Promise<boolean> {
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
        .gt("reviewed_at", lastSyncedAt)
        .limit(1),
      supabase
        .from("session_log")
        .select("id")
        .gt("started_at", lastSyncedAt)
        .limit(1),
    ]);

  return (
    (decksRes.data?.length ?? 0) > 0 ||
    (cardsRes.data?.length ?? 0) > 0 ||
    (cardStateRes.data?.length ?? 0) > 0 ||
    (revlogRes.data?.length ?? 0) > 0 ||
    (sessionLogRes.data?.length ?? 0) > 0
  );
}

async function pushTable<T extends Record<string, unknown>>(
  tableName: string,
  rows: T[],
): Promise<void> {
  if (!rows.length) return;

  for (let i = 0; i < rows.length; i += PAGE_SIZE) {
    const batch = rows.slice(i, i + PAGE_SIZE);
    const { error } = await supabase.from(tableName).upsert(batch, {
      onConflict: "id",
    });
    if (error) throw error;
  }
}

async function pushDecks(full: boolean): Promise<void> {
  const rows = full
    ? await db.decks.toArray()
    : await db.decks.where("pending_sync").equals(1).toArray();
  if (!rows.length) return;

  await pushTable(
    "decks",
    rows.map(({ pending_sync: _, ...rest }) => rest),
  );

  const toMark = rows.filter((d) => d.pending_sync).map(({ id }) => id);
  if (toMark.length) {
    await db.decks.bulkUpdate(
      toMark.map((id) => ({ key: id, changes: { pending_sync: false } })),
    );
  }
}

async function pushCards(full: boolean): Promise<void> {
  const rows = full
    ? await db.cards.toArray()
    : await db.cards.where("pending_sync").equals(1).toArray();
  if (!rows.length) return;

  await pushTable(
    "cards",
    rows.map(({ pending_sync: _, ...rest }) => rest),
  );

  const toMark = rows.filter((c) => c.pending_sync).map(({ id }) => id);
  if (toMark.length) {
    await db.cards.bulkUpdate(
      toMark.map((id) => ({ key: id, changes: { pending_sync: false } })),
    );
  }
}

async function pushCardState(full: boolean): Promise<void> {
  const rows = full
    ? await db.card_state.toArray()
    : await db.card_state.where("pending_sync").equals(1).toArray();
  if (!rows.length) return;

  await pushTable(
    "card_state",
    rows.map(({ pending_sync: _, ...rest }) => rest),
  );

  const toMark = rows.filter((s) => s.pending_sync).map(({ id }) => id);
  if (toMark.length) {
    await db.card_state.bulkUpdate(
      toMark.map((id) => ({ key: id, changes: { pending_sync: false } })),
    );
  }
}

async function pushRevlog(): Promise<void> {
  const rows = await db.revlog.where("pending_sync").equals(1).toArray();
  if (!rows.length) return;

  await pushTable(
    "revlog",
    rows.map(({ pending_sync: _, ...rest }) => rest),
  );

  await db.revlog.bulkUpdate(
    rows.map(({ id }) => ({ key: id, changes: { pending_sync: false } })),
  );
}

async function pushSessionLog(): Promise<void> {
  const rows = await db.session_log
    .where("pending_sync")
    .equals(1)
    .toArray();
  if (!rows.length) return;

  await pushTable(
    "session_log",
    rows.map(({ pending_sync: _, ...rest }) => rest),
  );

  await db.session_log.bulkUpdate(
    rows.map(({ id }) => ({ key: id, changes: { pending_sync: false } })),
  );
}

async function push(full: boolean): Promise<void> {
  await pushDecks(full);
  await Promise.all([pushCards(full), pushSessionLog()]);
  await Promise.all([pushCardState(full), pushRevlog()]);
}

async function fetchAllPages<T>(
  table: string,
  column: string,
  since: string,
  orderColumn?: string,
): Promise<T[]> {
  const all: T[] = [];
  let from = 0;

  while (true) {
    const query = supabase
      .from(table)
      .select("*")
      .gt(column, since)
      .order(orderColumn ?? column, { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

    const { data, error } = await query;
    if (error) throw error;
    if (!data?.length) break;

    all.push(...(data as T[]));
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return all;
}

async function pullDecks(lastSyncedAt: string): Promise<void> {
  const data = await fetchAllPages<Record<string, unknown>>(
    "decks",
    "updated_at",
    lastSyncedAt,
  );
  if (!data.length) return;

  for (const remote of data) {
    if (remote.deleted_at) {
      await db.decks.update(remote.id as string, {
        deleted_at: remote.deleted_at as string,
        updated_at: remote.updated_at as string,
        pending_sync: false,
      });
      continue;
    }

    const local = await db.decks.get(remote.id as string);
    if (!local || (remote.updated_at as string) > local.updated_at) {
      await db.decks.put({
        ...(remote as Record<string, unknown>),
        pending_sync: false,
      } as Parameters<typeof db.decks.put>[0]);
    }
  }
}

async function pullCards(lastSyncedAt: string): Promise<void> {
  const data = await fetchAllPages<Record<string, unknown>>(
    "cards",
    "updated_at",
    lastSyncedAt,
  );
  if (!data.length) return;

  for (const remote of data) {
    if (remote.deleted_at) {
      await db.cards.update(remote.id as string, {
        deleted_at: remote.deleted_at as string,
        updated_at: remote.updated_at as string,
        pending_sync: false,
      });
      continue;
    }

    const local = await db.cards.get(remote.id as string);
    if (!local || (remote.updated_at as string) > local.updated_at) {
      await db.cards.put({
        ...(remote as Record<string, unknown>),
        pending_sync: false,
      } as Parameters<typeof db.cards.put>[0]);
    }
  }
}

async function pullCardState(lastSyncedAt: string): Promise<void> {
  const data = await fetchAllPages<Record<string, unknown>>(
    "card_state",
    "updated_at",
    lastSyncedAt,
  );
  if (!data.length) return;

  for (const remote of data) {
    const local = await db.card_state.get(remote.id as string);
    if (!local || (remote.updated_at as string) > local.updated_at) {
      await db.card_state.put({
        ...(remote as Record<string, unknown>),
        pending_sync: false,
      } as Parameters<typeof db.card_state.put>[0]);
    }
  }
}

async function pullRevlog(lastSyncedAt: string): Promise<void> {
  const data = await fetchAllPages<Record<string, unknown>>(
    "revlog",
    "reviewed_at",
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
    .map((r) => ({ ...r, pending_sync: false }) as Parameters<typeof db.revlog.add>[0]);

  if (newEntries.length) {
    await db.revlog.bulkAdd(newEntries);
  }
}

async function pullSessionLog(lastSyncedAt: string): Promise<void> {
  const data = await fetchAllPages<Record<string, unknown>>(
    "session_log",
    "started_at",
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
    .map((s) => ({ ...s, pending_sync: false }) as Parameters<typeof db.session_log.add>[0]);

  if (newEntries.length) {
    await db.session_log.bulkAdd(newEntries);
  }
}

async function pull(lastSyncedAt: string): Promise<void> {
  await Promise.all([
    pullDecks(lastSyncedAt),
    pullCards(lastSyncedAt),
    pullCardState(lastSyncedAt),
    pullRevlog(lastSyncedAt),
    pullSessionLog(lastSyncedAt),
  ]);
}

async function getServerTimestamp(): Promise<string> {
  const { data, error } = await supabase.rpc("get_server_time");
  if (error || !data) return new Date().toISOString();
  return data as string;
}

export async function syncAll(userId: string): Promise<boolean> {
  if (!navigator.onLine) return false;

  const { isSyncing, setIsSyncing, setLastSyncedAt, setPendingCount } =
    useSyncStore.getState();

  if (isSyncing) return false;

  const lastSyncedAt = await getLastSyncedAt(userId);
  const pendingCount = await countPending();
  const needsPull = lastSyncedAt ? await hasRemoteChanges(lastSyncedAt) : true;

  if (!pendingCount && !needsPull) return false;

  setIsSyncing(true);

  try {
    const syncFrom = lastSyncedAt ?? new Date(0).toISOString();

    const full = lastSyncedAt === null;
    await push(full);
    await pull(syncFrom);

    const now = await getServerTimestamp();
    await db.sync_meta.put({ user_id: userId, last_synced_at: now });

    setLastSyncedAt(new Date(now));
    setPendingCount(0);

    return true;
  } finally {
    setIsSyncing(false);
  }
}

export { SYNCABLE_TABLES };
