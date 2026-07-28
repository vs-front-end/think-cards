import type { Provider } from "@supabase/supabase-js";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  useChangePassword,
  useOAuthSignIn,
  useSetPassword,
  useSignIn,
  useSignOut,
  useSignUp,
} from "@/hooks/useAuth";
import { makeWrapper } from "@/test/helpers";

const mocks = vi.hoisted(() => ({
  clearLocalDb: vi.fn(),
  flushPendingChanges: vi.fn(),
  logout: vi.fn(),
  resetSyncState: vi.fn(),
  runExclusiveDataOperation: vi.fn(),
  signInWithOAuth: vi.fn(),
  signInWithPassword: vi.fn(),
  signOut: vi.fn(),
  signUp: vi.fn(),
  updateUser: vi.fn(),
}));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      signInWithOAuth: mocks.signInWithOAuth,
      signInWithPassword: mocks.signInWithPassword,
      signOut: mocks.signOut,
      signUp: mocks.signUp,
      updateUser: mocks.updateUser,
    },
  },
}));

vi.mock("@/lib/db", () => ({ clearLocalDb: mocks.clearLocalDb }));

vi.mock("@/lib/sync", () => ({
  flushPendingChanges: mocks.flushPendingChanges,
  runExclusiveDataOperation: mocks.runExclusiveDataOperation,
}));

vi.mock("@/hooks/useSync", () => ({
  resetSyncState: mocks.resetSyncState,
}));

vi.mock("@/store", () => {
  const state = { logout: mocks.logout, user: { id: "user-id" } };
  const useAuthStore = (selector: (value: typeof state) => unknown): unknown =>
    selector(state);
  useAuthStore.getState = () => state;
  return { useAuthStore };
});

beforeEach(() => {
  vi.clearAllMocks();

  mocks.flushPendingChanges.mockResolvedValue(true);
  mocks.runExclusiveDataOperation.mockImplementation(
    async (operation: () => Promise<unknown>) => operation(),
  );

  mocks.signInWithOAuth.mockResolvedValue({ error: null });
  mocks.signInWithPassword.mockResolvedValue({
    data: { user: { id: "user-id" } },
    error: null,
  });

  mocks.signOut.mockResolvedValue({ error: null });
  mocks.signUp.mockResolvedValue({
    data: { user: { id: "user-id" } },
    error: null,
  });

  mocks.updateUser.mockResolvedValue({ error: null });
});

describe("email authentication", () => {
  it("signs in with the supplied credentials", async () => {
    const { result } = renderHook(() => useSignIn(), {
      wrapper: makeWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({
        email: "user@example.com",
        password: "secret123",
      });
    });

    expect(mocks.signInWithPassword).toHaveBeenCalledWith({
      email: "user@example.com",
      password: "secret123",
    });
  });

  it("propagates a rejected sign in", async () => {
    const authError = new Error("Invalid login credentials");
    mocks.signInWithPassword.mockResolvedValue({
      data: { user: null },
      error: authError,
    });
    const { result } = renderHook(() => useSignIn(), {
      wrapper: makeWrapper(),
    });

    await expect(
      result.current.mutateAsync({
        email: "user@example.com",
        password: "wrong",
      }),
    ).rejects.toBe(authError);
  });

  it("signs up with email and password", async () => {
    const { result } = renderHook(() => useSignUp(), {
      wrapper: makeWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({
        email: "new@example.com",
        password: "secret123",
      });
    });

    expect(mocks.signUp).toHaveBeenCalledWith({
      email: "new@example.com",
      password: "secret123",
    });
  });
});

describe("password management", () => {
  it("verifies the current password before changing it", async () => {
    const { result } = renderHook(() => useChangePassword(), {
      wrapper: makeWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({
        currentPassword: "old-secret",
        newPassword: "new-secret",
        email: "user@example.com",
      });
    });

    expect(mocks.signInWithPassword).toHaveBeenCalledWith({
      email: "user@example.com",
      password: "old-secret",
    });
    expect(mocks.updateUser).toHaveBeenCalledWith({
      password: "new-secret",
    });
  });

  it("does not change the password when verification fails", async () => {
    mocks.signInWithPassword.mockResolvedValue({
      data: { user: null },
      error: new Error("invalid password"),
    });
    const { result } = renderHook(() => useChangePassword(), {
      wrapper: makeWrapper(),
    });

    await expect(
      result.current.mutateAsync({
        currentPassword: "wrong",
        newPassword: "new-secret",
        email: "user@example.com",
      }),
    ).rejects.toThrow("wrongCurrentPassword");
    expect(mocks.updateUser).not.toHaveBeenCalled();
  });

  it("sets a password for an OAuth account", async () => {
    const { result } = renderHook(() => useSetPassword(), {
      wrapper: makeWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({ newPassword: "new-secret" });
    });

    expect(mocks.updateUser).toHaveBeenCalledWith({
      password: "new-secret",
    });
  });
});

describe("OAuth and logout", () => {
  const providers: Provider[] = ["google", "github", "x"];

  it.each(providers)(
    "starts %s OAuth with the callback URL",
    async (provider) => {
      const { result } = renderHook(() => useOAuthSignIn());

      await act(async () => {
        await result.current(provider);
      });

      expect(mocks.signInWithOAuth).toHaveBeenCalledWith({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
    },
  );

  it("clears sync state, local data and auth state on logout", async () => {
    const { result } = renderHook(() => useSignOut());

    await act(async () => {
      await result.current();
    });

    expect(mocks.resetSyncState).toHaveBeenCalledOnce();
    expect(mocks.signOut).toHaveBeenCalledWith({ scope: "global" });
    expect(mocks.clearLocalDb).toHaveBeenCalledOnce();
    expect(mocks.logout).toHaveBeenCalledOnce();
    expect(mocks.flushPendingChanges).toHaveBeenCalledWith("user-id");
    expect(mocks.flushPendingChanges).toHaveBeenCalledBefore(mocks.signOut);
  });

  it("keeps the session and local database when pending changes cannot be flushed", async () => {
    mocks.flushPendingChanges.mockResolvedValue(false);
    const { result } = renderHook(() => useSignOut());

    await expect(result.current()).rejects.toThrow(
      "Pending changes could not be synchronized",
    );

    expect(mocks.signOut).not.toHaveBeenCalled();
    expect(mocks.clearLocalDb).not.toHaveBeenCalled();
    expect(mocks.logout).not.toHaveBeenCalled();
  });
});
