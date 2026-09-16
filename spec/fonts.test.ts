import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

// check:fonts — four roles, no loose families.
//
//   --ui     the institution's face (the theme's Public Sans), chrome only
//   --serif  the argument: all reading prose
//   --disp   display: headings, claims, the hero
//   --mono   the instrument: anything measured
//
// --ui and --mono alias the theme's self-hosted faces, because astro.config.ts
// requires --font-public-sans for deck compilation and README fixes that file.
// A literal family name in src/ is a failure: it is how a fifth face arrives
// without anyone deciding to add one. The two places families may legitimately
// appear are the token definitions themselves.

const SRC = resolve("src");
const ALLOWED = /var\(--(?:ui|serif|disp|mono|at-font-body|at-font-mono)\)/;
const DEFINERS = ["components/CourseChrome.astro", "decks/theme.css"];

const files = readdirSync(SRC, { recursive: true, encoding: "utf8" })
  .filter((f) => /\.(astro|css)$/.test(f))
  .map((f) => [f, readFileSync(join(SRC, f), "utf8")] as [string, string]);

describe("check:fonts — one type system", () => {
  it("declares no font-family outside the four role tokens", () => {
    const bad: string[] = [];
    for (const [file, src] of files) {
      src.split("\n").forEach((line, i) => {
        const m = /(?<!-)font-family\s*:\s*([^;}]+)/.exec(line);
        if (!m) return;
        const value = m[1]!.trim();
        if (!ALLOWED.test(value))
          bad.push(`src/${file}:${i + 1}: font-family: ${value.slice(0, 44)} — name a role token, not a family`);
      });
    }
    expect(bad, bad.join("; ")).toEqual([]);
  });

  it("defines the four role tokens once per rendering surface", () => {
    const bad: string[] = [];
    for (const def of DEFINERS) {
      const src = files.find(([f]) => f === def)?.[1];
      if (!src) {
        bad.push(`src/${def}: missing, so one rendering surface has no type tokens`);
        continue;
      }
      for (const t of ["--ui", "--serif", "--disp", "--mono"] as const) {
        const n = [...src.matchAll(new RegExp(`^\\s*${t}:`, "gm"))].length;
        if (n !== 1) bad.push(`src/${def}: ${t} defined ${n} times, expected once`);
      }
    }
    expect(bad, bad.join("; ")).toEqual([]);
  });
});
