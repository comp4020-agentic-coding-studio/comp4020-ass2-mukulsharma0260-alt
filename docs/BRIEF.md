# The working brief

Transcribed from the fix brief given in session, so it does not have to be
re-pasted. Structure and every operative requirement preserved; the original's
repeated framing is condensed. The repo's own `README.md` wins over anything
here.

## What this is marked on

Individual assignment, 20% of the course.

| Criterion | Weight | Evidence |
|---|---|---|
| Legibility of process | 45% | PROCESS.md + CLAUDE.md + commit history |
| Working deployed artefact | 20% | builds, deploys, works at both viewports |
| Response to the brief | 35% | does the course hold together, would someone take it |

A niche course — narrow enough that no real university would run it — as a
complete course website, with ONE idea sustained across twelve weeks. Markers
read it as a prospective student would, for ~10 minutes: home page, a few
NON-ADJACENT weeks, an assessment, the deck, the policies page, at desktop and
phone width.

Fixed spec, all true at submission: deployed and live at its public Pages URL at
both viewports; one course under a `SLOPxxxx` code keeping the three digits the
repo arrived with; twelve dated teaching weeks; at least one lecture carrying a
real deck linked from its page; assessment summing to 100%; own checks in
`spec/` with `pnpm check` and `pnpm check:evidence` passing; PROCESS.md,
CLAUDE.md, and a commit history that grew with the work.

## The course — do not change

- **Code** SLOP6246
- **Title** Dunkelflaute
- **Subtitle** Designing for the week the weather stops
- **Level** 6000, postgraduate coursework, 6 units
- **Position** Average renewable generation is a poor description of
  reliability. A defensible system design names the low-generation event it is
  built to survive, shows how it survives it, and states the event that would
  still defeat it.

## The fixed layer — never touch

Slop University's name, marks, palette, the content collections, the generated
API. Everything the COURSE decides — pages, decks, components, navigation,
artwork, styling, every word of content — is ours.

## Reference material

- `DESIGN.md` — visual system (the repo's own copy wins; see Decisions taken)
- `docs/CONTENT.md` — every word of course copy, already written
- `dunkelflaute-reference.html` — working prototype of the hero animation and
  the four interactive components. Port from it; do not reinvent.

## Part 2 — P0, six visible errors, one commit each

1. Homepage kicker read "LEVEL 600". Fix the SOURCE of the level, not the
   display string.
2. Body rendered "is called aDunkelflaute" — italic marker fused to the article.
3. "The Failure Wall #" — raw heading-anchor glyph. Fix SITE-WIDE.
4. Policies and Failure Wall render frontmatter title AND a body H1. One source
   of truth for page titles.
5. H1 was "SLOP6246: Dunkelflaute: Designing for the Week the Weather Stops" —
   two colons. Split into kicker (`SLOP6246 · SCHOOL OF CONTINUOUS
   IMPROVEMENT`), H1 (`Dunkelflaute`), subtitle. Tag: `Dunkelflaute — SLOP6246`.
6. All five "Five weeks worth arriving for" lines began with "Where". No two may
   share a first word or a grammatical shape.

For each, name the `spec/` check that would have caught it.

## Part 3 — one type system

Four roles as CSS custom properties in ONE file; no component names a family
directly. `--disp` display/headings, `--serif` reading prose, `--mono` anything
measured (always `font-variant-numeric: tabular-nums` where digits align),
`--ui` the Slop University chrome only. The split carries meaning and belongs in
CLAUDE.md: **institution / argument / instrument**. Then `check:fonts`.

## Part 4 — one layout grid

Outer shell max-width 1160px, padding-inline 20px, centred. Reading column
max-width 704px, ~65 characters. Gold vertical rule at the column's left edge at
≥960px only. Spacing from flex/grid gap, not per-element margins. One vertical
rhythm scale in tokens. Repeated elements share identical edges, baselines and
inner padding. Nothing wider than the phone screen. Tables, charts and code get
their own `overflow-x: auto`; the body NEVER scrolls sideways. Fix the
inconsistent card fills on Lectures and Assessments — make the state meaningful
and labelled, or remove it.

## Part 5 — heading hierarchy

H1 `--disp` clamp(32,5vw,48) w600 -.02em, ink, NOT gold, one per page. H2
`--disp` 26px w600 ink. Eyebrow `--mono` 12px uppercase .13em GOLD — gold lives
here, not on every heading. H3 `--disp` 19px w600 ink. Slot label `--mono`
10.5px uppercase ink3. `text-wrap: balance` on all headings.

## Part 6 — the hero

Port the canvas wind farm from the reference. Blade speed driven by the wind
value at the current hour of the shared trace, with rotational inertia so
turbines wind DOWN rather than cut; they stop dead for the 61 hours of the
reference event, the sky dims, clouds stop drifting. Motion blur is GHOSTED
BLADES, never a swept ring. Four depth rows, ~20 turbines, individual yaw, two
hill lines. Readout bottom-right (`DAY 08 · 21:00 — 2.2% OF CAPACITY`) plus a
playhead sparkline. Click to pause; visible PAUSE/PLAY. `prefers-reduced-motion`
opens on a still frame OF THE EVENT. Height `clamp(300px, 44vw, 470px)`, not
100vh. Left-to-right dark scrim for legibility. It is the thesis as a moving
image: the wind stops.

## Part 7 — chart rules

Event highlight is a translucent wash (`rgba(26,22,17,.085)` light /
`rgba(255,246,225,.07)` dark) with 1px muted edges, appended BEFORE the area and
line. Add a 0% gridline and label. Label the region `61 HOURS BELOW 12%`.

Site-wide, into CLAUDE.md: NEVER a dual axis — two measures of different scale
get two stacked panels sharing one x-axis. Chart text takes theme-token colour,
never a series colour. Every axis label names a value the chart reaches. Series
colours: wind `#a87722`, solar `#2f6fa6`, battery `#b4542e`, demand graphite
DASHED as a reference line, unserved a 45° hatch. Every chart has a hover
crosshair and tooltip. Text alternatives state the FINDING, not the shape. The
trough is the visual signature — identical styling everywhere.

## Part 8 — the argument band

Full-bleed dark band (`#0e0c08`, cream) below the hero. Left: "The average
looked fine. Then Thursday happened." at clamp(24,3.1vw,34) plus the annual
figure 87.4% large in mono, captioned "Renewable share, 2025 calendar year".
Right: the fortnight trace, trough shaded and labelled. Below: "The same system,
hour by hour. One number describes it. So does the other." Keep the
Course-defined / Synthetic trace badges. Page rhythm becomes hero (dark) → lead
strip (sunk) → argument band (dark) → content (paper).

## Part 9 — interactivity

**The interaction IS the claim.** A component that illustrates a week is
decoration; one the student must OPERATE to feel the claim is teaching. Port in
this order, stopping rather than shipping four half-built ones: the 72-Hour
Dispatch, the Definition Dial, the Worst-Window Finder, the Storage Sizer.

Every component: driven by the shared trace, no hard-coded numbers, native
controls only, accent-color from the gold token, visible focus ring, operable at
390px, respects `prefers-reduced-motion`, NO browser storage. One shared frame:
header (title + a hint that advances as you use it) → plot → controls →
readouts → ONE verdict sentence that changes with state. The verdict line is the
pedagogy.

## Part 10 — clarity

Every week page, this slot order: **THIS WEEK YOU WILL** (first, three
imperative bullets, each doable in a session) · the instance · the claim · what's
going on (400–700 words) · the figure / try it · do this (numbered) · against the
event · read this (2–4 sources, each with a line on why) · what next week needs
from you.

Every assessment opens with AT A GLANCE before any prose: what you submit ·
format and length · due date · weight · takes as input · produces. Then why it
exists · the task · what good looks like · what isn't good enough · rubric ·
produces.

The Event opens with the DEFINITION AS A BOXED TABLE — region, threshold,
duration, sources, season, dataset, reference event — before any paragraph.

The homepage answers five questions in order, all inside thirty seconds: what is
this course · why does it exist · who is it for · what will I actually do ·
where do I go next. Plus a "How a week works" block: two-hour seminar then
two-hour studio, what happens in each, what you hand in. Three sentences.

## Part 11 — terminology

WEEKS in navigation and headings, "Week 07" in prose, "W07" only in data tables
and chart labels. "Studio" refers ONLY to the two-hour session inside a week.
Then `check:terms`.

## Part 12 — media

Generate the course's visual language from the shared trace, all animated SVG or
CSS, no `.gif`, no external libraries: nav strip (22px miniature of the
fortnight with the trough shaded, under the nav on EVERY page), week 1 annual
dissolving into hourly, week 3 twenty dice vs one coin, week 4 weather footprint
over fixed assets, week 7 state of charge draining against a fixed deficit,
week 8 8,760 hours with 41 lit, week 10 forecast cone converging past action
lock-in. Each freezes to a meaningful still under reduced motion, has a text
alternative stating the finding, draws from the ONE trace.

`assets-inbox/` intake rule into CLAUDE.md: identify each file and whether it is
usable; ASK for alt text, credit, licence and source_url — invent none, and an
asset with no licence does not ship; optimise (webp + jpg fallback, 1600px long
edge; mp4 + webm with poster; gif → muted looping webm with the size saving
reported); commit with a descriptive filename, wire into the named page, add to
a `/credits/` page; never hotlink. Budget ≤1.5MB per page mobile, hero ≤800KB,
video ≤4MB with a poster.

Banned imagery, verbatim into CLAUDE.md: leaves, globes, sunrise gradients,
hands holding seedlings, turbine-silhouette-against-orange-sky stock
photography, anything captioned "building a sustainable future". The visual
language is a grid control room, not an environmental charity.

## Part 13 — the failure wall

Populate from CONTENT.md. Each entry: the hour it became unavoidable, the
decision that caused it, one line on what the student said afterwards.
Anonymised, affectionate, specific, never mocking. Keep the framing sentence but
put it AFTER the entries.

## Part 14 — the checks

Structural (necessary, do not lead with these): `check:weeks` ·
`check:assessment` · `check:code` · `check:titles` · `check:links` ·
`check:render` · `check:fonts` · `check:terms` · `check:deck`.

Course-specific (lead with these — the marker's record of what had to stay true
about this course): `check:figures` · `check:no-survey` · `check:stance` ·
`check:ladder` · `check:event` · `check:traces` · `check:openings`.

Every failure message names the file and the specific violation. Commit checks
separately from fixes, prefix `spec:`, and say in the body which bug each exists
to prevent.

## Part 15 — verify, then report

Run both checks and show raw output. Walk every page at 1440px, 390px and with
reduced motion, reporting horizontal scroll, text under 14px, line length over
80 characters, anything not keyboard-operable, any chart without a text
alternative, motion that does not freeze, any page over 1.5MB mobile. Then audit
and REPORT ONLY, with file and line: numerals not resolving to
`content/figures/` with `verified:true`; citations or datasets with no real
source URL; sentences that would survive unchanged in a generic renewable energy
course; weeks explaining a technology without advancing, complicating or
challenging the position. Quote the sentences for the last two.

## Commit discipline

One logical change per commit, never batched. Prefix `fix:` / `style:` / `feat:`
/ `content:` / `spec:` / `media:` / `chore:`. When a check rejects something, say
in the COMMIT BODY what it rejected and what was done instead. Never squash,
rebase or `--amend`. Never relax a check to make a build pass — if a check looks
wrong, STOP and say why.

---

# Decisions taken

Answers to the six recon questions, recorded because two of them are corrections
to the brief above.

**1 · CONTENT.md and DESIGN.md.** CONTENT.md existed only as a `.docx`; work
from the extraction and commit it as `docs/CONTENT.md`. The DESIGN.md already in
the repo wins — it was written against this codebase and the tokens that exist;
the handover copy was written against a standalone prototype. Merge in only what
it lacks: the chart rules, the instrument-frame anatomy, the banned-imagery
list, the media weight budget.

**2 · Components — extend, do not replace.** Part 9 was written from screenshots
of a dev server that was 404ing Weeks 2 and 7 and A3 on a stale collection
cache, so it concluded there were no components. Wrong: three exist, wired by
content predicates rather than a hard-coded switch, which is better architecture
than the prototype. Port only the missing behaviours.

**Corrected: keep normalised %, not absolute GW.** Switching to GW would have
reversed a documented earlier decision made because the project rejected
invented absolute capacities — the same principle `check:figures` enforces. A
course whose thesis is that unsourced precision is an integrity problem cannot
print an invented 7.2 GW baseload on its flagship component. The requirement is
behavioural, not unit-bound: the event must be losable but not lost from hour
zero. "The agent refused an instruction that contradicted an earlier documented
decision, and the refusal was correct" is a stronger process artefact than any
clean implementation.

**3 · Corrected: fonts — two new families only.** Part 3 banned Public Sans
without knowing the theme self-hosts it, that `--at-font-body` points at it, and
that `astro.config.ts:48` requires it for deck compilation. Never edit
`astro.config.ts` for this. `--ui` stays the theme's Public Sans (university
chrome only) and `--mono` stays the theme's Roboto Mono; add only `--disp`
(Fraunces) and `--serif` (Newsreader), loaded from `PageLayout.astro`, which
README:76-78 designates as ours. Public Sans staying as the chrome is the honest
version of institution / argument / instrument.

**4 · `check:figures` — three classes.** `measured` requires source +
retrieved + `verified: true`. `course-defined` requires a rationale and NOT a
source — there is nothing to cite, someone decided. `synthetic` requires
`derived_from: trace` and is RECOMPUTED from the trace at build time, so the
build breaks if the generator is retuned and the prose is not. The three classes
map one-to-one onto the Course-defined / Synthetic trace badges, so the check and
the visible UI are one system. 87.4% is `synthetic`, `scope: annual`, exempt from
the recompute rule with the exemption declared in the figure record.

**5 · `package.json`.** In scope — README protects `astro.config.ts` and
`src/site-config.ts`, not `package.json`. But mostly avoidable: `pnpm check`
already runs `vitest run spec`, so a new `spec/*.test.ts` is picked up with no
edit. Only add a script for a check that genuinely cannot be a test.

**6 · Order.** Deploy first — it was 20% of the mark sitting at zero. Then the
P0 fixes, the chart, the argument band, the course-specific checks, Part 10
clarity, terminology and heading hierarchy, the hero, the fonts, the failure
wall. Cut unless everything above is finished: six of Part 12's seven generated
SVGs (build the nav strip only), the fourth component, and Part 4's full
alignment audit (do the card fills only).
