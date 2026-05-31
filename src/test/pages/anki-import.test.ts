import { describe, it, expect } from "vitest";

import { mapNotes, parseModels } from "@/pages/generate-cards/anki-import";

const SEP = "\u001f";

const models = parseModels(
  JSON.stringify({
    "1": { type: 0, flds: [{ name: "Front" }, { name: "Back" }] },
    "2": { type: 1, flds: [{ name: "Text" }, { name: "Extra" }] },
    "3": {
      type: 0,
      flds: Array.from({ length: 12 }, (_, i) => ({ name: `f${i}` })),
    },
  }),
);

describe("mapNotes", () => {
  it("imports a clean basic note as front/back", () => {
    const result = mapNotes(models, [
      { mid: 1, flds: `He had a good sleep${SEP}Ele dormiu bem` },
    ]);
    expect(result.basic).toBe(1);
    expect(result.cards[0]).toEqual({
      type: "basic",
      front: "He had a good sleep",
      back: "Ele dormiu bem",
    });
  });

  it("imports a cloze note from the field holding the cloze syntax", () => {
    const result = mapNotes(models, [
      { mid: 2, flds: `The capital of {{c1::France}} is Paris${SEP}hint` },
    ]);
    expect(result.cloze).toBe(1);
    expect(result.cards[0].type).toBe("cloze");
    expect(result.cards[0].front).toContain("{{c1::France}}");
    expect(result.cards[0].back).toBe("hint");
  });

  it("skips custom multi-field note types", () => {
    const flds = Array.from({ length: 12 }, (_, i) => `field${i}`).join(SEP);
    const result = mapNotes(models, [{ mid: 3, flds }]);
    expect(result.skipped).toBe(1);
    expect(result.cards).toHaveLength(0);
  });

  it("skips a basic note with empty front", () => {
    const result = mapNotes(models, [{ mid: 1, flds: `${SEP}only back` }]);
    expect(result.skipped).toBe(1);
  });

  it("skips a cloze note type without cloze syntax", () => {
    const result = mapNotes(models, [{ mid: 2, flds: `no cloze here${SEP}x` }]);
    expect(result.skipped).toBe(1);
  });

  it("strips images and sound refs from fields", () => {
    const result = mapNotes(models, [
      {
        mid: 1,
        flds: `word [sound:audio.mp3]${SEP}<img src="x.png">answer`,
      },
    ]);
    expect(result.cards[0].front).toBe("word");
    expect(result.cards[0].back).toBe("answer");
  });

  it("skips notes whose model is unknown", () => {
    const result = mapNotes(models, [{ mid: 999, flds: `a${SEP}b` }]);
    expect(result.skipped).toBe(1);
  });
});
