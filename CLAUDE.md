# Harness — SLOP6246 Dunkelflaute

Operational rules for agents working in this repo. Terse on purpose. When a rule
says **stop**, stop and surface the problem instead of choosing for me.

## 0. Authority

1. `README.md` is authoritative on the fixed Slop University platform layer.
2. This file is authoritative on the course layer built on top of it.
3. `DESIGN.md` is authoritative on visual and interaction constraints.

If `README.md` conflicts with an instruction from me, or with a rule here:
**stop, quote both sides, and ask.** Do not resolve a platform conflict silently.

## 1. Starter contract

- Preserve as they arrived: the Slop identity (`slopBranding`, `brandCss`), the
  four collection keys (`sessions`, `assessments`, `lectures`, `people`), the
  generated course API contract, the `astro.config.ts` build pipeline, and the
  base-path machinery in `scripts/pages-base.ts`.
- **Never hardcode the Pages base path.** It is derived. In `.astro`, link with
  `withBase()` from `astro-theme-university/url`; in markdown, write ordinary
  root-relative links and let the build rewrite them.
- Never hand-edit generated JSON under `dist/`.
- Adding is allowed: new collections, new pages, new components.
- **Do not modify fixed infrastructure to make a check easier to pass.** If a
  check fails, the content or the code is wrong, not the check.

## 2. Course identity

- Code is **`SLOP6246`**. The final three digits **`246`** were allocated to this
  repo and must never change. `level` must remain **`6`**, matching the leading
  digit. Changing one without the other fails validation at config load.
- The subject is **Dunkelflaute — a renewable-energy drought**: the sustained
  low-wind/low-solar event.
- The thesis every page serves: *a renewable electricity system must not be
  judged on average generation. A defensible design names the low-generation
  event it is built to survive, shows how it survives it, and states the event
  that would still defeat it.*
- Wind, solar, storage, transmission, forecasting, dispatch, backup generation
  and demand response appear **only** as they help define, predict, survive or
  allocate a drought. They are not topics in their own right.
- **Stop** if asked to add material that turns this into a general renewable
  energy survey.

## 3. Curriculum coherence

Every teaching week must carry all three, stated on the page:

1. one distinguishable property or problem specific to that week;
2. a clear stance or question, not a topic label;
3. an explicit sentence on how it **advances, complicates or challenges** the
   central thesis.

A week is **not** acceptable merely because its technology is relevant to
renewable energy. "Week 5: Batteries" is a failure. "Week 5: storage that is
sized for a day cannot answer a week" is the shape.

If a proposed week cannot state its third element, reject the week.

## 4. Event canon

- The course's canonical drought definition lives at **one** page: `/the-event/`.
- Learner-facing prose that needs the definition **links** to it, base-path-safe
  (`withBase("/the-event/")` in `.astro`, plain `/the-event/` in markdown).
- **Never restate a competing definition** of the event on another page. Refer,
  don't redefine. Thresholds, duration and geography are defined once.
- Do not ship a link to `/the-event/` before that route exists — the build's link
  checker will fail, and correctly.

## 5. Assessment ladder

A dependency chain, not four separate tasks:

| ID | Title | Weight | Must build on |
|----|-------|--------|---------------|
| A1 | Define the Drought | 15% | — |
| A2 | Site Against Failure | 20% | A1's defined event |
| A3 | The 72-Hour Dispatch | 25% | the defined event + portfolio thinking |
| A4 | Design for the Worst Week | 40% | A1–A3, integrated |

- Total weight is **exactly 100%**. Any weighted `marking:` block must also sum
  to exactly 100 or the content schema rejects it.
- A4 must **explicitly state the system's failure boundary** — the event that
  still defeats the design. A4 without a stated failure boundary is incomplete.
- Each brief must name its dependency on the prior work in its own prose.

## 6. Factual and numeric honesty

Hard rules. These matter more than fluency.

- **Never invent** a source, dataset, report, institution, person, or citation.
- **Never present a synthetic value as an observed real-world value.**
- Any empirical or technical number — energy, weather, duration, capacity,
  power, cost, reliability, system behaviour — must either:
  - **(a)** resolve to an explicit local structured source record carrying
    source and provenance, or
  - **(b)** be **clearly labelled synthetic or illustrative** at the point of use.
- No number gets to be ambiguous about which of (a) or (b) it is.
- **Exempt:** course metadata — week numbers, dates, marks, assessment
  percentages, UI labels.
- If evidence is unavailable, **write qualitatively.** Fabricated precision is
  worse than an honest shape. "A multi-day lull" beats an invented "63 hours".
- **Stop** rather than guess a figure to fill a sentence.

## 7. Media

- **No GIFs.**
- **No hotlinking** of learner-facing course artwork. Course images are local.
- Meaningful alt text wherever an image carries meaning; empty alt only for
  genuinely decorative images. A `photo:` in the `people` collection requires
  `photoAlt` or the schema rejects it.
- Externally sourced media must preserve **credit, licence and source URL**.
- **Banned aesthetic:** leaves, globes, green hands, sunsets, wind turbines in
  wildflowers, stock "clean future" imagery.
- The register is an **electricity-system control room / operational evidence
  board** — not environmental charity branding. See `DESIGN.md`.

## 8. Interaction

- An interaction must make a **course claim inspectable**. Decoration is not a
  reason to ship a control.
- A control must change something meaningful **and expose the consequence** of
  the change.
- Banned: fake buttons, `href="#"`, decorative sliders, toggles whose output
  does not affect the argument, charts that ignore their own inputs.
- If you cannot say which claim a control tests, remove the control.

## 9. Routing and links

- Preserve `trailingSlash: "always"`. Every internal route ends in `/`.
- `.astro` links go through `withBase()`. **Never** write a root-absolute
  `href="/sessions/"` in `.astro` — it works on localhost and 404s on Pages.
- The collection key is the whole address: file, URL, API path and ref must
  agree. Renaming one means renaming all of them.
- Every `related:` ref must resolve — the build fails on a dangling ref.
- Every deck link must resolve to a real deck under `src/decks/`.

## 10. Accessibility and viewports

The deployed site must be usable in current Chrome at **1920×1080** and
**390×844**. Both count fully.

- No horizontal overflow at 390px. Wide content (tables, charts, code) scrolls
  inside its own container; the page body never scrolls sideways.
- No clipped controls, no unreadable charts, no slides that only work at desktop
  width. Check decks at both viewports — nothing automated checks slide fit.
- Mobile is a design target, not a shrunken desktop.
- Respect `prefers-reduced-motion`.
- The build runs axe over every page, including decks. Keep it clean.

## 11. Checks

After any meaningful implementation change, run:

```sh
pnpm check           # typecheck + build + spec tests
pnpm check:evidence  # submission gate
```

- **Never weaken, delete, bypass or silently relax a failing check to get
  green.** That includes loosening a schema, deleting an assertion, and removing
  a `STARTER_CONTENT` marker without replacing the content it marks.
- If a check is intentionally red mid-migration, say so explicitly: which check,
  which gate, why, and what will clear it.
- Report failures with the actual output. Never describe a check as passing
  without having run it.

## 12. Process integrity

- `PROCESS.md` is **my** reflective account. Do not write my decisions for me.
- **Never invent** decisions, prompts, failures, tests, or outcomes for it.
- You may later verify word count, link validity, commit hashes and factual
  consistency against the repo — that is checking, not authoring.
- Preserve useful intermediate commits. Do not collapse the assignment into one
  final commit, and do not amend or rebase away history that shows the work.
- Cited commit hashes must resolve in this repo.

## 13. Working agreement

How to work with me, as distinct from what to build.

- **One item per turn.** Stop and report. Never run ahead into the next item.
- **Report in 150 words or fewer:** what changed, commits, check status, what's
  next. No tables. No "three weakest things" unless asked. Never restate my own
  brief back to me.
- **No narration between tool calls.** Run the commands, explain once at the end.
- **Do not re-read a file already read this session.**
- **Run `pnpm check` once per item, at the end** — not after every commit.
- **Never re-derive context already held.**
- **Cite only SHAs actually read.** Never predict one. A predicted SHA has
  already been wrong once in this repo (`bf47932`).
