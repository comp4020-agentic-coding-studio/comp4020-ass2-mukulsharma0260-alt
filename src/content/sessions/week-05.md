---
title: Below Cut-In
description: "Power curves, cut-in speed, and what a fleet does when the wind is merely weak."
week: 5
date: 2026-08-24
property: depth
stance: advances
claim: In weak wind a fleet is not producing less; parts of it are absent from supply.
how: The event floor sits at 0.9% of capacity; the threshold sits at 12%.
activity: Derive why the course's threshold is a threshold rather than a proportion.
spec:
  - you can describe a threshold response in words, without a formula
  - you have a portfolio sketch from week 4 to test
related:
  - assessments/a2-site-against-failure
---

There is a wind speed below which a turbine produces nothing at all, and it is
not zero wind. Below that point the machine is not underperforming — it is not
participating. The course carries no turbine specification and quotes no cut-in
speed, because it has no source for one; what matters here is the *shape* of
the response, not its calibration.

## How this advances the thesis

It explains the depth of the trough rather than its length. A drought is not a
linear dimming of supply proportional to the weather; it is a threshold effect,
and thresholds are what turn a mild meteorological anomaly into an operational
event. This is the week the shape of the event stops being arbitrary.

## In the session

We work in the course's own unit — percentage of combined installed wind and
solar capacity — because that is the unit the definition is written in, and the
conversion to wind speed would require a power curve this course does not have.

Take two numbers from the trace and the definition. Inside the reference event
the combined output floor is **0.9%** of capacity, a property of the synthetic
trace. The course's threshold is **12%**, a boundary this course chose. The
threshold sits roughly thirteen times above the floor.

Now derive the consequence. If supply fell proportionally with the weather, an
event would approach the threshold gradually and spend most of its hours near
it — and a threshold would be a bad instrument, because small errors in where
you put it would change the answer a lot. Instead the trace collapses to under
one per cent and stays there. The threshold is nowhere near the action.

That is why week 2 found what it found: moving the threshold from 12% to 10% or
14% barely changed the event, while moving the span destroyed it. A fleet whose
machines stop rather than dim produces a deep, flat floor, and a boundary drawn
anywhere in the empty space above that floor gives the same answer. Bring the
calculation and the sentence that follows from it: what the response curve has
to look like for a threshold definition to be robust.

## Its relationship to the canonical event

This is the week that justifies the *form* of [the event](/the-event/). The
definition names an output level rather than a weather condition, and it treats
that level as a cliff rather than a slope. Both of those choices are only
defensible if the underlying fleet behaves as a population of machines that
switch off, which is what this week establishes. Week 2 chose where to put the
line; week 5 is why a line is the right instrument.

## What next week needs

If wind can be absent, the natural hope is that solar covers it. Whether that
hope survives winter is [week 6](/sessions/week-06/).
