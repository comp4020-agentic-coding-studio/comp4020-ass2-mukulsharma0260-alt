import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

// The course contract for SLOP6246 Dunkelflaute.
//
// These tests assert course PROMISES, not implementation choices. They read the
// built artefacts — the generated course API and the emitted HTML routes —
// because that is what a reader and the catalogue actually receive. Nothing here
// inspects component names, CSS classes or DOM structure, so the contract
// survives a change of layout, styling or component approach.
//
// `spec/data-integrity.test.ts` owns "dated material stays inside the teaching
// period" and is left untouched; this file does not restate it.

interface ApiNode {
  id: string;
  type: string;
  title: string;
  description?: string;
  related?: string[];
  spec?: string[];
  meta?: Record<string, unknown>;
}

interface CourseApi {
  schemaVersion: number;
  course: {
    code: string;
    title: string;
    level: number;
    startDate: string;
    endDate: string;
    description: string;
    tags: string[];
  };
  nodes: ApiNode[];
  edges: { from: string; to: string }[];
}

const DIST = resolve("dist");
const API_PATH = join(DIST, "api", "index.json");

if (!existsSync(API_PATH)) {
  throw new Error(
    `no built API at ${API_PATH} — the course contract is asserted against built output, so run \`pnpm build\` first (\`pnpm test\` does this for you)`,
  );
}

const api = JSON.parse(readFileSync(API_PATH, "utf8")) as CourseApi;

const nodesOfType = (type: string): ApiNode[] => api.nodes.filter((node) => node.type === type);
const weekOf = (node: ApiNode): unknown => node.meta?.week;
const list = (values: readonly (string | number)[], max = 6): string =>
  values.length <= max
    ? values.join(", ")
    : `${values.slice(0, max).join(", ")} … and ${values.length - max} more`;
const clip = (value: string, max = 70): string =>
  value.length > max ? `${value.slice(0, max)}…` : value;

/** Every built HTML route, as [route, markup] pairs. The route is the URL path
 *  a reader visits, derived from the file's position in dist/. */
function builtPages(): [string, string][] {
  return readdirSync(DIST, { recursive: true, encoding: "utf8" })
    .filter((entry) => entry.endsWith(".html"))
    .map((entry) => {
      const route = `/${entry.replace(/index\.html$/, "").replace(/\.html$/, "")}`;
      return [route, readFileSync(join(DIST, entry), "utf8")] as [string, string];
    });
}

// ---------------------------------------------------------------------------
// A. Course identity
// ---------------------------------------------------------------------------

describe("course identity", () => {
  it("publishes the allocated course code SLOP6246", () => {
    expect(
      api.course.code,
      `the course API advertises ${api.course.code}, but this course is SLOP6246`,
    ).toBe("SLOP6246");
  });

  it("keeps the three digits allocated to this repo", () => {
    // The last three digits were allocated to this repo and no other course in
    // the cohort has them. Only the leading level digit is ours to choose.
    expect(
      api.course.code.slice(-3),
      `the allocated digits 246 must not change — found code ${api.course.code}`,
    ).toBe("246");
  });

  it("is a 6000-level postgraduate course", () => {
    expect(api.course.level, `level must be 6, found ${api.course.level}`).toBe(6);
  });

  it("agrees between the code's leading digit and the level field", () => {
    const leading = Number(api.course.code.at(4));
    expect(
      api.course.level,
      `code ${api.course.code} leads with ${leading} but level is ${api.course.level}; the two must match`,
    ).toBe(leading);
  });
});

// ---------------------------------------------------------------------------
// B. Twelve-week structure
//
// `sessions` is the authoritative weekly teaching sequence, on the repo's own
// evidence: src/pages/sessions/index.astro describes it as "The twelve-week
// teaching schedule", while src/pages/lectures/index.mdx says "A course decides
// how many lectures it needs". So sessions must cover all twelve weeks;
// lectures are deliberately not held to that.
// ---------------------------------------------------------------------------

const TEACHING_WEEKS = Array.from({ length: 12 }, (_, i) => i + 1);

describe("twelve-week teaching structure", () => {
  it("publishes a teaching session for every week 1 through 12", () => {
    const published = nodesOfType("sessions").map(weekOf);
    const missing = TEACHING_WEEKS.filter((week) => !published.includes(week));
    expect(
      missing,
      `the course promises a twelve-week schedule but publishes no session for week(s): ${list(missing, 12)}`,
    ).toEqual([]);
  });

  it("publishes no duplicate week in the weekly teaching sequence", () => {
    const weeks = nodesOfType("sessions").map(weekOf);
    const duplicated = [...new Set(weeks.filter((w, i) => weeks.indexOf(w) !== i))];
    const offenders = nodesOfType("sessions")
      .filter((node) => duplicated.includes(weekOf(node)))
      .map((node) => `${node.id} (week ${String(weekOf(node))})`);
    expect(
      duplicated,
      `two sessions claim the same week, so the schedule is ambiguous: ${list(offenders)}`,
    ).toEqual([]);
  });

  it("publishes no dated teaching material outside weeks 1 to 12", () => {
    const offenders = api.nodes
      .filter((node) => ["sessions", "lectures", "assessments"].includes(node.type))
      .filter((node) => {
        const week = weekOf(node);
        return typeof week !== "number" || week < 1 || week > 12;
      })
      .map((node) => `${node.id} (week ${String(weekOf(node))})`);
    expect(
      offenders,
      `every session, lecture and assessment must sit in weeks 1-12: ${list(offenders)}`,
    ).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// C. Assessment ladder
//
// The four assessments are a dependency chain, not four separate tasks. This
// asserts the ladder's published shape; H4 will assert the prose dependencies.
// ---------------------------------------------------------------------------

const LADDER = [
  { title: "Define the Drought", weight: 15 },
  { title: "Site Against Failure", weight: 20 },
  { title: "The 72-Hour Dispatch", weight: 25 },
  { title: "Design for the Worst Week", weight: 40 },
] as const;

describe("assessment ladder", () => {
  it("publishes exactly four assessments", () => {
    const published = nodesOfType("assessments").map((node) => node.title);
    expect(
      published.length,
      `the ladder is four assessments; found ${published.length}: ${list(published)}`,
    ).toBe(4);
  });

  it("publishes each rung of the ladder with its required weight", () => {
    const published = new Map(
      nodesOfType("assessments").map((node) => [node.title, node.meta?.weight]),
    );
    const wrong = LADDER.filter((rung) => published.get(rung.title) !== rung.weight).map((rung) =>
      published.has(rung.title)
        ? `"${rung.title}" is ${String(published.get(rung.title))}%, must be ${rung.weight}%`
        : `"${rung.title}" (${rung.weight}%) is missing`,
    );
    expect(
      wrong,
      `the assessment ladder does not match the course contract: ${list(wrong)}`,
    ).toEqual([]);
  });

  it("totals exactly 100% across published assessments", () => {
    const weights = nodesOfType("assessments").map((node) => Number(node.meta?.weight ?? 0));
    const total = weights.reduce((sum, weight) => sum + weight, 0);
    expect(total, `published assessment weights total ${total}%, must be exactly 100%`).toBe(100);
  });

  it("orders the ladder so each rung falls due no earlier than the one it builds on", () => {
    // A2 builds on A1, A3 on the defined event, A4 on all of it. A rung due
    // before its prerequisite cannot be a dependency chain.
    const dueOf = new Map(
      nodesOfType("assessments").map((node) => [node.title, String(node.meta?.due ?? "")]),
    );
    const sequence = LADDER.map((rung) => ({ title: rung.title, due: dueOf.get(rung.title) }));
    const outOfOrder: string[] = [];
    for (let i = 1; i < sequence.length; i++) {
      const previous = sequence[i - 1]!;
      const current = sequence[i]!;
      if (!previous.due || !current.due) continue; // absence is C's other tests' problem
      if (current.due < previous.due) {
        outOfOrder.push(
          `"${current.title}" (${current.due}) falls due before "${previous.title}" (${previous.due})`,
        );
      }
    }
    expect(
      outOfOrder,
      `the ladder's due dates contradict its dependency order: ${list(outOfOrder)}`,
    ).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// D. Canonical event page
//
// The drought is defined once, at /the-event/. Asserted on built output — the
// route either exists for a reader or it does not.
// ---------------------------------------------------------------------------

describe("canonical event definition", () => {
  it("exposes /the-event/ as a built route", () => {
    const routes = builtPages().map(([route]) => route);
    expect(
      routes.includes("/the-event/"),
      `the course's canonical drought definition must be reachable at /the-event/, but no such route was built (built routes: ${list(routes, 8)})`,
    ).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// E. A real course deck
//
// A deck route existing is not enough: the shipped starter deck is a template
// artefact that teaches slide authoring rather than the course. The contract is
// course-specific — a qualifying deck is wired into the weekly sequence by a
// lecture's `slides:` metadata AND carries no starter authoring prose. No file
// hashes are involved, so re-cutting a deck cannot accidentally satisfy it.
// ---------------------------------------------------------------------------

const STARTER_DECK_PROSE = [
  "Replace this deck",
  "Slides are markdown",
  "A slide class",
  "the deck is a performance artefact",
  "proves the deck compiles with the rest of the site",
];

describe("course deck", () => {
  const deckPages = () => builtPages().filter(([route]) => route.startsWith("/decks/"));

  it("builds at least one deck route", () => {
    const routes = deckPages().map(([route]) => route);
    expect(
      routes.length,
      "the course must publish at least one deck under /decks/",
    ).toBeGreaterThan(0);
  });

  it("wires every lecture's slides reference to a deck that was built", () => {
    const built = new Set(deckPages().map(([route]) => route));
    const dangling = nodesOfType("lectures")
      .filter((node) => typeof node.meta?.slides === "string")
      .filter((node) => !built.has(String(node.meta?.slides)))
      .map((node) => `${node.id} → ${String(node.meta?.slides)}`);
    expect(
      dangling,
      `a lecture points at a deck route that does not exist: ${list(dangling)}`,
    ).toEqual([]);
  });

  it("publishes a course deck rather than the starter template deck", () => {
    const referenced = new Set(
      nodesOfType("lectures")
        .map((node) => node.meta?.slides)
        .filter((slides): slides is string => typeof slides === "string"),
    );
    const disqualified: string[] = [];
    const qualifying = deckPages().filter(([route, markup]) => {
      if (!referenced.has(route)) {
        disqualified.push(`${route} (no lecture references it)`);
        return false;
      }
      const starter = STARTER_DECK_PROSE.filter((phrase) => markup.includes(phrase));
      if (starter.length > 0) {
        disqualified.push(`${route} (still carries starter authoring prose: "${starter[0]}")`);
        return false;
      }
      return true;
    });
    expect(
      qualifying.length,
      `no deck yet meets the course contract — a qualifying deck is referenced by a lecture and free of starter template prose. Disqualified: ${list(disqualified)}`,
    ).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// F. Starter eradication on published surfaces
//
// Structural, and scoped to what the published site and API actually expose to
// a reader. This deliberately does NOT reimplement check:evidence's image-hash
// gate or grep the source tree — it asks whether starter placeholder material
// survives into the artefacts a reader receives.
//
// Every indicator below is a verbatim, distinctive artefact of THIS starter,
// confirmed present in the current built output. They are deliberately not
// ordinary English: a finished course could legitimately write "replace this"
// or "weights should sum to 100", so such phrases are excluded. The test must
// fail because the site is visibly still the starter, never because the course
// happened to use a common turn of phrase.
// ---------------------------------------------------------------------------

const STARTER_ARTEFACTS = [
  // The marker itself, which the starter leaks into built pages and API nodes.
  "STARTER_CONTENT",
  // Verbatim starter course-record values.
  "Course Title Goes Here",
  "One concise paragraph explaining what this course is",
  "replace me",
  // Verbatim starter node descriptions, which ship as catalogue metadata.
  "a placeholder brief showing the shape every assessment page follows",
  "The placeholder deck",
  // Template authoring instructions the starter renders to readers.
  "It is here so the sessions listing sorts by week",
  "It exists so the lectures listing sorts by week",
  "This one demonstrates the alternative marking mode",
  "Say what a student spends their time on",
  "before you replace the cast with your own",
  "The internal collection and URL stay",
  "renders a criterion table",
];

describe("no starter placeholder material on published surfaces", () => {
  it("serves no starter placeholder text in any built page", () => {
    const offenders: string[] = [];
    for (const [route, markup] of builtPages()) {
      const found = STARTER_ARTEFACTS.filter((phrase) => markup.includes(phrase));
      if (found.length > 0) offenders.push(`${route} ("${found.join('", "')}")`);
    }
    expect(
      offenders,
      `${offenders.length} built page(s) still serve starter placeholder text to readers: ${list(offenders)}`,
    ).toEqual([]);
  });

  it("exposes no starter placeholder text in the generated course API", () => {
    const offenders: string[] = [];
    for (const node of api.nodes) {
      const text = [node.title, node.description ?? "", ...(node.spec ?? [])].join(" ");
      const found = STARTER_ARTEFACTS.filter((phrase) => text.includes(phrase));
      if (found.length > 0) offenders.push(`${node.id} ("${found.join('", "')}")`);
    }
    expect(
      offenders,
      `the catalogue would ingest starter placeholder text from: ${list(offenders)}`,
    ).toEqual([]);
  });

  it("describes the course in its own words across the whole API course record", () => {
    const fields: [string, string][] = [
      ["title", api.course.title],
      ["description", api.course.description],
      ["tags", api.course.tags.join(", ")],
    ];
    const offenders = fields.flatMap(([field, value]) => {
      const found = STARTER_ARTEFACTS.filter((phrase) => value.includes(phrase));
      return found.length > 0 ? [`${field} = "${clip(value)}"`] : [];
    });
    expect(
      offenders,
      `the published course record still carries starter values — ${list(offenders)}`,
    ).toEqual([]);
  });
});
