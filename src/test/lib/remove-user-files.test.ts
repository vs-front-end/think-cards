import { describe, expect, it, vi } from "vitest";
import {
  removeUserFiles,
  type StorageClient,
} from "../../../supabase/functions/delete-account/remove-user-files";

const userId = "user-id";

describe("removeUserFiles", () => {
  it("lists and removes every exact file path in repeated batches", async () => {
    const files = [
      { id: "1", name: "avatar.webp" },
      { id: "2", name: "front.webp" },
      { id: "3", name: "answer.mp3" },
    ];
    const removedPaths: string[][] = [];

    const storage: StorageClient = {
      from: vi.fn(() => ({
        list: vi.fn(async () => ({
          data: files.slice(0, 2),
          error: null,
        })),
        remove: vi.fn(async (paths: string[]) => {
          removedPaths.push(paths);
          files.splice(0, paths.length);
          return { data: [], error: null };
        }),
      })),
    };

    await removeUserFiles(storage, "card-images", userId);

    expect(removedPaths).toEqual([
      ["user-id/avatar.webp", "user-id/front.webp"],
      ["user-id/answer.mp3"],
    ]);
  });

  it("stops account deletion when listing fails", async () => {
    const storage: StorageClient = {
      from: vi.fn(() => ({
        list: vi.fn(async () => ({
          data: null,
          error: { message: "storage unavailable" },
        })),
        remove: vi.fn(),
      })),
    };

    await expect(
      removeUserFiles(storage, "card-audio", userId),
    ).rejects.toThrow("Could not list card-audio: storage unavailable");
  });

  it("stops account deletion when an exact removal fails", async () => {
    const storage: StorageClient = {
      from: vi.fn(() => ({
        list: vi.fn(async () => ({
          data: [{ id: "1", name: "answer.mp3" }],
          error: null,
        })),
        remove: vi.fn(async () => ({
          data: null,
          error: { message: "permission denied" },
        })),
      })),
    };

    await expect(
      removeUserFiles(storage, "card-audio", userId),
    ).rejects.toThrow("Could not clear card-audio: permission denied");
  });
});
