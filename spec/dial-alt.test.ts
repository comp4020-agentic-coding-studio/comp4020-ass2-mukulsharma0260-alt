import { describe, expect, it } from "vitest";
import {
  CANONICAL_DEFINITION,
  classify,
  describeClassification,
  type EventDefinition,
} from "../src/lib/event-definition.ts";

// check:dial-alt — the chart's text alternative states the CURRENT finding.
//
// The alternative was hand-written into the markup and never regenerated, so it
// read "one period qualifies ... six rejected" no matter where the controls
// were — including with the visible readout showing EVENTS FOUND 0 and
// REJECTED 7. A sighted user could see the contradiction; a screen-reader user
// could not.
//
// Both the server-rendered alternative and the client's re-render now call
// describeClassification with the same classification the verdict line uses.
// This pins the state that used to be wrong.

describe("check:dial-alt", () => {
  it("does not claim a qualifying period when none qualifies", () => {
    const def: EventDefinition = {
      ...CANONICAL_DEFINITION,
      thresholdPct: 12,
      minSpanHours: 96,
    };
    const c = classify(def);
    const alt = describeClassification(def, c);

    expect(c.events.length, "threshold 12 / span 96 should qualify nothing").toBe(0);
    expect(alt).not.toContain("one period qualifies");
    expect(alt.toLowerCase()).not.toContain("one period qualifies");
    expect(alt).toContain("No period in the fortnight qualifies");
  });

  it("reports the count it was given, and the rejected count with it", () => {
    const c = classify(CANONICAL_DEFINITION);
    const alt = describeClassification(CANONICAL_DEFINITION, c);
    expect(c.events.length).toBe(1);
    expect(alt).toContain("One period qualifies");
    expect(alt).toContain(`${c.worst!.span}-hour trough`);
    expect(alt).toContain(`${c.worst!.minPct.toFixed(1)}%`);
    expect(alt, "the rejected count must come from the classification").toMatch(
      /(no|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve) shorter low/,
    );
  });

  it("states the definition it was classified under", () => {
    const def: EventDefinition = { ...CANONICAL_DEFINITION, thresholdPct: 20, minSpanHours: 24 };
    const alt = describeClassification(def, classify(def));
    expect(alt).toContain("20% threshold");
    expect(alt).toContain("24-hour minimum span");
  });
});
