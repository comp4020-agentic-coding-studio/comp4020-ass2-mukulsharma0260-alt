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

## 2026-09-16 — Declined the reported duplicate-h1 bug, fixed the real one
Commit: 9d57fbc
Obvious option: Remove the body "# Heading" from the three MDX pages, as instructed, on the report that they rendered both a frontmatter title and a duplicate h1.
Why not that: The duplicate did not exist. MdxPageLayout uses the frontmatter title only for the document title, so removing the body heading would have left those pages with no h1 at all — replacing a cosmetic complaint with a real accessibility and structure failure.
How I knew the result was right: Curled all three served pages and counted h1 elements before editing anything — exactly one each, text "Policies and support", "The Failure Wall", "About this course", with the frontmatter title appearing only inside <title>. The defect was two hand-typed copies of one string, so the fix was to make the heading read the field.

## 2026-09-16 — Event band became a wash, not an opaque fill
Commit: 5371870
Obvious option: Move the highlight rect later in the SVG, on the report that it was painted on top of the series.
Why not that: Reading the source showed the rect was already appended first, so document order was never the fault. The fault was the fill token: an opaque var(--at-bg-elevated) behind a translucent area fill still erases the shape. Reordering would have changed nothing and I would have reported a fix that did not fix it.
How I knew the result was right: Checked the built markup that tf-event still precedes tf-area (it does), then confirmed the opaque token no longer appears in the emitted CSS and that the 0% label and the in-chart "61 HOURS BELOW 12%" text both render — so the trough now has data drawn through it and a stated finding.

## 2026-09-16 — Property vocabulary moved out of the schema so a test could read it
Commit: b5f9759
Obvious option: Copy the twelve property names into spec/course-coherence.test.ts, since importing src/content.config.ts into vitest fails on "astro:content".
Why not that: Two copies of a locked vocabulary is exactly the drift the check exists to catch, and the check would have been asserting against its own copy rather than the one the schema enforces.
How I knew the result was right: Grepped both consumers after the move — content.config.ts:5 and course-coherence.test.ts:4 now import the same src/lib/course-properties.ts, and the suite reports all twelve properties used exactly once, which it could not have known from a hardcoded list.

## 2026-09-16 — check:ladder rejected my assessment chain; the content changed
Commit: b5f9759
Obvious option: Loosen the check to a fuzzy match, since "A2's portfolio" obviously refers to A2's output and reads better in a metadata field.
Why not that: A paraphrase reads like a chain while letting the two ends drift silently — rename A2's output and nothing complains. The check was right and the content was wrong, so takesInput on A2, A3 and A4 was rewritten to the previous stage's produces string exactly, and the assertion was tightened from fuzzy to byte-equality.
How I knew the result was right: Printed the four stages from the built API and read the chain end to end: null, then each takes_input identical to the prior produces, ending at "a defended system, and the declared event that beats it". The prose in each brief still names its predecessor naturally; only the machine-readable field is exact.

## 2026-09-16 — A red CI run left in the history on purpose
Commit: e8146d2
Obvious option: Amend or reorder the two commits so CI never shows a failure, since the fix landed one commit later anyway.
Why not that: The repo forbids amending, and the red run is true: I tightened check:ladder to byte-equality and pushed it one commit before the content that satisfies it. CI caught my own ordering mistake, which is the check doing exactly what it exists to do. Hiding that would make the history less honest and the check look decorative.
How I knew the result was right: Watched the following run to completion (exit 0, "success — content: the assessment ladder names its inputs exactly") and re-probed the live site: title "Dunkelflaute — SLOP6246", h1 "Dunkelflaute", Level 6000, argument band and 87.4% present, "aDunkelflaute" gone.

## 2026-09-16 — check:figures declares its own scope instead of claiming coverage
Commit: d390160
Obvious option: Either sweep every numeral across all twelve weeks and four briefs, or leave the check validating only its seven registered records and let a green run imply coverage it does not have.
Why not that: The full audit is a day's work for a check that is already the strongest artefact in the repo, and the silent version is worse than useless — it would let a green run read as "every number is accounted for" when nine weeks and four briefs are unswept. A course arguing that undisclosed limits are an integrity problem has to apply that to its own checks, so the boundary is named in the file, in the failure message, and in the list of surfaces it skips.
How I knew the result was right: Ran the sweep and read all 31 flagged values in context rather than registering them blind. Most were the check misreading its input — &#39; as the numeral 39, "27 July 2026" as 27, the footer licence 4.0, a class match defeated by Astro's scope id — so the check was corrected, not the content. Exactly one genuine unregistered claim survived that read, the 72-hour dispatch window, and it was registered and recomputed from WINDOW_HOURS rather than exempted.

## 2026-09-16 — Cut the brief's blackout window instead of redesigning the model
Commit: 1a48566
Obvious option: Replace the storage-policy control with something irreversible — reserve output level, or a pre-charge window — so the scenario could hit "survives 40+, unrecoverable 45-55, blackout 60-70" as specified.
Why not that: A 270-cell sweep showed the three constraints were jointly unreachable, and the binding one was the absolute blackout window, not the model. Power-throttle policies fail at hour 5 with the unrecoverable point arriving after the shortfall; state-of-charge floors move the failure late but make it recoverable, so there is no irreversible point at all. Only reserve lead time produces a genuine gap — and it produces a large one. Redesigning the control to satisfy a window that was not carrying the lesson would have been a day's work aimed at the wrong constraint.
How I knew the result was right: Ran the three shipped presets against the tuned model and read the outcomes directly — "start the reserve now" survives with nothing unserved; "start it on day two" is unrecoverable from hour 21 and dark at hour 38 (gap 17); "wait and see" unrecoverable from hour 21, dark at 33 (gap 12). Then shipped the rejected hour-12 preset on purpose and watched the new check reject it at gap 6, naming the preset and both hours.

## 2026-09-16 — Added a component rather than re-routing the render pipeline
Commit: f2290b5
Obvious option: Route all six .astro pages through PageLayout.astro so there is one layout to hang site-wide additions on, as README:76-78 implies there already is.
Why not that: PageLayout is only the defaultLayout for the .md/.mdx pages; the .astro pages import ContentLayout or BaseLayout directly. Re-routing them is a render-pipeline refactor five days before a cutoff, and it risks more than it buys. README:18-22 permits the cheaper route explicitly — "adding is always allowed ... a component the theme doesn't have" — so CourseChrome is imported at seven entry points instead, and no page changes its layout.
How I knew the result was right: The seven manual imports are exactly the arrangement that loses one silently, so I asserted the output rather than the imports — check:chrome reads every built page for the strip, the font link and a finding-stating alt text. It immediately caught six pages with no strip, which turned out to be a stale duplicate of the whole change sitting in PageLayout from a failed revert. Counted the built pages after fixing: 29 of 29 non-deck pages carry both, decks excluded by design.

## 2026-09-16 — A revert that reverted nothing
Commit: 6e82c17
Obvious option: Trust that `git checkout <file>` had backed out the change, since the working tree then looked clean and pnpm check passed.
Why not that: It restored the file to HEAD, and HEAD was the commit that had introduced the change — so the checkout reinstated it. The "revert" commit that followed only deleted the spec file, leaving a duplicate font link and a duplicate token block live in PageLayout while I reported the item as skipped.
How I knew the result was right: check:chrome found it, not me. Six pages had the font link but no strip, which is an impossible combination if both come from one component — that asymmetry is what pointed at a second, older source. Read PageLayout directly and found the first attempt still in it at line 9.

## 2026-09-16 — Two of three reported hero defects did not exist
Commit: dd99a93
Obvious option: Take the three reported symptoms at face value — pitch-black canvas, black after one loop, boxed-in header — and write a fix for each.
Why not that: The instruction was to diagnose before fixing, so I logged the canvas state at six points across two loops first. At 1440 the backing store and CSS box agreed exactly (900x470, dpr 1, identity transform) and a sampled pixel column showed a real gradient (11,10,7 at the top through 142,106,31 at 80%), so there was nothing black to fix; two full loops wrapped cleanly with no console errors, so there was no decay either. Fixing what was described would have meant changing working code on a false theory. What the measurements did find was a genuine 390 mismatch — backing height 603 against an expected 664 — because the canvas was sized from a window resize listener that never fired when the layout, not the window, changed. A ResizeObserver on the canvas fixes the real fault.
How I knew the result was right: Only the third defect reproduced, and the divergence between my reports and the rendered page had one cause: I was measuring localhost with four uncommitted files while the deployed SHA equalled local HEAD, so nothing I had measured had ever been public. Measuring the live URL gave hero x=270, w=900, parent .at-main, grid-column resolved to `inset-start / content-end` — the subgrid collapse, exactly as reported from the page. Only the third defect reproduced. `grid-column: full` was ruled out in advance as having failed silently here before, and the suggested `width: 100vw` escape measured worse — x=18 and a 1458px scroll width at 1440, because 100vw counts the scrollbar. BaseLayout's `hero` slot emits its content as a direct child of body, which is the grid that actually defines the `full` line, so `full` resolves there: x=0, w=1440 and w=390, no horizontal scroll at either. Screenshotting the canvas element itself then showed two things no measurement had: body::after still painted the gold column rule across the hero, and the title had lost Fraunces because the font rules are scoped to `.at-main` and the hero had just moved outside it.

## 2026-09-16 — Report HEAD against the deployed SHA before measuring anything
Commit: dd99a93
Obvious option: Keep verifying hero changes on localhost, since the preview server renders the same source and is faster to iterate against.
Why not that: Three consecutive reports of a fixed hero were all true of localhost and all false of the deployed page, because the four files carrying the fix were never committed. Local HEAD and the deployed SHA were both a8b4732 — the two numbers a deploy check normally compares agreed perfectly, which is precisely why the gap stayed invisible. A matching pair of SHAs says nothing when the work is sitting uncommitted in the tree.
How I knew the result was right: Measuring the live URL reproduced the reported geometry to the pixel — x=270, w=900, `grid-column` computing to `inset-start / content-end` inside `.at-main`. That is now the standing order for anything about the rendered site: print local HEAD, the deployed SHA and `git status --porcelain` before measuring, and measure the deployed URL rather than the preview server.

## 2026-09-17 — The institution reports last, not first
Commit: e143a24
Obvious option: Leave the quality snapshot high on the homepage, third element down, where an institutional block would normally sit.
Why not that: The block carries no provenance badge, and that omission is the whole argument. It only reads as an omission to someone who has already learned that every figure on this site declares whether it is course-defined or synthetic. Third element down, before the lede, the reader has learned nothing yet and four unlabelled numbers are just furniture — indistinguishable from the ordinary university boilerplate they are imitating.
How I knew the result was right: Moved it to the end of the homepage, after "Where to go next" and before the footer, so the reader meets it having just read the argument and the ladder. Nothing else changed: same component, same content, no badge, no caption, no commentary. /about/ keeps it near the top, where the page is explaining what the course does and does not do, and the contrast lands immediately.

## 2026-09-17 — The check was strengthened after the content error, not before it
Commit: PENDING
Obvious option: Trust check:no-survey. It asserted that no two weeks share a property, it had been green since the content landed, and nothing in the build was complaining.
Why not that: Reading all twelve week pages against the /sessions/ index's own claim — "Each studio owns one property of the event, and no two own the same one" — found the claim false on the deployed site. Week 11 was filed under "boundary" and week 12 under "declared-boundary". Those are different strings, so the check passed; they are the same word, so a reader comparing the two pages sees the index contradicted. The same read found a second fault the checks cannot reach at all: week 6 was filed as challenging the thesis while its content corroborates it on a second statistic. No assertion can tell whether a stance describes its own prose.
How I knew the result was right: The check now rejects a property slug that is a substring of another, and it was committed in its failing state first so the record shows it red against the content that shipped. Week 11 became "attribution", which is what it actually teaches — the cause of a failure as an institutional choice — and week 12 kept "declared-boundary". Week 6 became "advances", which leaves the stance split at 5/4/3 rather than the 4/4/4 it had been. The even split was the tell: three stances across twelve weeks landing exactly four each is a quota, not twelve judgements. Worth recording that this was found by reading the pages, not by the harness, and that the harness was improved afterwards.
