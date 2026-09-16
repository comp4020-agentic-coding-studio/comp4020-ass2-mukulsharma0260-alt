import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  EVENT_LENGTH_HOURS,
  THRESHOLD_PCT,
  hoursBelow,
  referenceEvent,
} from "../src/lib/trace.ts";

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
