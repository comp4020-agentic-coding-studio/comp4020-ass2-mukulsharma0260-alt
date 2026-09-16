import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

// check:fonts — four roles, no loose families.
//
// Every font-family declaration in src/ must name one of the four role tokens:
//   --ui     the institution's face (the theme's Public Sans), chrome only
//   --serif  the argument — all reading prose
//   --disp   display: headings, claims, the hero
//   --mono   the instrument: anything measured
//
// The theme's own --at-font-body / --at-font-mono are accepted because --ui and
// --mono alias them; astro.config.ts requires --font-public-sans for deck
// compilation and README fixes that file, so the aliases are the honest way to
// keep the chrome on the institution's typeface.
//
// A literal family name anywhere in src/ is a failure: it is how a fifth face
// arrives without anyone deciding to add one.

const SRC = resolve("src");
const ALLOWED = /var\(--(?:ui|serif|disp|mono|at-font-body|at-font-mono)\)/;

const files = readdirSync(SRC, { recursive: true, encoding: "utf8" })
  .filter((f) => /\.(astro|css)$/.test(f))
  .map((f) => [f, readFileSync(join(SRC, f), "utf8")] as [string, string]);

describe("check:fonts — one type system", () => {
  it("declares no font-family outside the four role tokens", () => {
    const bad: string[] = [];
    for (const [file, src] of files) {
      const lines = src.split("\n");
      lines.forEach((line, i) => {
        const m = /(?<!-)font-family\s*:\s*([^;}]+)/.exec(line);
        if (!m) return;
        const value = m[1]!.trim();
        // The token definitions themselves are where the families live.
        if (file.endsWith("layouts/PageLayout.astro") && /^"?(?:Fraunces|Newsreader)/.test(value)) return;
        if (!ALLOWED.test(value))
          bad.push(`src/${file}:${i + 1}: font-family: ${value.slice(0, 48)} — name a role token, not a family`);
      });
    }
    expect(bad, bad.join("; ")).toEqual([]);
  });

  it("defines all four role tokens exactly once", () => {
    const layout = files.find(([f]) => f.endsWith("layouts/PageLayout.astro"))?.[1] ?? "";
    const bad = (["--ui", "--serif", "--disp", "--mono"] as const)
      .map((t) => ({ t, n: [...layout.matchAll(new RegExp(`^\\s*${t}:`, "gm"))].length }))
      .filter((r) => r.n !== 1)
      .map((r) => `src/layouts/PageLayout.astro: ${r.t} defined ${r.n} times, expected once`);
    expect(bad, bad.join("; ")).toEqual([]);
  });
});
