import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

// check:render — a chart may not hide its own data.
//
// The trough band has shipped as an opaque fill three times: the light chart
// (5371870), the dark argument band, and the definition dial. Each time it was
// fixed locally and each time it came back somewhere else, because the rule
// lived in a reviewer's head rather than in the repo.
//
// Two invariants, both mechanical:
//   1. Order — in every built SVG, region bands (<rect>) are painted BEFORE the
//      first data path, so the series draws over them.
//   2. Fill — any band rule in src/ must take its fill from the shared trough
//      tokens. An opaque token behind a translucent area fill still erases the
//      shape, which is how this survived a z-order fix once already.

const DIST = resolve("dist");
const SRC = resolve("src");

const pages = readdirSync(DIST, { recursive: true, encoding: "utf8" })
  .filter((f) => f.endsWith(".html"))
  .map((f) => [`/${f.replace(/index\.html$/, "").replace(/\.html$/, "")}`, readFileSync(join(DIST, f), "utf8")] as [string, string]);

/** A path whose `d` is long enough to be a plotted series rather than a tick. */
const DATA_PATH_MIN = 200;

describe("check:render — no fill is painted over a data series", () => {
  it("paints every region band before the first data path", () => {
    const bad: string[] = [];
    for (const [route, html] of pages) {
      for (const svg of html.match(/<svg[\s\S]*?<\/svg>/g) ?? []) {
        const firstData = [...svg.matchAll(/<path[^>]*\sd="([^"]*)"/g)].find(
          (m) => (m[1]?.length ?? 0) >= DATA_PATH_MIN,
        );
        if (!firstData) continue;
        const cut = firstData.index!;
        const after = svg.slice(cut + firstData[0].length);
        for (const r of after.match(/<rect[^>]*>/g) ?? []) {
          // A rect after the series is only safe if it declares no fill at all.
          if (/\sclass="[^"]*(?:trough|-ev\b|band)/.test(r) || /fill="(?!none)/.test(r))
            bad.push(`${route}: a <rect> is painted after the data path — ${r.slice(0, 70)}`);
        }
      }
    }
    expect(bad, bad.join("; ")).toEqual([]);
  });

  it("every built SVG contains at least one child", () => {
    const bad = pages.flatMap(([route, html]) =>
      (html.match(/<svg[\s\S]*?<\/svg>/g) ?? [])
        .filter((s) => !/<(?:path|rect|line|text|g|circle|polyline)/.test(s))
        .map(() => `${route}: an <svg> rendered with no children — an empty chart looks exactly like whitespace and throws nothing`),
    );
    expect(bad, bad.join("; ")).toEqual([]);
  });

  it("takes every band fill from the shared trough tokens", () => {
    const files = readdirSync(SRC, { recursive: true, encoding: "utf8" })
      .filter((f) => /\.(astro|css)$/.test(f))
      .map((f) => [f, readFileSync(join(SRC, f), "utf8")] as [string, string]);
    const bad: string[] = [];
    for (const [file, src] of files) {
      // Rules whose selector names a region band.
      for (const m of src.matchAll(/(^|\n)\s*\.[^\n{]*(?:trough|-ev\b|band)[^\n{]*\{([^}]*)\}/g)) {
        const body = m[2]!;
        const fill = /fill\s*:\s*([^;]+)/.exec(body);
        if (!fill) continue;
        const v = fill[1]!.trim();
        const ok = /var\(--trough-|rgb\([^)]*\/\s*\d/.test(v) || v === "none";
        if (!ok)
          bad.push(
            `src/${file}: a band rule sets fill: ${v.slice(0, 40)} — bands must use var(--trough-wash) or an explicit alpha, never an opaque token`,
          );
      }
    }
    expect(bad, bad.join("; ")).toEqual([]);
  });
});
