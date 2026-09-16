# Figures

One record per technical figure that reaches a reader. `spec/figures.test.ts`
reads this directory.

Three classes, because these are three different kinds of claim:

- `measured` — a real-world figure. Requires `source`, `retrieved`, and
  `verified: true`. `verified: false` is a hard failure, not a warning.
- `course-defined` — a boundary this course chose. Requires `rationale`, and
  must NOT carry a source: there is nothing to cite, someone decided.
- `synthetic` — a property of the generated teaching trace. Requires
  `derived_from: "trace"`, and is **recomputed from src/lib/trace.ts at build
  time**. If the generator is retuned and the prose still says 61 hours, the
  build breaks.

A synthetic figure may declare `recompute_exempt: true` only with a written
`recompute_exempt_reason`. The exemption lives in the record, never in the
checker.

The three classes map one-to-one onto the `ProvenanceTag` badges readers see, so
the check and the visible UI are the same system.
