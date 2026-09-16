---
title: The Weather Does Not Fail Independently
description: "Correlated output, and why independent-generator arithmetic overstates a fleet's reliability."
week: 3
date: 2026-08-10
property: correlation
stance: advances
claim: Treating renewable generators as independent sources overstates reliability.
how: Twenty turbines, one weather system.
activity: Compare independently simulated turbines against correlated regional output.
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

## In the session

We simulate twenty turbines twice: once as independent draws, once driven by a
shared weather signal. The independent fleet almost never goes quiet together.
The correlated fleet does, on schedule.

## What next week needs

Correlation raises an obvious defence: spread out further. Whether that works
depends on how large the weather is compared with the grid, which is
[week 4](/sessions/week-04/).
