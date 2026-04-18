import { describe, it, expect } from "vitest";
import { compressImage } from "@/utils/image";

const MAX_SIZE_BYTES = 500 * 1024;

describe("compressImage — guard conditions", () => {
  it("returns non-image files unchanged", async () => {
    const file = new File(["data"], "doc.pdf", { type: "application/pdf" });
    expect(await compressImage(file)).toBe(file);
  });

  it("returns SVG files unchanged (no rasterization)", async () => {
    const file = new File(["<svg/>"], "icon.svg", { type: "image/svg+xml" });
    expect(await compressImage(file)).toBe(file);
  });

  it("returns image files under 500KB unchanged", async () => {
    const file = new File([new Uint8Array(MAX_SIZE_BYTES)], "small.jpg", {
      type: "image/jpeg",
    });
    expect(await compressImage(file)).toBe(file);
  });
});
