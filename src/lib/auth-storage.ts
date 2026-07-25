import type { User } from "@supabase/supabase-js";

export type AuthUser = {
  id: string;
  email?: string;
  email_confirmed_at?: string;
  user_metadata: Record<string, unknown> & {
    full_name?: string;
  };
  identities?: Array<{
    id: string;
    provider: string;
  }>;
};

const OFFLINE_USER_STORAGE_KEY = "think-cards:offline-user";

const getSupabaseStorageKey = (): string => {
  try {
    const projectRef = new URL(import.meta.env.VITE_SUPABASE_URL).hostname.split(
      ".",
    )[0];

    return `sb-${projectRef}-auth-token`;
  } catch {
    return "think-cards:supabase-auth";
  }
};

export const SUPABASE_AUTH_STORAGE_KEY = getSupabaseStorageKey();

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isOptionalString = (value: unknown): value is string | undefined =>
  value === undefined || typeof value === "string";

const isIdentity = (
  value: unknown,
): value is { id: string; provider: string } =>
  isRecord(value) &&
  typeof value.id === "string" &&
  typeof value.provider === "string";

const isAuthUser = (value: unknown): value is AuthUser => {
  if (!isRecord(value)) return false;
  if (typeof value.id !== "string") return false;
  if (!isOptionalString(value.email)) return false;
  if (!isOptionalString(value.email_confirmed_at)) return false;
  if (!isRecord(value.user_metadata)) return false;
  if (!isOptionalString(value.user_metadata.full_name)) return false;

  return (
    value.identities === undefined ||
    (Array.isArray(value.identities) && value.identities.every(isIdentity))
  );
};

const parseStoredValue = (value: string | null): unknown => {
  if (value === null) return null;

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const readOfflineUser = (): AuthUser | null => {
  const stored = parseStoredValue(
    localStorage.getItem(OFFLINE_USER_STORAGE_KEY),
  );

  return isAuthUser(stored) ? stored : null;
};

const readSupabaseUser = (): AuthUser | null => {
  const stored = parseStoredValue(
    localStorage.getItem(SUPABASE_AUTH_STORAGE_KEY),
  );

  if (!isRecord(stored)) return null;
  return isAuthUser(stored.user) ? stored.user : null;
};

export const getStoredAuthUser = (): AuthUser | null => {
  try {
    return readOfflineUser() ?? readSupabaseUser();
  } catch {
    return null;
  }
};

export const hasStoredSupabaseSession = (): boolean => {
  try {
    const stored = parseStoredValue(
      localStorage.getItem(SUPABASE_AUTH_STORAGE_KEY),
    );

    return (
      isRecord(stored) &&
      typeof stored.access_token === "string" &&
      typeof stored.refresh_token === "string"
    );
  } catch {
    return false;
  }
};

export const normalizeAuthUser = (user: User | AuthUser): AuthUser => ({
  id: user.id,
  email: user.email,
  email_confirmed_at: user.email_confirmed_at,
  user_metadata: user.user_metadata,
  identities: user.identities?.map(({ id, provider }) => ({ id, provider })),
});

export const storeAuthUser = (user: User | AuthUser): void => {
  const offlineUser = normalizeAuthUser(user);

  try {
    localStorage.setItem(
      OFFLINE_USER_STORAGE_KEY,
      JSON.stringify(offlineUser),
    );
  } catch {
    // Storage can be unavailable in private browsing; in-memory auth still works.
  }
};

export const clearStoredAuthUser = (): void => {
  try {
    localStorage.removeItem(OFFLINE_USER_STORAGE_KEY);
  } catch {
    // Storage can be unavailable in private browsing.
  }
};
