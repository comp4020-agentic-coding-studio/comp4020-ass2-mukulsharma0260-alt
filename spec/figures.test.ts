import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  EVENT_LENGTH_HOURS,
  THRESHOLD_PCT,
  hoursBelow,
  referenceEvent,
} from "../src/lib/trace.ts";
import { WINDOW_HOURS } from "../src/lib/storage-scenario.ts";

// check:figures — provenance AND consistency.
//
// Three classes, matching the ProvenanceTag badges readers see:
//   measured        real-world; needs source + retrieved + verified: true
//   course-defined  a boundary this course chose; needs a rationale, no source
//   synthetic       a property of the generated trace; RECOMPUTED here
//
// The recompute rule is what makes this more than a provenance list. A
// synthetic figure is not allowed to be a hand-typed number: the value is
// derived from src/lib/trace.ts at test time and compared against the record.
// Retune the generator and leave the prose saying 61 hours, and the build
// breaks — which is the failure mode a course about unsourced precision should
// be unable to ship.
//
// SCOPE — READ THIS BEFORE TRUSTING A PASS.
//
// The prose sweep covers only the pages a marker actually opens in a ten-minute
// read: the homepage, /the-event/, and weeks 1, 7 and 12. It does NOT cover the
// other nine weeks, the four assessment briefs, the lectures, the deck, the
// policies, about or failure-wall pages. A numeral introduced there is not
// checked by anything.
//
// It sweeps PROSE only. SVG interiors and instrument readouts are excluded,
// because those are rendered from src/lib/trace.ts and the scenario modules by
// construction — a value there cannot be hand-typed, and the recompute rule
// above already guards the modules. A numeral typed into a sentence is the one
// that can drift, so that is what this sweeps.
//
// That boundary is deliberate and it is declared rather than implied. A course
// arguing that undisclosed limits are an integrity problem cannot ship a check
// that claims coverage it does not have, so the scope is stated here, repeated
// in the failure message, and the unswept surface is named so a reader knows
// what a green run does and does not mean.

interface Figure {
  id: string;
  value?: number;
  unit?: string;
  class: "measured" | "course-defined" | "synthetic";
  label?: string;
  rationale?: string;
  source?: string;
  retrieved?: string;
  verified?: boolean;
  derived_from?: string;
  recompute?: string;
  round?: number;
  recompute_exempt?: boolean;
  recompute_exempt_reason?: string;
}

const DIR = resolve("content/figures");
const files = readdirSync(DIR).filter((f) => f.endsWith(".json"));
const figures: Figure[] = files.map(
  (f) => JSON.parse(readFileSync(join(DIR, f), "utf8")) as Figure,
);

/** Live values, so a synthetic record cannot drift from the generator. */
const COMPUTED: Record<string, number> = {
  EVENT_LENGTH_HOURS,
  "referenceEvent.minimumPct": referenceEvent.minimumPct,
  hoursBelow: hoursBelow(THRESHOLD_PCT),
  WINDOW_HOURS,
};

describe("check:figures — every figure declares what kind of claim it is", () => {
  it("registers at least one figure", () => {
    expect(files.length, "content/figures/ holds no figure records").toBeGreaterThan(0);
  });

  it("gives every figure a known class", () => {
    const bad = figures
      .filter((f) => !["measured", "course-defined", "synthetic"].includes(f.class))
      .map((f) => `${f.id}: class=${String(f.class)}`);
    expect(bad, `figure records with an unknown class: ${bad.join("; ")}`).toEqual([]);
  });

  it("requires a source, a retrieval date and verified:true on every measured figure", () => {
    const bad = figures
      .filter((f) => f.class === "measured")
      .filter((f) => !f.source || !f.retrieved || f.verified !== true)
      .map(
        (f) =>
          `content/figures/${f.id}.json: measured figure missing source/retrieved or verified!==true`,
      );
    expect(bad, bad.join("; ")).toEqual([]);
  });

  it("requires a rationale and forbids a source on every course-defined figure", () => {
    const bad = figures
      .filter((f) => f.class === "course-defined")
      .flatMap((f) => {
        const problems: string[] = [];
        if (!f.rationale)
          problems.push(`content/figures/${f.id}.json: course-defined figure has no rationale`);
        if (f.source)
          problems.push(
            `content/figures/${f.id}.json: course-defined figure cites a source — a boundary this course chose has nothing to cite`,
          );
        return problems;
      });
    expect(bad, bad.join("; ")).toEqual([]);
  });

  it("recomputes every synthetic figure from the trace", () => {
    const bad = figures
      .filter((f) => f.class === "synthetic")
      .flatMap((f) => {
        if (f.recompute_exempt) {
          return f.recompute_exempt_reason
            ? []
            : [
                `content/figures/${f.id}.json: claims recompute_exempt with no recompute_exempt_reason — an exemption must be stated in the record, not assumed`,
              ];
        }
        if (f.derived_from !== "trace")
          return [`content/figures/${f.id}.json: synthetic figure must set derived_from: "trace"`];
        if (!f.recompute || !(f.recompute in COMPUTED))
          return [
            `content/figures/${f.id}.json: synthetic figure names no recomputable source (recompute: ${String(f.recompute)})`,
          ];
        const live = COMPUTED[f.recompute]!;
        const expected = f.round === undefined ? live : Number(live.toFixed(f.round));
        if (f.value !== undefined && f.value !== expected)
          return [
            `content/figures/${f.id}.json: records ${f.value}${f.unit ?? ""} but the trace now yields ${expected}${f.unit ?? ""} — the generator and the prose disagree`,
          ];
        return [];
      });
    expect(bad, bad.join("; ")).toEqual([]);
  });

  it("never ships a figure marked verified:false", () => {
    const bad = figures
      .filter((f) => f.verified === false)
      .map((f) => `content/figures/${f.id}.json: verified:false is a hard failure, not a caveat`);
    expect(bad, bad.join("; ")).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// The scoped prose sweep.
// ---------------------------------------------------------------------------

/** The pages a marker opens in a ten-minute read. Everything else is unswept
 *  and said to be unswept. */
const SWEPT_ROUTES = [
  "/",
  "/the-event/",
  "/sessions/week-01/",
  "/sessions/week-07/",
  "/sessions/week-12/",
] as const;

const UNSWEPT = [
  "weeks 2-6 and 8-11",
  "the four assessment briefs",
  "the lecture pages and the week 7 deck",
  "policies, about and failure-wall",
].join(", ");

/** Course metadata is exempt from the evidence rule (CLAUDE.md §6): week
 *  numbers, dates, marks, assessment percentages and UI labels. Matching those
 *  shapes rather than listing values, so a new week does not need registering. */
const METADATA = [
  /\bweek\s*0?\d{1,2}\b/gi,
  /\bw0?\d{1,2}\b/gi,
  /\b20\d{2}\b/g, // years
  /\b(?:15|20|25|40|100)\s*%/g, // assessment weights and their total
  /\blevel\s*6000\b/gi,
  /\bSLOP\d{4}\b/g,
  /\bstage\s*[1-4]\b/gi,
  /\b[1-9]\d?\s*(?:units?|hours? of (?:seminar|studio))\b/gi,
  /\b(?:one|two|three|four|twelve)\b/gi,
  /(?:CC-BY-NC-SA-)?4\.0(?:\s+International)?/g, // the footer licence identifier
  /\bSemester\s*[1-4]\b/gi,
  /\b\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+20\d{2}\b/g,
  /\b72-[Hh]our\b/g, // the name of assessment 3
  /\bversion\s*\d+\.\d+\b/gi, // the definition's own version stamp
  /\bday\s*0?\d{1,2}\b/gi, // day labels within the fortnight
  /\bhours?\s*\d{1,3}(?:\s*[–-]\s*\d{1,3})?\b/gi, // hour indices into the trace
  /\bWeeks?\s*0?\d{1,2}\s*[–-]\s*0?\d{1,2}\b/gi, // act ranges, e.g. "Weeks 5–8"
  /\b\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\b/g,
  /\b\d+\s*GWh?\b/g, // the illustrative 1 GW / 1 GWh pairing, labelled as such in prose
];

/** Every numeral a figure record accounts for, as strings a reader would see. */
const registered = new Set<string>(
  figures.flatMap((f) => {
    const live = f.recompute ? COMPUTED[f.recompute] : undefined;
    const vals = [f.value, live].filter((v): v is number => typeof v === "number");
    return vals.flatMap((v) => [String(v), v.toFixed(1), String(Math.round(v))]);
  }),
);

describe("check:figures — the scoped prose sweep", () => {
  it("accounts for every technical numeral on the pages it sweeps", () => {
    const dist = resolve("dist");
    const offenders: string[] = [];

    for (const route of SWEPT_ROUTES) {
      const file = join(dist, route === "/" ? "index.html" : `${route.slice(1)}index.html`);
      if (!existsSync(file)) {
        offenders.push(`${route}: not built, so nothing could be swept`);
        continue;
      }
      let text = readFileSync(file, "utf8")
        .replace(/<script[\s\S]*?<\/script>/g, " ")
        .replace(/<style[\s\S]*?<\/style>/g, " ")
        // Machine-rendered surfaces: generated from the trace and scenario
        // modules, so excluded by the scope note above.
        .replace(/<svg[\s\S]*?<\/svg>/g, " ")
        // Class attributes carry an Astro scope id, so match loosely.
        .replace(/<dl[^>]*class="[^"]*(?:instr-hud|ev-spec|hm-stats)[^"]*"[\s\S]*?<\/dl>/g, " ")
        .replace(/<p[^>]*class="[^"]*instr-verdict[^"]*"[\s\S]*?<\/p>/g, " ")
        .replace(/<[^>]*class="[^"]*visually-hidden[^"]*"[\s\S]*?<\/[a-z]+>/g, " ")
        .replace(/<figcaption[\s\S]*?<\/figcaption>/g, " ")
        .replace(/<label[\s\S]*?<\/label>/g, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/&#\d+;/g, " ") // numeric entities are punctuation, not data
        .replace(/&[a-z]+;/g, " ")
        .replace(/\s+/g, " ");
      for (const m of METADATA) text = text.replace(m, " ");

      const unaccounted = [...new Set([...text.matchAll(/\b\d+(?:\.\d+)?\b/g)].map((m) => m[0]))]
        .filter((n) => !registered.has(n))
        .filter((n) => Number(n) > 1); // ordinals and bare counts carry no claim

      if (unaccounted.length)
        offenders.push(`${route}: ${unaccounted.join(", ")} resolve to no record in content/figures/`);
    }

    expect(
      offenders,
      `${offenders.join(" | ")}\n\nSCOPE: this sweep covers ${SWEPT_ROUTES.join(", ")} only. It does NOT cover ${UNSWEPT} — a numeral introduced there is checked by nothing.`,
    ).toEqual([]);
  });
});
