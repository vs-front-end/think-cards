import { describe, it, expect } from "vitest";

import {
  formatTime,
  formatStudyTime,
  formatTimePerCard,
  truncate,
} from "@/utils/format";

describe("formatTimePerCard", () => {
  it("returns seconds for values under 60", () => {
    expect(formatTimePerCard(45)).toEqual({ value: 45, unit: "s" });
  });

  it("returns rounded minutes for 60–3599 seconds", () => {
    expect(formatTimePerCard(90)).toEqual({ value: 2, unit: "m" });
  });

  it("returns hours for 3600+ seconds", () => {
    expect(formatTimePerCard(7200)).toEqual({ value: 2, unit: "h" });
  });
});

describe("formatTime", () => {
  it("formats zero as 00:00", () => {
    expect(formatTime(0)).toBe("00:00");
  });

  it("pads minutes and seconds with leading zeros", () => {
    expect(formatTime(61_000)).toBe("01:01");
  });

  it("overflows minutes past 59 without an hours column", () => {
    expect(formatTime(3_661_000)).toBe("61:01");
  });
});

describe("formatStudyTime", () => {
  it("shows only minutes under 1 hour", () => {
    expect(formatStudyTime(45 * 60_000)).toBe("45m");
  });

  it("shows only hours when no leftover minutes", () => {
    expect(formatStudyTime(2 * 60 * 60_000)).toBe("2h");
  });

  it("shows hours and minutes", () => {
    expect(formatStudyTime(90 * 60_000)).toBe("1h 30m");
  });
});

describe("truncate", () => {
  it("returns strings within the limit unchanged", () => {
    expect(truncate("hello", 10)).toBe("hello");
  });

  it("truncates with ellipsis when over the limit", () => {
    expect(truncate("hello world", 5)).toBe("hello…");
  });

  it("trims surrounding whitespace before comparing", () => {
    expect(truncate("  hi  ", 10)).toBe("hi");
  });
});
