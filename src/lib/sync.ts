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

async function getLastSyncedAt(userId: string): Promise<string | null> {
  const meta = await db.sync_meta.get(userId);
  return meta?.last_synced_at ?? null;
}

async function countPending(): Promise<number> {
  const [decks, cards, cardState, revlog, sessionLog] = await Promise.all([
    db.decks.where("pending_sync").equals(1).count(),
    db.cards.where("pending_sync").equals(1).count(),
    db.card_state.where("pending_sync").equals(1).count(),
    db.revlog.count(),
    db.session_log.count(),
  ]);
  return decks + cards + cardState + revlog + sessionLog;
}

async function hasRemoteChanges(lastSyncedAt: string): Promise<boolean> {
  const [decksRes, cardsRes, cardStateRes] = await Promise.all([
    supabase.from("decks").select("id").gt("updated_at", lastSyncedAt).limit(1),
    supabase.from("cards").select("id").gt("updated_at", lastSyncedAt).limit(1),
    supabase.from("card_state").select("id").gt("updated_at", lastSyncedAt).limit(1),
  ]);

  return (
    (decksRes.data?.length ?? 0) > 0 ||
    (cardsRes.data?.length ?? 0) > 0 ||
    (cardStateRes.data?.length ?? 0) > 0
  );
}

async function pushDecks(): Promise<void> {
  const pending = await db.decks.where("pending_sync").equals(1).toArray();
  if (!pending.length) return;

  const { error } = await supabase.from("decks").upsert(
    pending.map(({ pending_sync: _, ...rest }) => rest),
    { onConflict: "id" },
  );

  if (error) throw error;

  await db.decks.bulkUpdate(
    pending.map(({ id }) => ({ key: id, changes: { pending_sync: false } })),
  );
}

async function pushCards(): Promise<void> {
  const pending = await db.cards.where("pending_sync").equals(1).toArray();
  if (!pending.length) return;

  const { error } = await supabase.from("cards").upsert(
    pending.map(({ pending_sync: _, ...rest }) => rest),
    { onConflict: "id" },
  );

  if (error) throw error;

  await db.cards.bulkUpdate(
    pending.map(({ id }) => ({ key: id, changes: { pending_sync: false } })),
  );
}

async function pushCardState(): Promise<void> {
  const pending = await db.card_state.where("pending_sync").equals(1).toArray();
  if (!pending.length) return;

  const { error } = await supabase.from("card_state").upsert(
    pending.map(({ pending_sync: _, ...rest }) => rest),
    { onConflict: "id" },
  );

  if (error) throw error;

  await db.card_state.bulkUpdate(
    pending.map(({ id }) => ({ key: id, changes: { pending_sync: false } })),
  );
}

async function pushRevlog(): Promise<void> {
  const all = (await db.revlog.toArray()).filter((r) => r.user_id);
  if (!all.length) return;

  const { error } = await supabase.from("revlog").upsert(all, {
    onConflict: "id",
    ignoreDuplicates: true,
  });

  if (error) throw error;
}

async function pushSessionLog(): Promise<void> {
  const all = (await db.session_log.toArray()).filter((s) => s.user_id);
  if (!all.length) return;

  const { error } = await supabase.from("session_log").upsert(all, {
    onConflict: "id",
    ignoreDuplicates: true,
  });

  if (error) throw error;
}

async function push(): Promise<void> {
  await pushDecks();
  await Promise.all([pushCards(), pushSessionLog()]);
  await Promise.all([pushCardState(), pushRevlog()]);
}

async function pullDecks(lastSyncedAt: string): Promise<void> {
  const { data, error } = await supabase
    .from("decks")
    .select("*")
    .gt("updated_at", lastSyncedAt);

  if (error) throw error;
  if (!data?.length) return;

  for (const remote of data) {
    if (remote.deleted_at) {
      await db.decks.update(remote.id, { deleted_at: remote.deleted_at });
      continue;
    }

    const local = await db.decks.get(remote.id);
    if (!local || remote.updated_at > local.updated_at) {
      await db.decks.put({ ...remote, pending_sync: false });
    }
  }
}

async function pullCards(lastSyncedAt: string): Promise<void> {
  const { data, error } = await supabase
    .from("cards")
    .select("*")
    .gt("updated_at", lastSyncedAt);

  if (error) throw error;
  if (!data?.length) return;

  for (const remote of data) {
    if (remote.deleted_at) {
      await db.cards.update(remote.id, { deleted_at: remote.deleted_at });
      continue;
    }

    const local = await db.cards.get(remote.id);
    if (!local || remote.updated_at > local.updated_at) {
      await db.cards.put({ ...remote, pending_sync: false });
    }
  }
}

async function pullCardState(lastSyncedAt: string): Promise<void> {
  const { data, error } = await supabase
    .from("card_state")
    .select("*")
    .gt("updated_at", lastSyncedAt);

  if (error) throw error;
  if (!data?.length) return;

  for (const remote of data) {
    const local = await db.card_state.get(remote.id);
    if (!local || remote.updated_at > local.updated_at) {
      await db.card_state.put({ ...remote, pending_sync: false });
    }
  }
}

async function pullRevlog(lastSyncedAt: string): Promise<void> {
  const { data, error } = await supabase
    .from("revlog")
    .select("*")
    .gt("reviewed_at", lastSyncedAt);

  if (error) throw error;
  if (!data?.length) return;

  const existingIds = new Set(
    (await db.revlog.bulkGet(data.map((r) => r.id)))
      .filter(Boolean)
      .map((r) => r!.id),
  );

  const newEntries = data.filter((r) => !existingIds.has(r.id));
  if (newEntries.length) {
    await db.revlog.bulkAdd(newEntries);
  }
}

async function pullSessionLog(lastSyncedAt: string): Promise<void> {
  const { data, error } = await supabase
    .from("session_log")
    .select("*")
    .gt("started_at", lastSyncedAt);

  if (error) throw error;
  if (!data?.length) return;

  const existingIds = new Set(
    (await db.session_log.bulkGet(data.map((s) => s.id)))
      .filter(Boolean)
      .map((s) => s!.id),
  );

  const newEntries = data.filter((s) => !existingIds.has(s.id));
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

    await Promise.all([push(), pull(syncFrom)]);

    const now = new Date().toISOString();
    await db.sync_meta.put({ user_id: userId, last_synced_at: now });

    setLastSyncedAt(new Date(now));
    setPendingCount(0);

    return true;
  } finally {
    setIsSyncing(false);
  }
}

export { SYNCABLE_TABLES };
