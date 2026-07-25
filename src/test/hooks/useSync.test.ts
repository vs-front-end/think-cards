import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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

  it("releases the initial gate after eight seconds when sync hangs", async () => {
    setOnline(true);
    mocks.syncAll.mockImplementation(
      () => new Promise<boolean>(() => undefined),
    );

    const { unmount } = renderHook(() => useSync(), {
      wrapper: makeWrapper(),
    });
    await flushTimers(7999);
    expect(useSyncStore.getState().initialSyncDone).toBe(false);

    await flushTimers(1);
    expect(useSyncStore.getState().initialSyncDone).toBe(true);
    unmount();
  });
});
