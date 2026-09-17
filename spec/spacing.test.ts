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
