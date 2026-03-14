import { useCallback, useEffect } from "react";
import i18next from "i18next";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useSyncStore, useAuthStore } from "@/store";
import { syncAll } from "@/lib/sync";

const { setInitialSyncDone } = useSyncStore.getState();

const SYNC_INTERVAL_MS = 60_000;
const DEBOUNCE_MS = 2_000;
let syncScheduled = false;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

async function runSyncInternal(
  userId: string,
  qc: ReturnType<typeof useQueryClient>,
  showToast: boolean,
): Promise<void> {
  try {
    const synced = await syncAll(userId);

    if (synced) {
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      if (showToast) {
        toast.success(i18next.t("syncSuccess"), { duration: 2000 });
      }
    }
  } catch (err) {
    console.error("[sync] failed:", err);
    if (showToast) {
      toast.error(i18next.t("syncError"), { duration: 4000 });
    }
  }
}

export function requestSync(): void {
  if (debounceTimer) clearTimeout(debounceTimer);

  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;

    syncAll(userId).catch((err) => {
      console.error("[sync] background push failed:", err);
    });
  }, DEBOUNCE_MS);
}

export function useSync() {
  const isSyncing = useSyncStore((s) => s.isSyncing);
  const qc = useQueryClient();

  const runSync = useCallback(
    (userId: string, showToast = true) =>
      runSyncInternal(userId, qc, showToast),
    [qc],
  );

  const triggerSync = useCallback(() => {
    const userId = useAuthStore.getState().user?.id;
    if (userId) runSync(userId);
  }, [runSync]);

  useEffect(() => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;

    if (!syncScheduled) {
      syncScheduled = true;

      runSync(userId, false).finally(() => {
        syncScheduled = false;
        setInitialSyncDone();
      });
    }

    const handleOnline = () => {
      const uid = useAuthStore.getState().user?.id;
      if (uid) runSync(uid);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        const uid = useAuthStore.getState().user?.id;
        if (uid) runSync(uid);
      }
    };

    const interval = setInterval(() => {
      const uid = useAuthStore.getState().user?.id;
      if (uid) runSync(uid, false);
    }, SYNC_INTERVAL_MS);

    window.addEventListener("online", handleOnline);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("online", handleOnline);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(interval);
    };
  }, [runSync]);

  return { isSyncing, triggerSync };
}
