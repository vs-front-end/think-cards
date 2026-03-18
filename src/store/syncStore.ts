import { create } from "zustand";

type SyncStore = {
  isSyncing: boolean;
  initialSyncDone: boolean;
  lastSyncedAt: Date | null;
  pendingCount: number;
  setIsSyncing: (isSyncing: boolean) => void;
  setInitialSyncDone: () => void;
  setLastSyncedAt: (lastSyncedAt: Date | null) => void;
  setPendingCount: (pendingCount: number) => void;
  reset: () => void;
};

export const useSyncStore = create<SyncStore>()((set) => ({
  isSyncing: false,
  initialSyncDone: false,
  lastSyncedAt: null,
  pendingCount: 0,
  setIsSyncing: (isSyncing) => set({ isSyncing }),
  setInitialSyncDone: () => set({ initialSyncDone: true }),
  setLastSyncedAt: (lastSyncedAt) => set({ lastSyncedAt }),
  setPendingCount: (pendingCount) => set({ pendingCount }),
  reset: () =>
    set({ isSyncing: false, initialSyncDone: false, lastSyncedAt: null, pendingCount: 0 }),
}));
