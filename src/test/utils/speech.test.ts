import { describe, expect, it } from "vitest";

import { htmlToSpeechText } from "@/utils/speech";

describe("htmlToSpeechText", () => {
  it("strips html tags", () => {
    expect(htmlToSpeechText("<p>Hello <strong>world</strong></p>")).toBe(
      "Hello world",
    );
  });
});
