import { describe, expect, it } from "vitest";
import { PRESETS, simulateDispatch } from "../src/lib/dispatch-scenario.ts";

// check:dispatch — the property that makes the console teach rather than
// merely run.
//
// The lesson of Assessment 3 is that a dispatch plan can become unrecoverable
// long before anything visibly breaks. That only lands if the gap between the
// two hours is wide enough to sit through. A console where the shortfall
// follows the irreversible point immediately teaches "the defaults are wrong";
// one where nothing can fail teaches nothing at all.
//
// So: survival must be possible, failure must be possible, and every failure
// must be diagnosable with room to spare. There is deliberately no constraint
// on the absolute blackout hour — an earlier tuning attempt carried one and it
// was the only reason the scenario came back unreachable. The gap is the
// lesson; the hour it happens to land on is not.

const runs = PRESETS.map((p) => ({ ...p, run: simulateDispatch(p.decisions) }));
const MIN_GAP = 12;

describe("check:dispatch — the scenario is losable, winnable and diagnosable", () => {
  it("lets at least one preset survive", () => {
    const survivors = runs.filter((r) => r.run.survived).map((r) => r.label);
    expect(
      survivors.length,
      `no preset survives, so the console teaches that the defaults are wrong rather than that the decision mattered. Presets: ${runs.map((r) => r.label).join(", ")}`,
    ).toBeGreaterThan(0);
  });

  it("lets at least one preset fail", () => {
    const losers = runs.filter((r) => !r.run.survived).map((r) => r.label);
    expect(
      losers.length,
      `every preset survives, so the student cannot fail and the event is not losable`,
    ).toBeGreaterThan(0);
  });

  it("gives every failing preset an irreversible point at least 12 hours before the shortfall", () => {
    const bad = runs
      .filter((r) => !r.run.survived)
      .flatMap((r) => {
        const { shortfallHour, unrecoverableHour } = r.run;
        if (unrecoverableHour === null)
          return [
            `"${r.label}" fails at hour ${shortfallHour} but has no unrecoverable hour — the loss was recoverable at every point, so there is nothing to diagnose`,
          ];
        if (shortfallHour === null) return [];
        const gap = shortfallHour - unrecoverableHour;
        return gap >= MIN_GAP
          ? []
          : [
              `"${r.label}": unrecoverable at hour ${unrecoverableHour}, shortfall at hour ${shortfallHour}, gap ${gap}h — under the ${MIN_GAP}h minimum, so the run breaks too soon after it is lost to be felt`,
            ];
      });
    expect(bad, bad.join("; ")).toEqual([]);
  });

  it("is deterministic — the same decisions give the same run", () => {
    const bad = PRESETS.filter((p) => {
      const a = simulateDispatch(p.decisions);
      const b = simulateDispatch(p.decisions);
      return (
        a.shortfallHour !== b.shortfallHour ||
        a.unrecoverableHour !== b.unrecoverableHour ||
        a.totalUnservedPctH !== b.totalUnservedPctH
      );
    }).map((p) => `"${p.label}" is not reproducible`);
    expect(bad, bad.join("; ")).toEqual([]);
  });
});
