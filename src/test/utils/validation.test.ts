import { describe, it, expect } from "vitest";
import { isValidEmail, isNotEmpty, hasMinLength } from "@/utils/validation";

describe("isValidEmail", () => {
  it("accepts standard valid emails", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
    expect(isValidEmail("a+tag@sub.domain.org")).toBe(true);
  });

  it("trims whitespace before validating", () => {
    expect(isValidEmail("  user@example.com  ")).toBe(true);
  });

  it("rejects emails without an @ symbol", () => {
    expect(isValidEmail("notanemail")).toBe(false);
  });

  it("rejects emails without a TLD", () => {
    expect(isValidEmail("user@domain")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isValidEmail("")).toBe(false);
  });
});

describe("isNotEmpty", () => {
  it("returns true for strings with content", () => {
    expect(isNotEmpty("hello")).toBe(true);
  });

  it("returns false for empty string", () => {
    expect(isNotEmpty("")).toBe(false);
  });

  it("returns false for whitespace-only string", () => {
    expect(isNotEmpty("   ")).toBe(false);
  });
});

describe("hasMinLength", () => {
  it("returns true when length meets the minimum exactly", () => {
    expect(hasMinLength("hello", 5)).toBe(true);
  });

  it("returns true when length exceeds the minimum", () => {
    expect(hasMinLength("hello world", 5)).toBe(true);
  });

  it("returns false when length is below the minimum", () => {
    expect(hasMinLength("hi", 5)).toBe(false);
  });
});
