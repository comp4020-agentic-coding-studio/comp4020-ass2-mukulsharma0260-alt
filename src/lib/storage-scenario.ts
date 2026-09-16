// The synthetic dispatch scenario the Storage Sizer runs on (Week 7).
//
// EVERY PARAMETER BELOW IS A SYNTHETIC TEACHING CONSTANT, declared here and
// nowhere else. None of it is a claim about a real system, and this module
// deliberately states no absolute megawatt or megawatt-hour figure — the
// trace's native unit is "% of combined installed wind and solar capacity",
// and expressing demand and storage in that same unit keeps the arithmetic
// honest without inventing a system size.
//
// Reading the units:
//   power  — % of installed capacity the store can deliver in any one hour
//   energy — capacity-percent-hours (%·h): delivering 20% for 5 h costs 100
//
// That separation is the entire point of the week: power and energy are set
// independently, and which one binds depends on the shape of the deficit.

import { EVENT_START_HOUR, trace } from "./trace.ts";

/** Flat demand for the teaching scenario, as % of installed capacity.
 *  SYNTHETIC. At this level demand exceeds combined output in every hour of
 *  the window, because the window opens inside the event's ramp-down — so the
 *  store faces one continuous deficit rather than a series of separate dips.
 *  That is the case the week is about. */
export const DEMAND_PCT = 40;

/** The 72-hour operating window, opening six hours before the event's
 *  nominal start and closing five hours after it ends. SYNTHETIC framing of
 *  an index into the shared trace. */
export const WINDOW_START_HOUR = EVENT_START_HOUR - 6;
export const WINDOW_HOURS = 72;

/** Round-trip losses are ignored in the sizer: it isolates power against
 *  energy, and adding a third parameter would blur the lesson. The Dispatch
 *  Console is where efficiency belongs. */

export interface StorageSpec {
  /** Maximum discharge in any one hour, % of installed capacity. */
  powerPct: number;
  /** Usable stored energy, in capacity-percent-hours (%·h). */
  energyPctH: number;
}

export interface HourRow {
  hour: number;
  /** Absolute trace hour, for cross-referencing the shared dataset. */
  traceHour: number;
  /** Combined wind + solar output, % of capacity. */
  supplyPct: number;
  /** Demand not met by generation, % of capacity. */
  deficitPct: number;
  /** What the store actually delivered this hour, % of capacity. */
  dischargePct: number;
  /** Energy left after this hour, %·h. */
  remainingPctH: number;
  /** Demand met by neither generation nor the store, % of capacity. */
  shortfallPct: number;
}

export interface StorageRun {
  rows: HourRow[];
  /** First hour of the window with unmet demand, or null if none. */
  firstShortfallHour: number | null;
  /** Hours of the window survived before the first shortfall. */
  survivedHours: number;
  /** Total unmet energy across the window, %·h. */
  unservedPctH: number;
  /** Largest single-hour deficit in the window, % of capacity. */
  peakDeficitPct: number;
  /** Total energy the deficit demands across the window, %·h. */
  requiredPctH: number;
  /** True when the store never ran out but could not meet an hourly peak. */
  powerLimited: boolean;
  /** True when the store emptied. */
  energyLimited: boolean;
}

/** The window's supply and deficit, independent of any storage choice. */
export function windowProfile(): { traceHour: number; supplyPct: number; deficitPct: number }[] {
  return Array.from({ length: WINDOW_HOURS }, (_, i) => {
    const traceHour = WINDOW_START_HOUR + i;
    const supplyPct = trace.total[traceHour] ?? 0;
    return { traceHour, supplyPct, deficitPct: Math.max(0, DEMAND_PCT - supplyPct) };
  });
}

/** Run the store against the window. Deterministic: same spec, same result. */
export function simulateStorage(spec: StorageSpec): StorageRun {
  const profile = windowProfile();
  const rows: HourRow[] = [];
  let remaining = spec.energyPctH;
  let firstShortfallHour: number | null = null;
  let unserved = 0;
  let emptied = false;
  let hitPowerCeiling = false;

  profile.forEach((p, hour) => {
    // Discharge is capped three ways: the rate the store can deliver, the
    // energy it has left, and the deficit actually needing cover.
    const wanted = p.deficitPct;
    const byPower = Math.min(wanted, spec.powerPct);
    const discharge = Math.min(byPower, remaining);
    if (wanted > spec.powerPct) hitPowerCeiling = true;
    if (discharge < byPower) emptied = true;
    remaining = Math.max(0, remaining - discharge);
    const shortfall = Math.max(0, wanted - discharge);
    if (shortfall > 0.001) {
      unserved += shortfall;
      if (firstShortfallHour === null) firstShortfallHour = hour;
    }
    rows.push({
      hour,
      traceHour: p.traceHour,
      supplyPct: p.supplyPct,
      deficitPct: p.deficitPct,
      dischargePct: discharge,
      remainingPctH: remaining,
      shortfallPct: shortfall,
    });
  });

  return {
    rows,
    firstShortfallHour,
    survivedHours: firstShortfallHour ?? WINDOW_HOURS,
    unservedPctH: unserved,
    peakDeficitPct: Math.max(...profile.map((p) => p.deficitPct)),
    requiredPctH: profile.reduce((sum, p) => sum + p.deficitPct, 0),
    powerLimited: hitPowerCeiling,
    energyLimited: emptied,
  };
}
