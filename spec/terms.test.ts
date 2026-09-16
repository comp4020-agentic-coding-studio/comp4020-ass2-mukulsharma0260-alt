import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

// check:terms — one word for a week.
//
// The site previously called the same thing four things: the nav said "Studios",
// headings said "Week 2 Studio", the eyebrow said "WEEK 02" and a link said "all
// twelve studios". A student looking for the schedule had to guess.
//
// Locked: WEEKS in navigation and headings, "Week 07" in prose, "W07" only in
// data tables and chart labels. "Studio" refers ONLY to the two-hour session
// inside a week — so it may appear in prose describing that session, and must
// never appear as a navigation label or as a synonym for the week itself.

const DIST = resolve("dist");
const pages = readdirSync(DIST, { recursive: true, encoding: "utf8" })
  .filter((f) => f.endsWith(".html"))
  .map((f) => [`/${f.replace(/index\.html$/, "").replace(/\.html$/, "")}`, readFileSync(join(DIST, f), "utf8")] as [string, string]);

describe("check:terms — a week is called a week", () => {
  it("never uses Studios as a navigation label", () => {
    const bad: string[] = [];
    for (const [route, html] of pages) {
      const nav = html.match(/<nav[\s\S]*?<\/nav>/gi)?.join(" ") ?? "";
      if (/>\s*Studios?\s*</i.test(nav))
        bad.push(`${route}: navigation offers "Studios" — the nav must say Weeks`);
    }
    expect(bad, bad.join("; ")).toEqual([]);
  });

  it("never uses Studio as a synonym for a week in a heading", () => {
    const bad: string[] = [];
    for (const [route, html] of pages) {
      for (const m of html.matchAll(/<h([1-3])[^>]*>([\s\S]*?)<\/h\1>/g)) {
        const text = m[2]!.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
        if (/\bweek\s*\d+\s+studio\b/i.test(text) || /\bstudios\b/i.test(text))
          bad.push(`${route}: heading "${text.slice(0, 60)}" uses Studio as a week`);
      }
    }
    expect(bad, bad.join("; ")).toEqual([]);
  });

  it("never says 'twelve studios' or similar in body copy", () => {
    const bad: string[] = [];
    for (const [route, html] of pages) {
      const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
      if (/\b(?:twelve|all|the)\s+studios\b/i.test(text))
        bad.push(`${route}: body copy treats "studios" as the twelve weeks`);
    }
    expect(bad, bad.join("; ")).toEqual([]);
  });
});
