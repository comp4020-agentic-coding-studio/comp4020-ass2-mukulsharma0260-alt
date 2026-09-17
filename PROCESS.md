# Process overview

SLOP6246 *Dunkelflaute: Designing for the Week the Weather Stops* — a
twelve-week postgraduate course site built around one failure condition.

## How I got here

The feedback on Assignment 1 was that my central concept — an M/M/1 queue —
had not shaped the interaction strongly enough. The queue was present, but the
site would have survived having it swapped out. That criticism set the whole
approach here: pick one condition and let it structure everything, so that
removing it would collapse the course rather than inconvenience it.

My first instinct was a renewable-energy course. I narrowed it to Dunkelflaute
because the broad version could only become a technology survey — a block on
wind, a block on storage — and a survey has no argument to sustain. Committing
to the drought gave me a thesis to argue rather than a field to cover.

I wrote the rules before generating the course. [`506f058`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-mukulsharma0260-alt/commit/506f058)
establishes the harness and design contract, and
[`c243652`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-mukulsharma0260-alt/commit/c243652) encodes the course's structural promises as
tests — twelve weeks, four assessments totalling 100%, one canonical event
route — deliberately red against the untouched starter so the contract existed
before the content did. What I chose to automate was anything a machine can
check without judgement: the assessment weights, the week numbering, whether
starter placeholder text still reaches a reader. What I kept for myself was
everything a green test would have flattered me about. A test can enforce that
twelve weeks carry twelve distinct properties; it cannot tell me whether week 8
is interesting, or whether a prospective student would want to enrol.

The canonical definition at [`22aaea1`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-mukulsharma0260-alt/commit/22aaea1) came first among
content, because reliability claims are empty until the event has a threshold,
a span and a recovery rule. Three times I rejected agent output against it, on
evidence rather than style. The supplied material gave a ~14 GW *peak demand*
figure and the draft had quietly reused it as installed renewable capacity; a
different quantity, so it was cut. A stated 4.1% minimum survived until I read
the seeded generator and found it produced 0.9%, so the page now derives its
synthetic values from the trace rather than transcribing them
([`91ba7ca`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-mukulsharma0260-alt/commit/91ba7ca)). And I deleted the starter teaching staff
rather than write biographies for people who do not exist.

The rule that came out of those three: every number is either a boundary the
course chose or an output of one labelled synthetic trace. The one exemption is
named in the check rather than hidden from it: the university's own quality
snapshot is allowed through unlabelled, because a site that demands provenance
of every course figure while the institution above it reports a bare
satisfaction average is making its argument by the omission, and a check that
"fixed" it would delete the point.

The three instruments in [`28086c7`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-mukulsharma0260-alt/commit/28086c7) each carry a claim
rather than decorating a page. The dial shows that moving the definition moves
the answer; the sizer separates power from energy; the console derives the hour
a run becomes unrecoverable, which is usually earlier than the hour it visibly
fails. I rejected the reference implementation's invented absolute capacities
and worked in normalised units. I also caught my own error there: the first
feasibility calculation treated a reserve decision still in the future as
already sunk, which reported failure at hour 0. Corrected, and with the presets
retuned since, the console's default run reports the plan unrecoverable at hour
21 against a first shortfall at hour 38 — seventeen hours in which nothing has
visibly failed yet.




## What I got wrong, and what I changed

I was wrong about the hero. I reported three problems: it went almost black
after one cycle, the gradient was broken, and the size was wrong. When the
agent measured it properly, two of those claims fell apart. The gradient was
there — measured at 11,10,7 near the top and 142,106,31 at eighty percent
height — and the animation completed two clean loops with no black frame. The
only real defect was sizing: the resize listener never fired. Replacing it with
a ResizeObserver fixed that. It reminded me that seeing something once is not
the same as proving it.

The more uncomfortable mistake was reporting the wrong environment with
confidence. The deployed SHA, [`a8b4732`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-mukulsharma0260-alt/commit/a8b4732), matched my local HEAD, so I assumed
localhost and the live site were equivalent. They were not: four hero files
were still uncommitted. Three reports in a row were true locally and false
live. I added a rule to `CLAUDE.md` after that: state local HEAD against
deployed SHA before measuring anything.

One mistake was almost embarrassingly simple. I used `git checkout` to "revert"
`PageLayout`, but the commit I restored from was the commit that introduced the
change. I then reported the step as skipped while a duplicate font link
actually went live. `check:chrome` caught what my description had missed.

If I did this again, I would deploy on day one. I left 20% of the assignment
sitting at zero while I polished a local site nobody else could verify. I would
also put a deployed-versus-local check in the first harness commit, not add it
after three bad reports. Verification should have been part of the workflow
from the start, not a repair after confidence failed.

Baseline: [`a48ce1f`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-mukulsharma0260-alt/commit/a48ce1f).
