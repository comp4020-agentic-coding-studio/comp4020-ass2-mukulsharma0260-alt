// Applying an event definition to the shared synthetic trace.
//
// This is the machinery behind the Definition Dial. It is deliberately a
// separate module from src/lib/trace.ts: the trace is the data, this is the
// classification rule applied to it, and the two change for different reasons.
//
// Unlike a naive run-finder, this honours the recovery allowance from the
// course's operative definition — a short excursion above the threshold does
// not end an event. A classifier that broke every run at the first
// above-threshold hour would disagree with /the-event/, which is the page all
// of this is supposed to resolve against.

import {
  MIN_SPAN_HOURS,
  RECOVERY_ALLOWANCE_HOURS,
  THRESHOLD_PCT,
  TRACE_HOURS,
  trace,
} from "./trace.ts";

/** Which sources the threshold is applied to. All three are genuinely present
 *  in the trace as separate series, so none of this is invented. */
export type SourceMix = "combined" | "wind" | "solar";

export interface EventDefinition {
  /** Output below this share of installed capacity counts as below threshold. */
  thresholdPct: number;
  /** Minimum event span, in hours, for a period to qualify. */
  minSpanHours: number;
  /** A recovery above the threshold ends an event only if it runs longer. */
  recoveryAllowanceHours: number;
  sourceMix: SourceMix;
}

/** The course's operative definition, as published at /the-event/. The dial
 *  starts here and can always be restored to it. */
export const CANONICAL_DEFINITION: EventDefinition = {
  thresholdPct: THRESHOLD_PCT,
  minSpanHours: MIN_SPAN_HOURS,
  recoveryAllowanceHours: RECOVERY_ALLOWANCE_HOURS,
  sourceMix: "combined",
};

export interface Period {
  /** Hour index where the period starts. */
  start: number;
  /** Span in hours, inclusive of any tolerated recoveries inside it. */
  span: number;
  /** Hours within the span that are actually below the threshold. */
  hoursBelow: number;
  /** Lowest output reached inside the span, % of capacity. */
  minPct: number;
}

export interface Classification {
  /** Periods that satisfy every parameter of the definition. */
  events: Period[];
  /** Periods low enough to count but too short to qualify — the discards the
   *  duration rule makes, which the dial shows faintly. */
  nearMisses: Period[];
  /** The longest qualifying event, or null when none qualify. */
  worst: Period | null;
  /** Total hours inside qualifying events. */
  totalEventHours: number;
}

export function seriesFor(mix: SourceMix): readonly number[] {
  if (mix === "wind") return trace.wind;
  if (mix === "solar") return trace.solar;
  return trace.total;
}

/** Merge below-threshold runs across recoveries no longer than the allowance,
 *  then describe each resulting period. */
function candidatePeriods(definition: EventDefinition): Period[] {
  const series = seriesFor(definition.sourceMix);
  const below = series.map((v) => v < definition.thresholdPct);
  const periods: Period[] = [];

  let hour = 0;
  while (hour < TRACE_HOURS) {
    if (!below[hour]) {
      hour++;
      continue;
    }
    const start = hour;
    let lastBelow = hour;
    let cursor = hour;

    while (cursor < TRACE_HOURS) {
      if (below[cursor]) {
        lastBelow = cursor;
        cursor++;
        continue;
      }
      // A gap. Measure it, and swallow it only if the allowance covers it.
      let gapEnd = cursor;
      while (gapEnd < TRACE_HOURS && !below[gapEnd]) gapEnd++;
      const gap = gapEnd - cursor;
      if (gap <= definition.recoveryAllowanceHours && gapEnd < TRACE_HOURS) {
        cursor = gapEnd;
        continue;
      }
      break;
    }

    const span = lastBelow - start + 1;
    const window = series.slice(start, lastBelow + 1);
    periods.push({
      start,
      span,
      hoursBelow: window.filter((v) => v < definition.thresholdPct).length,
      minPct: Math.min(...window),
    });
    hour = lastBelow + 1;
  }

  return periods;
}

export function classify(definition: EventDefinition): Classification {
  const candidates = candidatePeriods(definition);
  const events = candidates.filter((p) => p.span >= definition.minSpanHours);
  const nearMisses = candidates.filter((p) => p.span < definition.minSpanHours);
  const worst = events.reduce<Period | null>(
    (best, p) => (best === null || p.span > best.span ? p : best),
    null,
  );
  return {
    events,
    nearMisses,
    worst,
    totalEventHours: events.reduce((sum, p) => sum + p.span, 0),
  };
}

/** Hour index → "day D, HH:00", for readouts. */
export function hourLabel(hour: number): string {
  return `day ${Math.floor(hour / 24) + 1}, ${String(hour % 24).padStart(2, "0")}:00`;
}
