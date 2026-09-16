import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

// check:week-copy — a week's description says what it is ABOUT; its claim says
// what it ARGUES. A reader who meets the same sentence twice in a row on every
// week page learns that the page has nothing else to say.
//
// Similarity is measured on content words, so re-wording around the same
// skeleton does not pass. The threshold is deliberately generous: overlap is
// expected (both mention the subject), duplication is not.

interface Node {
  id: string;
  type: string;
  description?: string;
  meta?: Record<string, unknown>;
}
const api = JSON.parse(readFileSync(resolve("dist/api/index.json"), "utf8")) as { nodes: Node[] };
const weeks = api.nodes.filter((n) => n.type === "sessions");

const STOP = new Set(["the","a","an","and","or","but","of","in","on","at","to","by","is","are","it",
  "that","this","for","with","from","as","not","only","its","you","your","what","which","when","how",
  "week","weeks","event","course"]);
const bag = (s: string) =>
  new Set(
    s.toLowerCase().replace(/[^a-z\s]/g, " ").split(/\s+/).filter((w) => w.length > 3 && !STOP.has(w)),
  );

/** Jaccard overlap of content words. */
function similarity(a: string, b: string): number {
  const [x, y] = [bag(a), bag(b)];
  if (!x.size || !y.size) return 0;
  const inter = [...x].filter((w) => y.has(w)).length;
  return inter / new Set([...x, ...y]).size;
}

const LIMIT = 0.34;

describe("check:week-copy — description and claim do different work", () => {
  it("gives every week both a description and a claim", () => {
    const bad = weeks
      .filter((w) => !w.description || !w.meta?.claim)
      .map((w) => `${w.id}: missing description or claim`);
    expect(bad, bad.join("; ")).toEqual([]);
  });

  it("never lets a description paraphrase its own claim", () => {
    const bad = weeks
      .map((w) => ({ id: w.id, s: similarity(w.description ?? "", String(w.meta?.claim ?? "")) }))
      .filter((r) => r.s > LIMIT)
      .map(
        (r) =>
          `src/content/sessions/${r.id.split("/")[1]}.md: description and claim share ${(r.s * 100).toFixed(0)}% of their content words (limit ${LIMIT * 100}%) — the reader meets the same sentence twice`,
      );
    expect(bad, bad.join("; ")).toEqual([]);
  });
});
