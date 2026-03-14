import { create } from "zustand";

type SyncStore = {
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  pendingCount: number;
  setIsSyncing: (isSyncing: boolean) => void;
  setLastSyncedAt: (lastSyncedAt: Date | null) => void;
  setPendingCount: (pendingCount: number) => void;
};

export const useSyncStore = create<SyncStore>()((set) => ({
  isSyncing: false,
  lastSyncedAt: null,
  pendingCount: 0,
  setIsSyncing: (isSyncing) => set({ isSyncing }),
  setLastSyncedAt: (lastSyncedAt) => set({ lastSyncedAt }),
  setPendingCount: (pendingCount) => set({ pendingCount }),
}));
