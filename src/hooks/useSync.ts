import { useEffect, useRef } from "react";
import i18next from "i18next";
import { toast } from "sonner";
import { useSyncStore, useAuthStore } from "@/store";
import { syncAll } from "@/lib/sync";

const MAX_CONSECUTIVE_FAILURES = 3;

export function useSync() {
  const isSyncing = useSyncStore((s) => s.isSyncing);
  const failureCount = useRef(0);

  const runSync = async (userId: string) => {
    try {
      await syncAll(userId);
      failureCount.current = 0;
    } catch (err) {
      console.error("[sync] failed:", err);
      failureCount.current += 1;

      if (failureCount.current >= MAX_CONSECUTIVE_FAILURES) {
        toast.error(i18next.t("syncError"), { duration: 5000 });

        failureCount.current = 0;
      }
    }
  };

  useEffect(() => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;

    runSync(userId);

    const handleOnline = () => {
      const uid = useAuthStore.getState().user?.id;
      if (uid) runSync(uid);
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, []);

  return { isSyncing };
}
