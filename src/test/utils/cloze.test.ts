import { describe, it, expect } from "vitest";

import {
  escapeHtml,
  parseClozePreview,
  parseClozeRevealed,
  nextClozeIndex,
} from "@/utils/cloze";

describe("escapeHtml", () => {
  it("escapes all special HTML characters", () => {
    expect(escapeHtml("&<>\"'")).toBe("&amp;&lt;&gt;&quot;&#39;");
  });

  it("leaves plain strings unchanged", () => {
    expect(escapeHtml("hello world")).toBe("hello world");
  });
});

describe("parseClozePreview", () => {
  it("replaces a single cloze with placeholder", () => {
    expect(parseClozePreview("The {{c1::sky}} is blue")).toBe(
      "The […] is blue",
    );
  });

  it("replaces multiple clozes", () => {
    expect(parseClozePreview("{{c1::A}} and {{c2::B}}")).toBe("[…] and […]");
  });

  it("leaves plain text unchanged", () => {
    expect(parseClozePreview("no cloze here")).toBe("no cloze here");
  });
});

describe("parseClozeRevealed", () => {
  it("wraps content in a styled span", () => {
    const result = parseClozeRevealed("The {{c1::sky}}");
    expect(result).toContain("<span");
    expect(result).toContain("sky");
    expect(result).toContain("</span>");
  });

  it("escapes HTML inside cloze content", () => {
    const result = parseClozeRevealed("{{c1::<b>bold</b>}}");
    expect(result).not.toContain("<b>");
    expect(result).toContain("&lt;b&gt;");
  });
});

describe("nextClozeIndex", () => {
  it("returns 1 when no clozes exist", () => {
    expect(nextClozeIndex("plain text")).toBe(1);
  });

  it("returns max index + 1 for non-sequential clozes", () => {
    expect(nextClozeIndex("{{c1::a}} {{c3::b}}")).toBe(4);
  });

  it("handles a single cloze", () => {
    expect(nextClozeIndex("{{c2::x}}")).toBe(3);
  });
});
