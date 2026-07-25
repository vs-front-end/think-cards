import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useDeleteAccount } from "@/hooks/useAccount";
import { makeWrapper } from "@/test/helpers";

const mocks = vi.hoisted(() => ({
  clearLocalDb: vi.fn(),
  invoke: vi.fn(),
  logout: vi.fn(),
  resetSyncState: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: { signOut: mocks.signOut },
    functions: { invoke: mocks.invoke },
  },
}));

vi.mock("@/lib/db", () => ({ clearLocalDb: mocks.clearLocalDb }));
vi.mock("@/hooks/useSync", () => ({
  resetSyncState: mocks.resetSyncState,
}));
vi.mock("@/store", () => ({
  useAuthStore: {
    getState: () => ({ logout: mocks.logout }),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.invoke.mockResolvedValue({ data: { success: true }, error: null });
  mocks.signOut.mockResolvedValue({ error: null });
});

describe("useDeleteAccount", () => {
  it("clears local state only after the server deletes the account", async () => {
    const { result } = renderHook(() => useDeleteAccount(), {
      wrapper: makeWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync();
    });

    expect(mocks.invoke).toHaveBeenCalledWith("delete-account");
    expect(mocks.clearLocalDb).toHaveBeenCalledOnce();
    expect(mocks.resetSyncState).toHaveBeenCalledOnce();
    expect(mocks.signOut).toHaveBeenCalledOnce();
    expect(mocks.logout).toHaveBeenCalledOnce();
  });

  it("preserves local state when server deletion fails", async () => {
    const serverError = new Error("deletion failed");
    mocks.invoke.mockResolvedValue({ data: null, error: serverError });
    const { result } = renderHook(() => useDeleteAccount(), {
      wrapper: makeWrapper(),
    });

    await expect(result.current.mutateAsync()).rejects.toBe(serverError);

    expect(mocks.clearLocalDb).not.toHaveBeenCalled();
    expect(mocks.signOut).not.toHaveBeenCalled();
    expect(mocks.logout).not.toHaveBeenCalled();
  });
});
