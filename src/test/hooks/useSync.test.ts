import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient } from "@tanstack/react-query";

import { resetSyncState, useSync } from "@/hooks/useSync";
import { useAuthStore, useSyncStore } from "@/store";
import { clearDb, makeWrapper } from "@/test/helpers";

const mocks = vi.hoisted(() => ({
  syncAll: vi.fn(),
}));

vi.mock("@/lib/sync", () => ({ syncAll: mocks.syncAll }));
vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

const setOnline = (online: boolean) => {
  Object.defineProperty(navigator, "onLine", {
    configurable: true,
    value: online,
  });
};

const flushTimers = async (milliseconds = 0) => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(milliseconds);
  });
};

beforeEach(async () => {
  await clearDb();
  vi.useFakeTimers();
  vi.clearAllMocks();
  resetSyncState();
  useAuthStore.setState({
    user: {
      id: "test-user",
      email: "user@example.com",
      user_metadata: {},
    },
    session: null,
    isLoading: false,
  });
  mocks.syncAll.mockResolvedValue(false);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useSync offline lifecycle", () => {
  it("releases the initial sync gate immediately when offline", async () => {
    setOnline(false);
    const { unmount } = renderHook(() => useSync(), {
      wrapper: makeWrapper(),
    });

    await flushTimers();

    expect(useSyncStore.getState().initialSyncDone).toBe(true);
    unmount();
  });

  it("schedules synchronization when the browser reconnects", async () => {
    setOnline(false);
    const { unmount } = renderHook(() => useSync(), {
      wrapper: makeWrapper(),
    });
    await flushTimers();
    mocks.syncAll.mockClear();

    setOnline(true);
    act(() => window.dispatchEvent(new Event("online")));
    await flushTimers(1499);
    expect(mocks.syncAll).not.toHaveBeenCalled();

    await flushTimers(1);
    expect(mocks.syncAll).toHaveBeenCalledWith("test-user");
    unmount();
  });

  it("retries one transient online failure", async () => {
    setOnline(true);
    mocks.syncAll
      .mockRejectedValueOnce(new Error("temporary failure"))
      .mockResolvedValueOnce(true);

    const { unmount } = renderHook(() => useSync(), {
      wrapper: makeWrapper(),
    });
    await flushTimers();

    expect(mocks.syncAll).toHaveBeenCalledTimes(1);
    await flushTimers(1999);
    expect(mocks.syncAll).toHaveBeenCalledTimes(1);

    await flushTimers(1);
    expect(mocks.syncAll).toHaveBeenCalledTimes(2);
    unmount();
  });

  it("keeps the initial gate closed while an online sync is pending", async () => {
    setOnline(true);
    mocks.syncAll.mockImplementation(
      () => new Promise<boolean>(() => undefined),
    );

    const { unmount } = renderHook(() => useSync(), {
      wrapper: makeWrapper(),
    });
    await flushTimers(60_000);
    expect(useSyncStore.getState().initialSyncDone).toBe(false);
    unmount();
  });

  it("releases the initial gate when an online sync finishes", async () => {
    setOnline(true);
    let finishSync: ((synced: boolean) => void) | undefined;
    mocks.syncAll.mockImplementation(
      () =>
        new Promise<boolean>((resolve) => {
          finishSync = resolve;
        }),
    );

    const { unmount } = renderHook(() => useSync(), {
      wrapper: makeWrapper(),
    });
    await flushTimers();
    expect(useSyncStore.getState().initialSyncDone).toBe(false);

    await act(async () => finishSync?.(false));
    expect(useSyncStore.getState().initialSyncDone).toBe(true);
    unmount();
  });

  it("refreshes dashboard and statistics after synchronized changes", async () => {
    setOnline(true);
    mocks.syncAll.mockResolvedValue(true);

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");

    const { unmount } = renderHook(() => useSync(), {
      wrapper: makeWrapper(queryClient),
    });
    await flushTimers();

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["dashboard"],
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["statistics"],
    });
    unmount();
  });
});
