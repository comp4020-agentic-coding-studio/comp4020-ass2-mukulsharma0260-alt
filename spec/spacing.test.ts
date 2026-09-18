import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

// check:spacing — an inline expression must carry its own leading space.
//
// In Astro's JSX, a newline plus indentation between text and a following
// `{expression}` is whitespace-with-newline, and JSX deletes it. So
//
//     the span and the count of hours are the same
//     {EVENT_LENGTH_HOURS} hours.
//
// renders as "are the same61 hours." on the deployed page. The defect is
// invisible in the source, survives a typecheck, and survives axe, because the
// markup is valid and only the prose is wrong. Three call sites had it: one on
// /the-event/ and two in the dispatch console, one of those inside the text
// alternative where it would never be seen by eye at all.
//
// The fix is `{" "}` at the end of the text line. This checks the rendered
// output rather than the source, because the source pattern has several
// spellings while the rendered defect has exactly one shape: a letter
// immediately followed by a digit inside a text node.

const DIST = resolve("dist");

/** Legitimate letter-then-digit text: chart axis tick labels, which are whole
 *  text nodes of their own — "d1", "h38". Anything longer is prose. */
const TICK_LABEL = /^[dhw]\d{1,3}$/;

const ENTITIES: [RegExp, string][] = [
  [/&amp;/g, "&"],
  [/&lt;/g, "<"],
  [/&gt;/g, ">"],
  [/&quot;/g, '"'],
  [/&apos;/g, "'"],
  [/&nbsp;/g, " "],
];

function words(html: string): string[] {
  let text = html.replace(/<(script|style)[\s\S]*?<\/\1>/g, " ").replace(/<[^>]+>/g, " ");
  // Numeric entities are punctuation in this codebase (apostrophes, dashes),
  // and decoding them to a character keeps them out of the letter-digit match.
  text = text.replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)));
  for (const [pattern, char] of ENTITIES) text = text.replace(pattern, char);
  return text
    .split(/\s+/)
    .map((word) => word.trim())
    .filter(Boolean);
}

describe("check:spacing — no inline figure loses its leading space", () => {
  const pages = readdirSync(DIST, { recursive: true, encoding: "utf8" }).filter((file) =>
    file.endsWith(".html"),
  );

  it("builds pages to check", () => {
    expect(pages.length, "no built pages found").toBeGreaterThan(1);
  });

  it("never renders a letter immediately followed by a digit in prose", () => {
    const bad: string[] = [];
    for (const file of pages) {
      const html = readFileSync(join(DIST, file), "utf8");
      for (const word of words(html)) {
        if (TICK_LABEL.test(word)) continue;
        if (/[a-z]\d/.test(word)) bad.push(`/${file.replace(/index\.html$/, "")}: ${word}`);
      }
    }
    expect(
      bad,
      `an inline expression lost its leading space. Add {" "} to the end of the preceding text line:\n${[...new Set(bad)].join("\n")}`,
    ).toEqual([]);
  });
});

// The rule this file should have encoded the first time.
//
// The original assertion looked for a letter followed by a digit inside one
// text node, because the three instances in front of me were all expression
// interpolations: {EVENT_LENGTH_HOURS} renders bare text, so "same" and "61"
// land in the same node. It was scoped to those three instances rather than to
// the fault, and the next instance of the same fault shipped and went live —
// "at<a>the event</a>" on /sessions/, a letter meeting a letter across an
// element boundary, which that pattern cannot see. Green check, live bug.
//
// The fault is: a word split across an inline element boundary. This checks
// both sides of every inline tag — a word character immediately before an
// opening tag whose content starts with a word character, and a word character
// immediately after a closing tag. Letter-letter, letter-digit and digit-letter
// all fall out of the one rule.
//
// The text-node assertion above is kept rather than replaced: it catches the
// interpolation case, which leaves no element boundary to find. Neither rule
// subsumes the other.

/** Phrasing elements that sit inside a sentence. */
const INLINE = [
  "a", "abbr", "b", "bdi", "cite", "code", "data", "del", "dfn", "em", "i",
  "ins", "kbd", "mark", "q", "s", "samp", "small", "span", "strong", "sub",
  "sup", "time", "u", "var",
].join("|");

const BEFORE_OPEN = new RegExp(`(\\w)<(?:${INLINE})\\b[^>]*>(\\w)`, "gi");
const AFTER_CLOSE = new RegExp(`</(?:${INLINE})>(\\w)`, "gi");

describe("check:spacing — no word splits across an inline element boundary", () => {
  const pages = readdirSync(DIST, { recursive: true, encoding: "utf8" }).filter((file) =>
    file.endsWith(".html"),
  );

  it("never joins a word to an inline element's first character", () => {
    const bad: string[] = [];
    for (const file of pages) {
      const html = readFileSync(join(DIST, file), "utf8")
        .replace(/<(script|style)[\s\S]*?<\/\1>/g, " ");
      for (const m of html.matchAll(BEFORE_OPEN))
        bad.push(`/${file.replace(/index\.html$/, "")}: ...${html.slice(Math.max(0, m.index - 40), m.index + 60)}`);
      for (const m of html.matchAll(AFTER_CLOSE))
        bad.push(`/${file.replace(/index\.html$/, "")}: ...${html.slice(Math.max(0, m.index - 60), m.index + 40)}`);
    }
    expect(
      bad,
      `a word is split across an inline element boundary. Add {" "} on the side that lost it:\n${[...new Set(bad)].join("\n")}`,
    ).toEqual([]);
  });
});
