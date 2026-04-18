import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { computeStreaks } from "@/utils/streak";

const FIXED_DATE = new Date("2026-01-10T12:00:00Z");
const today = "2026-01-10";
const yesterday = "2026-01-09";
const twoDaysAgo = "2026-01-08";

beforeAll(() => {
  vi.useFakeTimers();
  vi.setSystemTime(FIXED_DATE);
});

afterAll(() => {
  vi.useRealTimers();
});

describe("computeStreaks", () => {
  it("returns zeros for empty input", () => {
    expect(computeStreaks([])).toEqual({ streak: 0, maxStreak: 0 });
  });

  it("counts today as a streak of 1", () => {
    expect(computeStreaks([today])).toEqual({ streak: 1, maxStreak: 1 });
  });

  it("counts yesterday as an active streak", () => {
    expect(computeStreaks([yesterday])).toEqual({ streak: 1, maxStreak: 1 });
  });

  it("returns streak 0 for a date older than yesterday", () => {
    expect(computeStreaks([twoDaysAgo])).toEqual({ streak: 0, maxStreak: 1 });
  });

  it("counts consecutive days correctly", () => {
    expect(computeStreaks([today, yesterday, twoDaysAgo])).toEqual({
      streak: 3,
      maxStreak: 3,
    });
  });

  it("stops the streak at a gap", () => {
    expect(computeStreaks([today, twoDaysAgo])).toEqual({
      streak: 1,
      maxStreak: 1,
    });
  });

  it("tracks maxStreak independently from the current streak", () => {
    const oldRun = [
      "2026-01-04",
      "2026-01-03",
      "2026-01-02",
      "2026-01-01",
      "2025-12-31",
    ];
    
    expect(computeStreaks([today, ...oldRun])).toEqual({
      streak: 1,
      maxStreak: 5,
    });
  });

  it("deduplicates same-day entries", () => {
    expect(computeStreaks([today, today, today])).toEqual({
      streak: 1,
      maxStreak: 1,
    });
  });

  it("deduplicates entries with different timestamps on the same day", () => {
    expect(computeStreaks([`${today}T08:00:00`, `${today}T20:00:00`])).toEqual({
      streak: 1,
      maxStreak: 1,
    });
  });
});
