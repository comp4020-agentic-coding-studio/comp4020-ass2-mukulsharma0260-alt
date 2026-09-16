---
title: The 72-Hour Dispatch
description:
  The third rung — run the system hour by hour through the event, spend the
  storage, start the reserve, shed what you must, and record the cost.
week: 11
due: 2026-10-09T17:00:00+10:00
weight: 25
stage: 3
coversWeeks: Weeks 7–10
takesInput: a portfolio with a correlation profile
produces: a dispatch log and a counterfactual
marking:
  mode: weighted
  criteria:
    - name: Quality of the hour-by-hour decisions
      weight: 40
    - name: The counterfactual, and what it isolates
      weight: 35
    - name: Honesty of the log about what was sacrificed
      weight: 25
spec:
  - every dispatch decision is recorded with the information available at that hour
  - your counterfactual changes exactly one thing, and you say what it shows
  - the log states what was shed, when, and to whom
related:
  - a4-design-for-the-worst-week
---

## What you are producing

Two things. A dispatch log — what you did in each hour of the event and why —
and a counterfactual: the same event run again with one decision changed.

## What earlier work this uses

The portfolio from A2, and your A1 definition to bound the event. You are
operating your own design, which is the point. A design nobody has operated is
an assertion.

## How the canonical definition constrains this

Duration is the constraint that bites. Storage sized in megawatts answers a
different question from storage sized in megawatt-hours, and a multi-day event
is where confusing the two becomes expensive — that is
[week 7](/sessions/week-07/). The recovery allowance matters here too: a brief
return above the threshold is not a reset, and dispatching as though it were is
a decision your log has to own.

## What this feeds

[Design for the Worst Week](/assessments/a4-design-for-the-worst-week/) is where
the dispatch log becomes evidence. Your final system has to answer what the
dispatch exposed.

## What counts as a defensible answer

A log that shows judgement under the information actually available at that
hour, and a counterfactual that isolates one variable cleanly. Losing the event
and understanding exactly where it was lost scores better than claiming a
survival the log does not support.
