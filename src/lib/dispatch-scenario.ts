// The 72-hour dispatch scenario (Assessment 3).
//
// Claim: a dispatch plan can become unrecoverable before the visible shortfall.
//
// EVERY CONSTANT HERE IS A SYNTHETIC TEACHING PARAMETER, declared in this
// module and nowhere else. No absolute megawatt figure appears: the trace's
// native unit is "% of combined installed wind and solar capacity", and
// demand, storage and reserve are all expressed in that same unit so the
// arithmetic is internally consistent without inventing a system size.
//
// Deterministic by construction — no randomness, no clock, no stored state.
// The same decisions always produce the same run.

import { DEMAND_PCT, WINDOW_HOURS, WINDOW_START_HOUR, windowProfile } from "./storage-scenario.ts";

export { DEMAND_PCT, WINDOW_HOURS, WINDOW_START_HOUR };

/** Storage fleet. SYNTHETIC. */
export const STORAGE_POWER_PCT = 20;
export const STORAGE_ENERGY_PCTH = 700;

/** Reserve plant: firm, but it cannot appear instantly. SYNTHETIC. */
export const RESERVE_POWER_PCT = 26;
export const RESERVE_LEAD_HOURS = 6;

/** Voluntary demand reduction available once called. SYNTHETIC. */
export const SHED_PCT = 6;

export type StoragePolicy = "hold" | "balanced" | "full";

/** The fraction of rated discharge power each policy is willing to use before
 *  the reserve is carrying load. Conserving energy early buys endurance and
 *  costs cover now; that trade-off is the decision the console is about. */
const POLICY_FRACTION: Record<StoragePolicy, number> = {
  hold: 0.3,
  balanced: 0.6,
  full: 1,
};

export interface Decisions {
  /** Hour the reserve is committed. It delivers from this hour plus the lead
   *  time. */
  reserveStartHour: number;
  /** Hour voluntary demand reduction begins, or null for never. */
  shedFromHour: number | null;
  storagePolicy: StoragePolicy;
}

export const DEFAULT_DECISIONS: Decisions = {
  reserveStartHour: 24,
  shedFromHour: null,
  storagePolicy: "balanced",
};

export interface DispatchRow {
  hour: number;
  supplyPct: number;
  demandPct: number;
  deficitPct: number;
  storagePct: number;
  reservePct: number;
  shedPct: number;
  shortfallPct: number;
  socPctH: number;
  reserveOnline: boolean;
}

export interface DispatchRun {
  rows: DispatchRow[];
  /** First hour with unmet demand, or null if the window was survived. */
  shortfallHour: number | null;
  /** Earliest hour from which no remaining play avoids a shortfall, or null.
   *  Derived by testing optimistic play from each hour's state. */
  unrecoverableHour: number | null;
  totalUnservedPctH: number;
  shortfallHours: number;
  survived: boolean;
}

interface State {
  soc: number;
  reserveCommitted: number | null;
  shedFrom: number | null;
}

const profile = windowProfile();

function step(
  hour: number,
  state: State,
  policy: StoragePolicy,
): { row: DispatchRow; next: State } {
  const p = profile[hour]!;
  const shedActive = state.shedFrom !== null && hour >= state.shedFrom;
  const shedPct = shedActive ? Math.min(SHED_PCT, p.deficitPct) : 0;
  const demandPct = DEMAND_PCT - shedPct;
  const deficit = Math.max(0, demandPct - p.supplyPct);

  const reserveOnline =
    state.reserveCommitted !== null && hour >= state.reserveCommitted + RESERVE_LEAD_HOURS;
  const reservePct = reserveOnline ? Math.min(RESERVE_POWER_PCT, deficit) : 0;

  const stillShort = Math.max(0, deficit - reservePct);
  // Before the reserve carries load the policy throttles discharge; once it is
  // online there is no reason to hold back, so the cap lifts.
  const cap = reserveOnline
    ? STORAGE_POWER_PCT
    : STORAGE_POWER_PCT * POLICY_FRACTION[policy];
  const storagePct = Math.min(stillShort, cap, state.soc);

  const shortfallPct = Math.max(0, stillShort - storagePct);

  return {
    row: {
      hour,
      supplyPct: p.supplyPct,
      demandPct,
      deficitPct: deficit,
      storagePct,
      reservePct,
      shedPct,
      shortfallPct,
      socPctH: Math.max(0, state.soc - storagePct),
      reserveOnline,
    },
    next: { ...state, soc: Math.max(0, state.soc - storagePct) },
  };
}

/** Optimistic play from a given hour and state: take every action now that
 *  has not already been taken, and discharge at full power. Only choices
 *  already executed are treated as sunk — a commitment still in the future is
 *  a decision the operator could revise, so best play brings it forward to
 *  now. If even this play shortfalls, the run was already lost when it
 *  entered this hour. This is the feasibility test behind
 *  `unrecoverableHour`. */
function survivesUnderBestPlay(fromHour: number, state: State): boolean {
  // Already committed in the past: sunk, keep it. Otherwise: commit now.
  const committed =
    state.reserveCommitted !== null && state.reserveCommitted <= fromHour
      ? state.reserveCommitted
      : fromHour;
  const shed =
    state.shedFrom !== null && state.shedFrom <= fromHour ? state.shedFrom : fromHour;
  let s: State = { soc: state.soc, reserveCommitted: committed, shedFrom: shed };
  for (let h = fromHour; h < WINDOW_HOURS; h++) {
    const { row, next } = step(h, s, "full");
    if (row.shortfallPct > 0.001) return false;
    s = next;
  }
  return true;
}

export function simulateDispatch(decisions: Decisions): DispatchRun {
  let state: State = {
    soc: STORAGE_ENERGY_PCTH,
    reserveCommitted: decisions.reserveStartHour,
    shedFrom: decisions.shedFromHour,
  };

  const rows: DispatchRow[] = [];
  let shortfallHour: number | null = null;
  let unrecoverableHour: number | null = null;
  let unserved = 0;
  let shortfallHours = 0;

  for (let h = 0; h < WINDOW_HOURS; h++) {
    // Test feasibility from this hour's *incoming* state, before acting.
    if (unrecoverableHour === null && !survivesUnderBestPlay(h, state)) {
      unrecoverableHour = h;
    }
    const { row, next } = step(h, state, decisions.storagePolicy);
    if (row.shortfallPct > 0.001) {
      unserved += row.shortfallPct;
      shortfallHours++;
      if (shortfallHour === null) shortfallHour = h;
    }
    rows.push(row);
    state = next;
  }

  return {
    rows,
    shortfallHour,
    unrecoverableHour,
    totalUnservedPctH: unserved,
    shortfallHours,
    survived: shortfallHour === null,
  };
}

/** The best outcome available from the opening state, used to tell a student
 *  whether the scenario was winnable at all. */
export function scenarioIsWinnable(): boolean {
  return survivesUnderBestPlay(0, {
    soc: STORAGE_ENERGY_PCTH,
    reserveCommitted: null,
    shedFrom: null,
  });
}
