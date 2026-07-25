import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  fetchDailyGoalDefault,
  useUpdateProfile,
  useUploadAvatar,
} from "@/hooks/useProfile";
import { db } from "@/lib/db";
import { clearDb, makeWrapper } from "@/test/helpers";

const mocks = vi.hoisted(() => ({
  compressImage: vi.fn(),
  from: vi.fn(),
  getPublicUrl: vi.fn(),
  queryResult: vi.fn(),
  single: vi.fn(),
  storageFrom: vi.fn(),
  updateInputs: new Array<Record<string, unknown>>(),
  upload: vi.fn(),
}));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: mocks.from,
    storage: { from: mocks.storageFrom },
  },
}));

vi.mock("@/store", () => {
  const state = { user: { id: "test-user" } };
  const useAuthStore = (selector: (value: typeof state) => unknown) =>
    selector(state);
  useAuthStore.getState = () => state;
  return { useAuthStore };
});

vi.mock("@/utils", () => ({ compressImage: mocks.compressImage }));

const profile = {
  id: "test-user",
  username: "Test User",
  avatar_url: null,
  daily_goal_default: 25,
};

const setOnline = (online: boolean) => {
  Object.defineProperty(navigator, "onLine", {
    configurable: true,
    value: online,
  });
};

beforeEach(async () => {
  await clearDb();
  vi.clearAllMocks();
  mocks.updateInputs.length = 0;
  mocks.queryResult.mockReturnValue({ data: null, error: null });
  mocks.single.mockResolvedValue({ data: profile, error: null });
  mocks.upload.mockResolvedValue({ error: null });
  mocks.getPublicUrl.mockReturnValue({
    data: { publicUrl: "https://cdn.example/avatar.webp" },
  });

  mocks.from.mockImplementation(() => {
    const query = {
      eq: () => query,
      select: () => query,
      single: mocks.single,
      then: (
        resolve: (value: { data: unknown; error: Error | null }) => unknown,
        reject?: (reason: unknown) => unknown,
      ) => Promise.resolve(mocks.queryResult()).then(resolve, reject),
      update: (updates: Record<string, unknown>) => {
        mocks.updateInputs.push(updates);
        return query;
      },
    };
    return query;
  });

  mocks.storageFrom.mockReturnValue({
    getPublicUrl: mocks.getPublicUrl,
    upload: mocks.upload,
  });
});

describe("profile cache", () => {
  it("fetches the online profile and caches the daily goal", async () => {
    setOnline(true);

    await expect(fetchDailyGoalDefault("test-user")).resolves.toEqual({
      data: { daily_goal_default: 25 },
    });
    expect(await db.profile_cache.get("test-user")).toEqual(profile);
  });

  it("uses the cached profile without contacting Supabase while offline", async () => {
    setOnline(false);
    await db.profile_cache.put(profile);

    await expect(fetchDailyGoalDefault("test-user")).resolves.toEqual({
      data: { daily_goal_default: 25 },
    });
    expect(mocks.from).not.toHaveBeenCalled();
  });
});

describe("profile mutations", () => {
  it("updates profile fields for the authenticated user", async () => {
    const { result } = renderHook(() => useUpdateProfile(), {
      wrapper: makeWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({
        username: "Updated User",
        daily_goal_default: 40,
      });
    });

    expect(mocks.updateInputs).toEqual([
      { username: "Updated User", daily_goal_default: 40 },
    ]);
  });

  it("uploads a compressed avatar and persists its public URL", async () => {
    const source = new File(["avatar"], "avatar.png", { type: "image/png" });
    const compressed = new File(["compressed"], "avatar.webp", {
      type: "image/webp",
    });
    mocks.compressImage.mockResolvedValue(compressed);
    const { result } = renderHook(() => useUploadAvatar(), {
      wrapper: makeWrapper(),
    });

    let avatarUrl = "";
    await act(async () => {
      avatarUrl = await result.current.mutateAsync(source);
    });

    expect(mocks.storageFrom).toHaveBeenCalledWith("avatars");
    expect(mocks.upload).toHaveBeenCalledWith(
      "test-user/avatar.webp",
      compressed,
      { upsert: true },
    );
    expect(avatarUrl).toMatch(
      /^https:\/\/cdn\.example\/avatar\.webp\?t=\d+$/,
    );
    expect(mocks.updateInputs[0].avatar_url).toBe(avatarUrl);
  });
});
