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
