import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  SUPABASE_AUTH_STORAGE_KEY,
  clearStoredAuthUser,
  getStoredAuthUser,
  hasStoredSupabaseSession,
  storeAuthUser,
} from "@/lib/auth-storage";

const user = {
  id: "user-id",
  email: "user@example.com",
  email_confirmed_at: "2026-01-01T00:00:00.000Z",
  user_metadata: { full_name: "Offline User" },
  identities: [{ id: "identity-id", provider: "email" }],
};

beforeEach(() => {
  localStorage.clear();
});

describe("offline auth storage", () => {
  it("stores and restores the local user snapshot", () => {
    storeAuthUser(user);

    expect(getStoredAuthUser()).toEqual(user);

    clearStoredAuthUser();
    expect(getStoredAuthUser()).toBeNull();
  });

  it("migrates the user from an existing Supabase session", () => {
    localStorage.setItem(
      SUPABASE_AUTH_STORAGE_KEY,
      JSON.stringify({
        access_token: "access-token",
        refresh_token: "refresh-token",
        expires_at: 1,
        user,
      }),
    );

    expect(getStoredAuthUser()).toEqual(user);
    expect(hasStoredSupabaseSession()).toBe(true);
  });

  it("hydrates the auth store before the first render", async () => {
    localStorage.setItem(
      SUPABASE_AUTH_STORAGE_KEY,
      JSON.stringify({
        access_token: "expired-access-token",
        refresh_token: "refresh-token",
        expires_at: 1,
        user,
      }),
    );
    vi.resetModules();

    const { useAuthStore } = await import("@/store/authStore");

    expect(useAuthStore.getState().user).toEqual(user);
    expect(useAuthStore.getState().isLoading).toBe(false);
  });

  it("ignores malformed persisted values", () => {
    localStorage.setItem(SUPABASE_AUTH_STORAGE_KEY, "{invalid");

    expect(getStoredAuthUser()).toBeNull();
    expect(hasStoredSupabaseSession()).toBe(false);
  });
});
