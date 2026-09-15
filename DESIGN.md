# Design contract — SLOP6246 Dunkelflaute

The course layer's visual and interaction constraints. This is a contract to
design against, not an implementation. No CSS is specified here; nothing in this
document authorises changing the fixed platform layer.

Authority order: `README.md` (platform) → `CLAUDE.md` (course rules) → this file
(visual and interaction constraints).

## 1. The fixed chrome stays recognisable

The Slop University identity is fixed and arrives via `slopBranding` and
`brandCss`. This site must still read as a SlopU course site: the header, footer,
navigation and brand tokens are inherited, not replaced.

The course layer is what sits **inside** that chrome. Work with the brand tokens
rather than restating colours next to them — a colour restated is how the two
start to disagree.

## 2. Visual thesis

> **A grid control room, not an environmental charity.**

The site should feel like an operational evidence board: something a system
operator reads under pressure to decide whether the next week is survivable.
Sober, instrument-like, evidence-forward. Its emotional register is
*accountability*, not *optimism*.

Explicitly **not**: leaves, globes, green hands, sunsets, turbines in
wildflowers, gradient "clean future" hero art, or any stock sustainability
vocabulary. If a visual would look at home in a solar company's brochure, it is
wrong for this course.

## 3. Visual language

The recurring vocabulary is the vocabulary of the problem:

- **traces** — generation and demand over time
- **troughs** — the shape of the drought itself
- **thresholds** — the line that defines an event
- **dispatch** — what gets called on, in what order
- **duration** — how long a resource lasts, versus how long the event lasts
- **capacity** — what exists, versus what is available
- **failure boundaries** — the event that still defeats the design

These are the primitives. A visual that does not express one of them is probably
decoration.

**The drought must look the same everywhere.** A trough on the home page, a
trough in an assessment brief, and a trough on a slide are the same visual
object: same orientation, same threshold treatment, same shading convention for
"inside the event". This consistency is a hard requirement — a reader should
recognise the event on sight, across the whole site.

## 4. Colour

- **Base:** the restrained paper/cream institutional ground inherited from SlopU.
  Keep it. Large areas of saturated colour are wrong for this register.
- **Course accents** may distinguish the resource classes — wind, solar, storage,
  demand — but **the semantic mapping must be fixed once and never drift.** If
  storage is one hue on the home page, it is that hue in every chart, legend,
  slide and diagram on the site.
- Colour is never the only carrier of meaning. Anything distinguished by hue must
  also be distinguishable by label, position, pattern or shape.
- Reserve a distinct treatment for threshold and failure-boundary marks so they
  never read as just another series.
- The palette must hold in both light and dark rendering of the inherited theme.

## 5. Typography

Three roles, distinguishable without fighting the fixed university chrome:

1. **editorial headings** — the argument's structure
2. **readable body copy** — prose that carries reasoning
3. **monospaced / data labels** — figures, units, axis labels, thresholds,
   provenance notes

The monospaced role is what signals "this is measured" and visually separates a
number from prose. Use it consistently for data, and not for emphasis.

Do not introduce a display face that competes with the inherited brand
typography.

## 6. Layout and measure

- **Prose must not stretch across the full viewport.** Hold a readable measure
  even on a 1920px-wide screen; the extra width goes to margin, figures, or a
  side rail — not to longer lines.
- Wide artefacts (charts, tables, dispatch stacks, code) may exceed the prose
  measure, but must scroll **inside their own container**. The page body never
  scrolls horizontally.
- Vertical rhythm should make the structure of an argument visible: claim,
  evidence, consequence.

## 7. Charts and data display

Every chart is an argument, so every chart owes the reader:

- **labelled units** on every axis — no bare numbers
- **a legend** wherever more than one series is present
- **an accessible text alternative** that states the chart's point, not just its
  type — a reader who cannot see it must still get the claim
- **no misleading dual-axis treatment.** Two y-axes that invite a false
  correlation are banned. If two quantities must be compared, normalise them, use
  small multiples, or state the comparison in prose.
- explicit provenance: every chart says whether its data is a real sourced record
  or synthetic/illustrative, per `CLAUDE.md` §6
- honest baselines and unclipped ranges; a truncated axis must be marked as such

Charts must remain legible at 390px wide. A chart that only works at desktop
width is unfinished, not responsive-later.

## 8. Mobile is a first-class target

390×844 is a marking viewport, not a degraded case. Design the small view as its
own composition rather than shrinking the desktop one.

- No horizontal overflow at 390px, anywhere.
- Controls stay reachable and hit-targets stay usable.
- Charts reflow or scroll deliberately; they do not simply squash.
- Slides must be legible at phone width — nothing automated checks slide fit, so
  this is a manual obligation at both viewports.

## 9. Interaction

An interaction exists to make a course claim **inspectable**.

- A control must change something meaningful and **expose the consequence** of
  the change — ideally the consequence the course is arguing about (does the
  system survive the week, and what fails first).
- The reader should end an interaction knowing something they could not have read
  off a static figure.
- Banned: fake buttons, `href="#"`, decorative sliders, toggles that do not alter
  the argument, controls whose inputs the output ignores.
- If you cannot name the claim a control tests, it should not ship.

## 10. Motion

- No gratuitous animation. Motion is permitted only where it carries meaning —
  showing a trough developing over time, or a dispatch order resolving.
- Respect `prefers-reduced-motion`: provide a static equivalent that conveys the
  same information, not a silently degraded one.
- Nothing may auto-play, loop indefinitely, or move while a reader is trying to
  read text.

## 11. Non-negotiables

A change that does any of the following is wrong regardless of how it looks:

1. Makes the site read as environmental charity branding.
2. Breaks the fixed SlopU chrome or restates its brand tokens.
3. Lets the semantic colour mapping drift between two places.
4. Ships a chart without units, provenance, or a text alternative.
5. Causes horizontal overflow at 390px.
6. Adds an interaction that does not change the argument.
7. Presents an unlabelled synthetic number as observed data.
