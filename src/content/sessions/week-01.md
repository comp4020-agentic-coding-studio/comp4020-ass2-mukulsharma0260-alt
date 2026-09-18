---
title: The Average Is Lying to You
description: "Two descriptions of one system — an annual share and an hourly trace — and what each is fit for."
week: 1
date: 2026-07-27
property: visibility
stance: advances
claim: Three reporting conventions can each describe one system as healthy while none of them has a term for its worst sixty-one hours.
how: One synthetic system, measured three ways, none of which can see the event.
activity: Compute three reporting conventions on the course trace; find which can see the event.
spec:
  - you can read a time-series chart and say what it hides
  - you arrive with a view on what "reliable" should mean
related:
  - assessments/a1-define-the-drought
---

An annual renewable share is a summary statistic, and summary statistics are
chosen. The choice is made before any data arrives, it fixes what the report is
able to show, and it is almost never presented as a choice at all.

## How this advances the thesis

It establishes that the disagreement between views of one system is not an
accident of averaging — it is a consequence of which question the metric was
built to answer. If every convention told the same story there would be no
course: you would report any one of them and be finished. Week 1's job is to
show that the reporting convention is a design decision with the same standing
as a capacity choice, and that it is usually made by someone who will not be
operating the system.

## In the session

Three conventions, one trace, computed by you.

1. **The annual renewable share** the course reports: 87.4%, a property of the
   generated teaching trace. Try to compute it from the fortnight and you will
   find that you cannot — an annual energy share is not derivable from fourteen
   days, and its provenance record says so in as many words. A number you
   cannot recompute is the first finding, not a footnote.
2. **A capacity factor** across the fortnight: the mean of combined output as
   a share of combined installed capacity. One line of arithmetic from the
   trace. Compute it; the number is unremarkable.
3. **The share of hours at or above the course's 12% threshold.** Also one
   line, and also unremarkable. The threshold is a boundary this course chose,
   not a measurement, and it is stated at [the event](/the-event/).

Bring your own three figures rather than ours — the arithmetic is the exercise.
Then put them side by side and ask which of the three contains any term that
could register sixty-one consecutive hours near zero.

None does. Not because the numbers are wrong — each is correct for what it
measures — but because none of the three has a duration term in it at all.

## Its relationship to the canonical event

[The event](/the-event/) is specified as an output level *held for a span*. That
second half is what none of the week's three conventions can express: a share,
a mean and a proportion-of-hours all discard order, so an event defined by
consecutive hours is invisible to every one of them by construction. The
canonical definition is not a stricter metric than these three. It is a
different kind of object, and week 1 exists so that the difference in kind is
felt before the definition is met.

## What next week needs

You will have three defensible numbers and no way to see the thing the course
is about. The convention was chosen; so is the event.
[Week 2](/sessions/week-02/) builds the definition that can see it, and shows
that its parameters are choices too.
