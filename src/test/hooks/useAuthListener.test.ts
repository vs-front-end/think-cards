import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SUPABASE_AUTH_STORAGE_KEY } from "@/lib/auth-storage";
import { useAuthListener } from "@/hooks/useAuthListener";
import { useAuthStore } from "@/store";

type AuthListener = (
  event: AuthChangeEvent,
  session: Session | null,
) => void;

const authMock = vi.hoisted(() => ({
  listener: null as AuthListener | null,
  unsubscribe: vi.fn(),
}));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      onAuthStateChange: (listener: AuthListener) => {
        authMock.listener = listener;
        return {
          data: {
            subscription: { unsubscribe: authMock.unsubscribe },
          },
        };
      },
    },
  },
}));

const user = {
  id: "user-id",
  email: "user@example.com",
  email_confirmed_at: "2026-01-01T00:00:00.000Z",
  user_metadata: { full_name: "Offline User" },
  identities: [{ id: "identity-id", provider: "email" }],
};

const session: Session = {
  access_token: "access-token",
  refresh_token: "refresh-token",
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  expires_in: 3600,
  token_type: "bearer",
  user: {
    ...user,
    app_metadata: {},
    aud: "authenticated",
    created_at: "2026-01-01T00:00:00.000Z",
    identities: [
      {
        id: "identity-id",
        identity_id: "identity-id",
        user_id: "user-id",
        provider: "email",
      },
    ],
  },
};

const emitAuthChange = (
  event: AuthChangeEvent,
  nextSession: Session | null,
) => {
  if (!authMock.listener) throw new Error("Auth listener was not registered");
  authMock.listener(event, nextSession);
};

beforeEach(() => {
  localStorage.clear();
  authMock.listener = null;
  authMock.unsubscribe.mockClear();
  useAuthStore.setState({
    user: null,
    session: null,
    isLoading: true,
  });
});

describe("useAuthListener", () => {
  it("keeps the cached user when an expired session cannot refresh offline", () => {
    localStorage.setItem(
      SUPABASE_AUTH_STORAGE_KEY,
      JSON.stringify({
        access_token: "expired-access-token",
        refresh_token: "refresh-token",
        expires_at: 1,
        user,
      }),
    );
    useAuthStore.getState().setUser(user);

    renderHook(() => useAuthListener());

    act(() => emitAuthChange("INITIAL_SESSION", null));

    expect(useAuthStore.getState().user).toEqual(user);
    expect(useAuthStore.getState().isLoading).toBe(false);
  });

  it("updates and persists a refreshed online session", () => {
    renderHook(() => useAuthListener());

    act(() => emitAuthChange("TOKEN_REFRESHED", session));

    expect(useAuthStore.getState().session).toEqual(session);
    expect(useAuthStore.getState().user).toEqual(user);
    expect(useAuthStore.getState().isLoading).toBe(false);
  });

  it("clears a stale cached user when no Supabase session remains", () => {
    useAuthStore.getState().setUser(user);
    renderHook(() => useAuthListener());

    act(() => emitAuthChange("INITIAL_SESSION", null));

    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().isLoading).toBe(false);
  });

  it("clears cached authentication after a confirmed sign out", () => {
    useAuthStore.getState().setUser(user);
    renderHook(() => useAuthListener());

    act(() => emitAuthChange("SIGNED_OUT", null));

    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().session).toBeNull();
    expect(useAuthStore.getState().isLoading).toBe(false);
  });
});
