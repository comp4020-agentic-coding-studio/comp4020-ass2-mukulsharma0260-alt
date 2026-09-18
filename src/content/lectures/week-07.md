---
title: Power, Energy, and the Week That Tells Them Apart
description:
  The week 7 lecture — why "how much storage do we need" is two questions,
  and why a multi-day event is what forces the distinction into the open.
week: 7
date: 2026-09-07
slides: /decks/week-07/
related:
  - sessions/week-07
  - assessments/a3-the-72-hour-dispatch
---

A procurement question arrives on your desk: *we have budget for more storage,
how much should we buy?* You cannot answer it. Not because the budget is
unclear, but because "more storage" is two different purchases with two
different units, and the one that fixes a daily peak is not the one that
survives a drought. This lecture separates them, then puts a specification
against the reference event and shows which of the two was ever binding.

## Two numbers, two units, two questions

A store is specified by at least two independent quantities:

- **Power** — how fast it can deliver. Answers: *can I cover the shortfall in
  this hour?*
- **Energy** — how much it holds. Answers: *can I keep covering it?*

Their ratio is **duration**: energy divided by power, measured in hours. That
ratio is the number a drought interrogates, and it is the one a power rating
alone never states.

Because this course refuses to invent a system size, the scenario modules work
in normalised units: output and demand as a percentage of combined installed
wind and solar capacity, and stored energy in capacity-percent-hours, `%·h`.
The arithmetic below is therefore internally consistent without claiming a
megawatt figure anywhere. Every value in it is a synthetic teaching parameter
declared in one module.

## The worked case

The course's dispatch scenario holds demand flat at 40% of capacity across a
72-hour window placed around the reference event. Against the synthetic trace,
the deepest hour of that window leaves a deficit of **39.1%** of capacity —
demand minus whatever wind and solar are still delivering.

The store is specified at **40%** power and **1050 %·h** of energy.

Take the power question first. Peak deficit 39.1%, rated power 40%. The store
can cover the worst single hour in the window with capacity to spare. On a
power basis this system is adequate, and a report that stopped here would say
so.

Now take the energy question. Summed across all 72 hours, the window's total
deficit is about **2386 %·h**. The store holds 1050. It covers roughly **44%**
of the energy the window demands of it, leaving about **1336 %·h** unserved by
storage. Its duration at a continuous full-rate discharge is 1050 ÷ 40 ≈ **26
hours**; in this window, where the deficit is not always at its peak, it runs
empty at hour 33 of 72.

Same asset. Same two numbers. Adequate on one and short by more than half on
the other.

## Why buying power changes nothing

Sweep the power rating across this window and the energy left unserved does not
move. At 40% it is 1336 %·h. At 60% it is 1336 %·h. At 120% — three times the
peak deficit — it is still 1336 %·h. The number is invariant, and not
approximately.

It has to be. The store already covers every hour's deficit on a power basis,
so a higher rating is never called upon; and the total it can deliver was fixed
by its energy, not its rating. Raising power buys a capability the window never
asks for.

Drop the rating instead, to 30%, and the invariance is more instructive still:
the unserved energy is *again* 1336 %·h. What changes is the distribution — the
first shortfall arrives at hour 6 instead of hour 33, and 66 hours fall short
instead of 39. Power determines **when** you fail and how the failure is spread.
It does not determine **how much** you fail by.

That is the result of the week, and it generalises: **capacity added along a
non-binding axis buys nothing.** It is not a quirk of these parameters. It
follows from the store being energy-limited across the interval, which is what
"multi-day" means.

The levers that do move the outcome are energy, the state of charge the event
was entered with, and round-trip efficiency at the margin. The second of those
is worth noticing: starting fuller costs nothing if you saw the event coming,
which makes it a forecasting and institutional problem rather than a capital
one — and that is [week 10](/sessions/week-10/)'s subject, not this one.

## Where the daily-cycling instinct comes from

The instinct that storage answers a drought is not stupid. It is a correct
instinct, transferred from a problem where it works.

A battery sized for a daily peak is solving a problem a daily cycle poses: a
few hours of high demand, every day, recharged overnight. For that shape, power
is very often the binding constraint and duration of a few hours is ample. The
asset is not misconceived; it is correct for the problem it was specified
against.

A drought has a different shape, and the shape changes which specification
number matters. The word "storage" covers both, the unit MW is quoted for both,
and the adequacy does not transfer between them. The [storage sizer](/sessions/week-07/)
exists so you can move power and energy independently against this fixed
deficit and watch which one the outcome responds to.

## What this changes about the dispatch assessment

In [The 72-Hour Dispatch](/assessments/a3-the-72-hour-dispatch/) you spend this
same finite store across this same window, and the arithmetic above is the
reason the assessment is hard. A store holding 44% of the window's energy
cannot be spent well by accident. Every hour you discharge early is an hour
unavailable at hour 60, and there is no ordering that avoids the trade — only
orderings that choose where to pay.

The deck for this week, [the week 7 deck](/decks/week-07/), makes the units
argument with a deliberately absurd illustrative pairing before this lecture
brings the normalised model to the event. Bring to the studio a specification
you can defend in both units, and the sentence that goes with it: not how many
megawatts, but for how long.
