---
title: A Forecast Is Only Useful While You Can Still Act
description: "Forecast skill set against the lead time each available action needs."
week: 10
date: 2026-09-28
property: lead-time
stance: complicates
claim: Forecast accuracy has no operational value beyond the point where the system can no longer respond.
how: Three forecasts of the same event, at seven days, twenty-four hours and two hours.
activity: Match each action's lead time against each forecast's skill.
spec:
  - you can list the actions your system can take, and how long each needs
  - you can describe your allocation ordering from week 9
related:
  - assessments/a3-the-72-hour-dispatch
---

A forecast that is accurate and late is not information; it is commentary. What
makes prediction operationally valuable is not its skill but the overlap
between its skill and the time your system needs to act.

## How this complicates the thesis

Weeks 1 to 9 treat the event as something to be defined and survived. Week 10
adds that it must also be *seen coming*, early enough for the response to
matter — and that an action is worth nothing if the forecast arrives after its
lead time has expired. Better forecasting does not automatically produce a
better outcome, and a design defended on forecast quality alone is undefended.

## In the session

Three forecasts of the same event, issued at seven days, twenty-four hours and
two hours. You match each available action — securing fuel, deferring
maintenance, pre-charging storage, calling demand response, shedding load —
against the forecast that arrives in time to authorise it.

## Its relationship to the canonical event

Lead time has no meaning on its own — it is a measurement from a forecast to a
moment, and the moment has to be specified. [The event](/the-event/) is what
supplies it: onset is the hour the definition's threshold is first crossed for
long enough to qualify, so every action in this week's exercise is timed
against a point the course has already published rather than against a vague
sense of deteriorating weather.

This is also why the definition's span parameter reaches into operations rather
than staying in the modelling. An event defined by a longer span declares its
onset later, which shortens every lead time in the system at once and can move
an action from available to unavailable without anything changing in the
weather.

## What next week needs

Everything so far has been about acting before and during the event. Afterwards
somebody writes it up, and [week 11](/sessions/week-11/) is about what that
account leaves out.
