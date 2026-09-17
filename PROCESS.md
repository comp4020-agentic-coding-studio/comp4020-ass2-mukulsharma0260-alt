# Process overview

SLOP6246 *Dunkelflaute: Designing for the Week the Weather Stops* — a
twelve-week postgraduate course built around one failure condition.

## How I got here

The main thing I took from Assignment 1 was that having the right concept in
the code is not enough. My M/M/1 queue worked, but the interaction was still
quite generic. I realised I had treated the restaurant mostly as a setting
around the model rather than something that should change how the interaction
itself worked.

For this assignment I wanted the opposite. I narrowed the course from
renewable energy generally to one specific failure condition: Dunkelflaute.
If that idea was removed, the weeks, assessments and interactions should stop
making sense rather than just needing different labels.

I set up the rules before generating most of the course. [`506f058`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-mukulsharma0260-alt/commit/506f058) added the
harness and design contract, and [`c243652`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-mukulsharma0260-alt/commit/c243652) turned some of those decisions into
tests while the starter content was still failing them. I automated the things
that were objective: assessment weights, week numbering, placeholder content
and structural requirements. I did not try to automate questions like whether
a week was actually interesting or whether I would want to take the course
myself. Those still needed a human read.

The Event page came first at
[`22aaea1`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-mukulsharma0260-alt/commit/22aaea1):
every later page depends on it. A source gave about 14 GW as peak demand; a
draft used it as installed renewable capacity. That would have meant asking
students to be precise about their assumptions while being careless with mine.
The 4.1% minimum went the same way: the generator produced about 0.9%, so the
page derives it from the trace
([`91ba7ca`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-mukulsharma0260-alt/commit/91ba7ca)).
Every number on the site is therefore either a boundary the course chose or an
output of one labelled synthetic trace.

One block is exempt from that rule by name. The university's own quality
metrics carry no provenance label, because the omission is the argument
rather than an oversight.

The three instruments at
[`28086c7`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-mukulsharma0260-alt/commit/28086c7)
ask more than whether an interaction works: whether it could be dropped
unchanged into another course. The Dispatch Console shows a run can become
unrecoverable before the visible shortfall.

## What I got wrong

I also made some bad calls during the visual pass. I initially reported three
hero problems: it went almost black after a cycle, the gradient looked broken,
and the size was wrong. Once the agent measured it properly, two of those
reports were simply false. The gradient was present — measured at 11,10,7 near
the top and 142,106,31 at eighty percent height — and the animation completed
two clean loops with no black frame. Only the sizing problem was real: a
resize listener was not firing, and replacing it with a `ResizeObserver` fixed
it.

A worse mistake was assuming that because deployed SHA [`a8b4732`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-mukulsharma0260-alt/commit/a8b4732) matched local
HEAD, I was testing the same thing. Four hero files were still uncommitted, so
three reports were true on localhost and false on the live site. After that I
added a rule to `CLAUDE.md` to state local HEAD against the deployed SHA
before measuring anything.

I also tried to revert `PageLayout` with `git checkout`, but restored it from
the commit that had introduced the change. A duplicate font link went live
even though I thought that step had been skipped. `check:chrome` caught what
my description had missed.

If I did this again, I would deploy on day one and include a
local-versus-deployed check in the harness from the start. I left 20% of the
assignment sitting at zero while I polished a local site nobody else could
verify.

Baseline: [`a48ce1f`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-mukulsharma0260-alt/commit/a48ce1f).
