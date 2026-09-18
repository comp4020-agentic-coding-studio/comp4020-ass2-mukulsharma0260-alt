---
title: The Weather Does Not Fail Independently
description: "Correlated output, and why independent-generator arithmetic overstates a fleet's reliability."
week: 3
date: 2026-08-10
property: correlation
stance: advances
claim: Treating renewable generators as independent sources overstates reliability.
how: The course trace has no independent version; its wind is one shared signal.
activity: Rebuild week 2's six rejected low periods under independent draws and compare.
spec:
  - you can describe the event you chose to work with, in your own parameters
  - you are willing to be wrong about how much diversification buys
related:
  - assessments/a2-site-against-failure
---

Add enough independent generators and the law of large numbers does your
reliability work for you. Add enough generators into one weather system and it
does nothing at all.

## How this advances the thesis

It supplies the mechanism behind the event. A drought is not many small
unrelated shortfalls happening to coincide; it is one cause expressing itself
across a whole fleet. That is why the event is the right unit of design, and
why fleet-level averages mislead in the same way annual averages do.

Independence is not a conservative assumption here. It is the assumption that
deletes the object of study.

## In the session

We work on the course's own trace rather than a generic fleet, because the
trace makes the mechanism inspectable: its wind term is a shared synoptic
signal applied across the whole fleet, plus per-hour noise. There is no
independent-generator version of it. That is a property of how the data is
generated, and you can read it in the generator.

So you build the missing half yourself. Construct twenty generators as
independent draws with the same marginal distribution, then take the six low
periods that [week 2](/sessions/week-02/)'s definition dial rejects for
duration under the canonical definition, and ask how many of them still appear
once the shared signal is removed.

The count is the exercise; the explanation is the point. Report which of the
six you think survive independence, which do not, and what property of the
generator decides it. We are not looking for a matching number — we are looking
for you to say what correlation is *doing* to the duration of a low period, as
opposed to its depth.

## Its relationship to the canonical event

[The event](/the-event/) is one contiguous sixty-one-hour block rather than
sixty-one scattered bad hours, and correlation is the reason it has that shape.
Remove the shared signal and you do not get a shorter event — you get no event,
because a definition built on consecutive hours has nothing to bite on. The
canonical definition's span parameter is therefore only meaningful in a
correlated fleet: week 3 is what makes week 2's most sensitive parameter mean
anything at all.

## What next week needs

Correlation raises an obvious defence: spread out further. Whether that works
depends on how large the weather is compared with the grid, which is
[week 4](/sessions/week-04/) — and week 4 takes this week's remedy apart rather
than extending it.
