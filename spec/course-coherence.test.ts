import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { COURSE_PROPERTIES } from "../src/lib/course-properties.ts";

// The course-specific checks: the record of what had to stay true about
// SLOP6246, rather than what would be true of any Astro site.
//
// These read the built API and the built HTML, because that is what a reader
// receives. Structural checks live in course-contract.test.ts; provenance and
// recompute live in figures.test.ts.

interface Node {
  id: string;
  type: string;
  title: string;
  meta?: Record<string, unknown>;
}
const api = JSON.parse(readFileSync(resolve("dist/api/index.json"), "utf8")) as {
  nodes: Node[];
};
const weeks = api.nodes
  .filter((n) => n.type === "sessions")
  .sort((a, b) => Number(a.meta?.week) - Number(b.meta?.week));
const assessments = api.nodes
  .filter((n) => n.type === "assessments")
  .sort((a, b) => Number(a.meta?.stage) - Number(b.meta?.stage));

const DIST = resolve("dist");
function builtPages(): [string, string][] {
  return readdirSync(DIST, { recursive: true, encoding: "utf8" })
    .filter((e) => e.endsWith(".html"))
    .map((e) => [
      `/${e.replace(/index\.html$/, "").replace(/\.html$/, "")}`,
      readFileSync(join(DIST, e), "utf8"),
    ]);
}
const textOf = (html: string) =>
  html
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ");

describe("check:no-survey — one property per week, none shared, none spare", () => {
  it("draws every week's property from the locked vocabulary", () => {
    const bad = weeks
      .filter((w) => !COURSE_PROPERTIES.includes(w.meta?.property as never))
      .map((w) => `${w.id}: property "${String(w.meta?.property)}" is not in the locked vocabulary`);
    expect(bad, bad.join("; ")).toEqual([]);
  });

  it("gives no two weeks the same property", () => {
    const seen = new Map<string, string>();
    const bad: string[] = [];
    for (const w of weeks) {
      const p = String(w.meta?.property);
      if (seen.has(p)) bad.push(`${w.id} shares property "${p}" with ${seen.get(p)}`);
      else seen.set(p, w.id);
    }
    expect(bad, bad.join("; ")).toEqual([]);
  });

  // String inequality is not distinctness. "boundary" and "declared-boundary"
  // are different strings, so the test above passed while two weeks were
  // visibly filed under the same word — which is exactly the failure the
  // /sessions/ index claims cannot happen ("no two own the same one"). A
  // reader compares words, not identifiers, so the check has to as well.
  it("keeps no property slug inside another", () => {
    const bad: string[] = [];
    for (const a of COURSE_PROPERTIES) {
      for (const b of COURSE_PROPERTIES) {
        if (a === b) continue;
        if (b.includes(a))
          bad.push(`"${a}" is a substring of "${b}" — a reader reads them as the same property`);
      }
    }
    expect(bad, bad.join("; ")).toEqual([]);
  });

  it("uses every property in the vocabulary exactly once", () => {
    const used = weeks.map((w) => String(w.meta?.property));
    const unused = COURSE_PROPERTIES.filter((p) => !used.includes(p));
    expect(
      unused,
      `properties declared but never taught — a week is missing or mislabelled: ${unused.join(", ")}`,
    ).toEqual([]);
  });
});

describe("check:stance — every week takes a position on the thesis", () => {
  it("declares a stance and a how of 20 words or fewer", () => {
    const bad = weeks.flatMap((w) => {
      const problems: string[] = [];
      const stance = String(w.meta?.stance);
      if (!["advances", "complicates", "challenges"].includes(stance))
        problems.push(`${w.id}: stance "${stance}" is not advances|complicates|challenges`);
      const how = String(w.meta?.how ?? "");
      const words = how.trim().split(/\s+/).filter(Boolean).length;
      if (words === 0) problems.push(`${w.id}: no how`);
      else if (words > 20) problems.push(`${w.id}: how is ${words} words, limit 20`);
      return problems;
    });
    expect(bad, bad.join("; ")).toEqual([]);
  });

  it("never runs the same stance for more than two weeks in a row", () => {
    const bad: string[] = [];
    for (let i = 2; i < weeks.length; i++) {
      const [a, b, c] = [weeks[i - 2]!, weeks[i - 1]!, weeks[i]!];
      if (
        a.meta?.stance === b.meta?.stance &&
        b.meta?.stance === c.meta?.stance
      )
        bad.push(
          `weeks ${a.meta?.week}, ${b.meta?.week}, ${c.meta?.week} all "${String(c.meta?.stance)}" — three in a row reads as a survey`,
        );
    }
    expect(bad, bad.join("; ")).toEqual([]);
  });
});

describe("check:ladder — the assessment chain is unbroken", () => {
  it("names the previous stage's produces as its own takes_input", () => {
    const bad: string[] = [];
    expect(assessments.length, "expected four assessments").toBe(4);
    for (let i = 0; i < assessments.length; i++) {
      const a = assessments[i]!;
      const takes = a.meta?.takesInput;
      if (i === 0) {
        if (takes !== null)
          bad.push(`${a.id}: stage 1 must take no input, found "${String(takes)}"`);
        continue;
      }
      const prev = assessments[i - 1]!;
      const produces = String(prev.meta?.produces ?? "");
      const t = String(takes ?? "");
      // Exact equality, not a fuzzy match. A paraphrase ("A2's portfolio") reads
      // like a chain while letting the two ends drift; requiring the identical
      // string means renaming an output renames its consumer or breaks the
      // build.
      if (t !== produces)
        bad.push(
          `${a.id}: takes_input "${t}" does not name ${prev.id}'s produces "${produces}" — the chain is broken here`,
        );
    }
    expect(bad, bad.join("; ")).toEqual([]);
  });
});

describe("check:event — the event always resolves to its definition", () => {
  const PHRASES = ["the drought", "the event", "the Dunkelflaute"];
  it("links to /the-event/ on every page that invokes it", () => {
    const bad: string[] = [];
    for (const [route, html] of builtPages()) {
      if (route === "/the-event/" || route.startsWith("/decks/")) continue;
      const text = textOf(html);
      const used = PHRASES.filter((p) => text.toLowerCase().includes(p.toLowerCase()));
      if (used.length === 0) continue;
      if (!/href="[^"]*\/the-event\/"/.test(html))
        bad.push(`${route} says ${used.map((u) => `"${u}"`).join(", ")} with no link to /the-event/`);
    }
    expect(bad, bad.join("; ")).toEqual([]);
  });
});

describe("check:traces — one dataset behind every chart", () => {
  const SRC = resolve("src");
  const sources = readdirSync(SRC, { recursive: true, encoding: "utf8" })
    .filter((f) => /\.(astro|ts)$/.test(f))
    .map((f) => [f, readFileSync(join(SRC, f), "utf8")] as [string, string]);

  it("makes every chart-bearing file read src/lib/trace.ts", () => {
    const bad = sources
      .filter(([, src]) => /<svg[\s>]/.test(src) && /\b[dD]\s*=\s*[{"]/.test(src))
      .filter(([, src]) => !/from "\.\.?\/(\.\.\/)?lib\/trace/.test(src))
      .filter(([, src]) => !/lib\/(event-definition|storage-scenario|dispatch-scenario)/.test(src))
      .map(([f]) => `src/${f}: draws an SVG path but never imports the shared trace`);
    expect(bad, bad.join("; ")).toEqual([]);
  });

  it("lets no file keep its own copy of the series", () => {
    const bad = sources
      .filter(([f]) => !f.endsWith("lib/trace.ts"))
      .flatMap(([f, src]) => {
        const long = [...src.matchAll(/\[\s*(?:-?\d+(?:\.\d+)?\s*,\s*){12,}/g)];
        return long.length
          ? [`src/${f}: holds a numeric array literal of 13+ values — a second copy of the data`]
          : [];
      });
    expect(bad, bad.join("; ")).toEqual([]);
  });
});
