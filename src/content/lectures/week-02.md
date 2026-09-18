---
title: Drawing the Line
description:
  The second lecture — how an operative definition is built, and how each of
  its parameters changes what counts as an event.
week: 2
date: 2026-08-03
related:
  - sessions/week-02
  - assessments/a1-define-the-drought
---

Two analysts are given the same fourteen days of generation data and asked how
many droughts it contains. One answers one. The other answers none. Neither has
made an arithmetic error, and there is no experiment that settles it between
them. This lecture is about why, and about what you owe a reader once you
understand why.

## A definition is a test, not a description

"Dunkelflaute" names a thing in the world loosely enough to be useless in a
specification. To count events you need a test a machine can apply, and the
course's test has four moving parts:

- a **threshold** — the output level below which an hour counts as low
- a **minimum span** — how many consecutive qualifying hours make an event
- a **recovery allowance** — how long output may rise above the threshold
  before the event is considered over rather than interrupted
- a **source mix** — whether you are counting wind, solar, or the two combined

Each of those is a number or a choice someone wrote down. None of them is
measured. The weather does not supply a threshold; the threshold is where you
decide the system stops coping, which is a statement about the system and its
demand, not about the sky.

## The parameters are not independent, and they are not equal

Here the course's own classifier is the evidence. Run it against the synthetic
trace, changing one parameter at a time from the canonical definition — a 12%
threshold and a 48-hour minimum span, both boundaries this course chose.

Move the **threshold**: at 10% the reference event is still 61 hours long; at
14% it is 62 hours. The count of qualifying events stays at one. Moving the
threshold a fifth of its value barely perturbs the answer.

Move the **minimum span**: at 48 hours the trace contains one event. At 72
hours it contains **none** — the same weather, unchanged, now containing no
drought at all. Seven low periods are rejected instead of six, and the event
that the entire rest of this course is designed around ceases to exist as a
matter of definition.

That asymmetry is the lecture's central result. The two parameters feel
equivalent when you write them down, and they are not remotely equivalent in
consequence. One is a dial with a shallow gradient; the other is a cliff. You
cannot know which is which by inspecting the definition. You have to run it.

## Why the dial exists

This is the reasoning the [definition dial](/sessions/week-02/) is built to make
inspectable. It is not a visualisation of the definition; it is an argument that
the definition chooses the answer. Move the span past the length of the longest
trough and the verdict flips from "one period qualifies" to "no period in this
fortnight qualifies under this definition" — and the sentence the instrument
prints in that state is the one to sit with: *the weather did not change; the
definition did.*

## False precision is the failure mode, not vagueness

The tempting misreading of all this is relativism: if the definition is a
choice, any definition is as good as any other, so the honest move is to stay
vague. That is the opposite of the lesson.

A vague definition cannot be tested, cannot be argued with, and cannot be
wrong — which is why it is worthless. The course fixes one definition at
[the event](/the-event/) precisely so that it can be attacked. What a definition
owes you is not correctness but **declaration**: the thresholds stated, the
span stated, the recovery rule stated, so that someone who disagrees knows
exactly which of your choices they are disagreeing with.

The dishonest version is not the vague definition. It is the confidently
specific one whose parameters are presented as though they were discovered.
A threshold quoted to a decimal place, with no statement of what would have
happened at a different threshold, is a boundary choice wearing the costume of
a measurement.

## What this changes about your first assessment

[Define the Drought](/assessments/a1-define-the-drought/) does not ask you to
find the correct definition, because there is not one. It asks you to move the
course's definition and defend the move — and after this lecture, "defend" has
a specific meaning. It means stating which parameter you changed, showing what
the change did to the count of qualifying events in the trace, and saying which
of your parameters the answer is most sensitive to.

A submission that shifts the threshold and reports a different number of events
has done arithmetic. A submission that shifts the threshold, shows the answer
barely moved, then shifts the span and shows the event vanish, has done the
week. Everything after A1 inherits whichever definition you land on, so choose
it knowing where its cliffs are.
