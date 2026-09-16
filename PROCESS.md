# Process overview

## What I built

SLOP6246 *Dunkelflaute: Designing for the Week the Weather Stops* — a
twelve-week postgraduate course site built around one failure condition: the
period when wind and solar output are simultaneously low for long enough that
normal planning assumptions stop holding.

## How I got here

The feedback on Assignment 1 was that my central concept — an M/M/1 queue —
had not shaped the interaction strongly enough. The queue was present, but the
site would have survived having it swapped out. That criticism set the whole
approach here: pick one condition and let it structure everything, so that
removing it would collapse the course rather than inconvenience it.

My first instinct was a renewable-energy course. I narrowed it to Dunkelflaute
because the broad version could only become a technology survey — a block on
wind, a block on storage — and a survey has no argument to sustain. Committing
to the drought gave me a thesis: a system should not be judged on its averages, and a defensible design names
the event it survives and the event that defeats it.

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
a span and a recovery rule. That page
became the standard I judged agent output against, and the standard is
evidential rather than stylistic. Three times I rejected work for failing it.
The supplied material gave a ~14 GW *peak demand* figure and the draft had
quietly reused it as installed renewable capacity; a different quantity, so it
was cut. A stated 4.1% minimum survived until I read the seeded generator and
found it produced 0.9%, so the page now derives its synthetic values from the
trace rather than transcribing them
([`91ba7ca`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-mukulsharma0260-alt/commit/91ba7ca)). And I deleted the starter teaching staff
rather than write biographies for people who do not exist.

That gave me the test I used from then on: every number is either a boundary
the course chose or an output of one clearly-labelled synthetic trace, and
anything that cannot be one of those gets written qualitatively or not at all.
One trace, one source of truth, no duplicated figures between pages.

The three instruments in [`28086c7`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-mukulsharma0260-alt/commit/28086c7) each carry a claim
rather than decorating a page. The dial shows that moving the definition moves
the answer; the sizer separates power from energy; the console derives the hour
a run becomes unrecoverable, which is usually earlier than the hour it visibly
fails. I rejected the reference implementation's invented absolute capacities
and worked in normalised units. I also caught my own error there: the first
feasibility calculation treated a reserve decision still in the future as
already sunk, which reported failure at hour 0. Corrected, it reports hour 1 —
four hours before the shortfall is visible, which is the lesson.

Baseline: [`a48ce1f`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-mukulsharma0260-alt/commit/a48ce1f).
