import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

// check:instrument-styling — a chart may not disagree with its own stylesheet.
//
// Astro compiles a component's scoped CSS by appending an attribute selector:
// `.dc-supply` becomes `.dc-supply[data-astro-cid-xxxxxx]`. An element created
// in the client script with createElementNS carries no such attribute, so the
// rule never matches it. An unmatched SVG element does not fall back to
// "unstyled" in any visible sense — it falls back to `fill: black`.
//
// On a cream ground a black chart reads as a deliberately inked one. The
// dispatch console's four stack layers were therefore black from 28086c7
// onward, and it survived 66 tests, axe, and four rounds of visual review by
// two people. Dark mode did not create the defect; it removed the camouflage.
//
// `.trough` is the control case. It renders correctly in both themes because
// it was declared globally in CourseChrome as a shared convention. The line
// between working and broken is exactly the line between server-rendered and
// script-created.
//
// WHAT THIS CHECKS, AND WHY IT IS A SOURCE CHECK.
//
// The honest check would resolve computed fills in a browser and compare each
// chart layer against its legend swatch. It cannot be written here: the suite
// has no DOM with SVG layout, the elements do not exist until the client script
// runs, and adding a headless browser to the test run would add a dependency.
// So this asserts the root cause instead of the symptom, statically:
//
//   if a component both (a) assigns a class in its client script and
//   (b) declares a rule for that class in its own <style> block,
//   then that rule MUST be :global(), or it will never match the element.
//
// It fires only on that intersection, so a class styled but never
// script-assigned is ignored, and a class assigned but styled elsewhere —
// globally, as .trough is — is ignored too.

const COMPONENTS = [
  "src/components/DispatchConsole.astro",
  "src/components/StorageSizer.astro",
  "src/components/DefinitionDial.astro",
  "src/components/HeroFarm.astro",
  "src/components/TraceFigure.astro",
];

interface Parsed {
  file: string;
  script: string;
  style: string;
  /** Classes this file declares a rule for, and whether that rule is global. */
  declared: Map<string, boolean>;
}

function parse(file: string): Parsed | null {
  const src = readFileSync(resolve(file), "utf8");
  // Comments are stripped first. Without that, a CSS comment mentioning a
  // class name registers as a declaration of it — which this check did on its
  // first run, flagging .trough because the comment beside the fix says
  // ".trough already uses in CourseChrome". A parser that reads its own prose
  // as data is the same class of error the check exists to catch.
  const strip = (t: string) => t.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/\/\/[^\n]*/g, " ");
  const script = strip(
    [...src.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]!).join("\n"),
  );
  const style = strip(
    [...src.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]!).join("\n"),
  );
  if (!script.trim() || !style.trim()) return null;

  const declared = new Map<string, boolean>();
  // Every class selector at the head of a rule, recording whether it is wrapped
  // in :global(). Matches `.x {`, `.x,`, `:global(.x) {`, `.x:hover {` etc.
  for (const m of style.matchAll(/(:global\s*\(\s*)?\.([a-zA-Z][\w-]*)/g)) {
    const isGlobal = Boolean(m[1]);
    const name = m[2]!;
    // a class is global if ANY of its declarations is global
    declared.set(name, (declared.get(name) ?? false) || isGlobal);
  }
  return { file, script, style, declared };
}

/** Class tokens the client script assigns to elements. */
function scriptAssigned(script: string): Set<string> {
  const out = new Set<string>();
  const add = (raw: string) =>
    raw
      .split(/\s+/)
      .map((t) => t.trim())
      .filter(Boolean)
      .forEach((t) => out.add(t));

  // setAttribute("class", "a b"), setAttribute('class', 'a')
  for (const m of script.matchAll(/setAttribute\(\s*["']class["']\s*,\s*["']([^"']+)["']/g))
    add(m[1]!);
  // Deliberately NOT classList.add/toggle or `className =`. Those operate on
  // elements that already exist, which in these components means
  // server-rendered ones — and those DO carry the cid, so a scoped rule
  // matches them. .is-hidden in the dial is exactly that case: toggled onto a
  // server-rendered .dial-series path, scoped, and working. Flagging it would
  // be a false positive, and the check is about elements the script *creates*.
  // A helper receiving a class string as its last argument, e.g.
  // rect(x, w, "trough trough--near") or mark(h, label, "dc-mark-unrec").
  for (const m of script.matchAll(/,\s*["']([a-zA-Z][\w-]*(?:\s+[a-zA-Z][\w-]*)*)["']\s*\)/g))
    add(m[1]!);
  return out;
}

describe("check:instrument-styling — script-created elements are actually styled", () => {
  const parsed = COMPONENTS.map(parse).filter((p): p is Parsed => p !== null);

  it("finds components that both script and style", () => {
    expect(parsed.length, "no component had both a script and a style block").toBeGreaterThan(0);
  });

  it("never scopes a rule for a class the client script assigns", () => {
    const bad: string[] = [];
    for (const p of parsed) {
      const assigned = scriptAssigned(p.script);
      for (const cls of assigned) {
        if (!p.declared.has(cls)) continue; // styled elsewhere, or not styled
        if (p.declared.get(cls) === true) continue; // already :global()
        bad.push(
          `${p.file}: .${cls} is assigned in the client script but its rule is scoped. ` +
            `Astro appends [data-astro-cid-…] to the selector, a createElementNS element has ` +
            `no such attribute, so the rule never matches and the element falls back to ` +
            `fill: black. Wrap it in :global().`,
        );
      }
    }
    expect(bad, bad.join("\n")).toEqual([]);
  });

  it("keeps every dispatch stack layer and marker globally declared", () => {
    // The four layers and the markers are the specific elements whose silent
    // black fill shipped. Named explicitly so removing a :global() here fails
    // loudly even if the general rule above is ever loosened.
    const console = parse("src/components/DispatchConsole.astro")!;
    const required = [
      "dc-supply",
      "dc-storage",
      "dc-reserve",
      "dc-short",
      "dc-demand",
      "dc-soc-line",
      "dc-mark-unrec",
      "dc-mark-short",
      "dc-mark-label",
    ];
    const bad = required.filter((c) => console.declared.get(c) !== true);
    expect(
      bad,
      `dispatch console layers whose rule is not :global(): ${bad.join(", ")} — these are the elements that rendered black on every build since 28086c7`,
    ).toEqual([]);
  });

  it("declares a fill for every stack layer, so none inherits the SVG default", () => {
    const console = parse("src/components/DispatchConsole.astro")!;
    const bad: string[] = [];
    for (const c of ["dc-supply", "dc-storage", "dc-reserve", "dc-short"]) {
      const rule = new RegExp(`:global\\(\\.${c}\\)[^{]*\\{([^}]*)\\}`).exec(console.style);
      if (!rule) {
        bad.push(`.${c}: no :global() rule found`);
        continue;
      }
      if (!/\bfill\s*:/.test(rule[1]!))
        bad.push(`.${c}: rule declares no fill, so the layer takes SVG's default black`);
    }
    expect(bad, bad.join("; ")).toEqual([]);
  });
});
