# Decisions

Appended at the moment a decision was made, not reconstructed afterwards. An
entry earns its place when a check rejected something and the content changed
rather than the check, when an instruction was declined because it contradicted
an earlier decision, when a bug that rendered with no error was made impossible,
or when a conflict with the fixed starter layer had to be routed around.

"How I knew" is never "the checks passed" — it is the read, run or comparison
done before accepting the change.

## 2026-09-16 — Refused absolute GW on the dispatch console
Commit: 28086c7
Obvious option: Port the reference implementation's `cap: 8` and the brief's "firm baseload 7.2 GW" straight into the component.
Why not that: Both are invented absolute capacities with no source. A course whose thesis is that unsourced precision is an integrity failure cannot print a fabricated baseload on its flagship instrument, and an earlier phase had already cut a ~14 GW figure for being a peak-demand number reused as installed capacity.
How I knew the result was right: Swept the model across nine decision combinations in normalised units and read the outcomes: reserve@0+shed@0+full survives with 0 unserved, reserve@24 loses 633 %·h, and the losable-but-not-lost property the GW figure was supposed to buy holds without it.

## 2026-09-16 — Level derived from the code instead of concatenated
Commit: f804f39
Obvious option: Change the template string from `{courseMeta.level}00` to `{courseMeta.level}000`.
Why not that: That still leaves the page holding a copy of a number the code already determines, so the next edit can desynchronise it again. The bug was not the digit, it was that a page was allowed to compute the level at all.
How I knew the result was right: Imported course-config.ts in node and asserted `courseLevelLabel === String(Number(code.at(4)) * 1000)` — true, printing 6000 for SLOP6246 — so the label cannot disagree with the code by construction rather than by review.

## 2026-09-16 — Heading anchor glyph suppressed from our own layer
Commit: 24154ef
Obvious option: Remove or reconfigure the rehype autolink plugin so it stops emitting the "#" text node.
Why not that: That plugin is registered inside astro.config.ts, which README:14-18 fixes as part of the build pipeline. Editing it to fix a cosmetic glyph would trade a visible bug for a boundary violation.
How I knew the result was right: Read the served markup for the anchor before touching anything — it already carried aria-hidden="true" and tabindex="-1", so the glyph was decoration to assistive technology and hiding it removes nothing; confirmed the href and element survive in the built output so section links still resolve.
