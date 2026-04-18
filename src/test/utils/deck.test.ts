import { describe, it, expect } from "vitest";
import { filterTree } from "@/utils/deck";

type Node = { name: string; children: Node[] };

const leaf = (name: string): Node => ({ name, children: [] });
const node = (name: string, ...children: Node[]): Node => ({ name, children });

describe("filterTree", () => {
  it("returns empty array for empty input", () => {
    expect(filterTree([], "x")).toEqual([]);
  });

  it("returns all nodes when query is empty", () => {
    const tree = [node("A", leaf("B"))];
    expect(filterTree(tree, "")).toEqual(tree);
  });

  it("filters roots by name (case-insensitive)", () => {
    const tree = [leaf("Alpha"), leaf("Beta")];
    expect(filterTree(tree, "alpha")).toEqual([leaf("Alpha")]);
  });

  it("keeps parent when child matches, excluding non-matching siblings", () => {
    const tree = [node("Parent", leaf("match-this"), leaf("other"))];
    const result = filterTree(tree, "match");
    
    expect(result).toHaveLength(1);
    expect(result[0].children).toHaveLength(1);
    expect(result[0].children[0].name).toBe("match-this");
  });

  it("excludes entire subtrees when nothing matches", () => {
    expect(filterTree([node("Parent", leaf("Child"))], "xyz")).toEqual([]);
  });
});
