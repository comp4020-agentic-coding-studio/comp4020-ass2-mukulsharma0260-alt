import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

// check:chrome — "on every page" is mechanical, not hand-maintained.
//
// src/components/CourseChrome.astro is imported at seven entry points, because
// PageLayout.astro is only the defaultLayout for the .md/.mdx pages and the six
// .astro pages import ContentLayout or BaseLayout directly. Seven manual
// imports is exactly the arrangement that silently loses one when an eighth
// page is added, so this asserts the output instead of trusting the imports.
//
// The homepage is excluded from the strip assertions, and asserted to carry no
// strip at all. The strip's job is that a marker sampling two non-adjacent
// pages meets the same event twice; the homepage's hero IS that event, so a
// strip under it restates it. Excluding it silently would leave the homepage
// unasserted either way, so the exemption is itself a test.
//
// Deck routes are excluded on purpose. They are a separate render path with
// their own stylesheet, they carry no site nav, and a nav strip on a
// full-screen slide would be furniture. Their type tokens are asserted by
// check:fonts against src/decks/theme.css instead.

const DIST = resolve("dist");
const pages = readdirSync(DIST, { recursive: true, encoding: "utf8" })
  .filter((f) => f.endsWith(".html"))
  .map((f) => [`/${f.replace(/index\.html$/, "").replace(/\.html$/, "")}`, readFileSync(join(DIST, f), "utf8")] as [string, string])
  .filter(([route]) => !route.startsWith("/decks/"));

const stripPages = pages.filter(([route]) => route !== "/");

describe("check:chrome — every page carries the course chrome", () => {
  it("builds more than one page to check", () => {
    expect(pages.length, "no built pages found").toBeGreaterThan(1);
  });

  it("serves the nav strip on every page but the homepage", () => {
    const bad = stripPages
      .filter(([, html]) => !/class="cc-strip/.test(html))
      .map(([route]) => `${route}: no nav strip — CourseChrome is not imported on this page's entry point`);
    expect(bad, bad.join("; ")).toEqual([]);
  });

  it("serves the font link on every page", () => {
    const bad = pages
      .filter(([, html]) => !html.includes("fonts.googleapis.com"))
      .map(([route]) => `${route}: no font stylesheet — CourseChrome is not imported on this page's entry point`);
    expect(bad, bad.join("; ")).toEqual([]);
  });

  it("keeps the strip off the homepage, whose hero is the event", () => {
    const [home] = pages.filter(([route]) => route === "/");
    expect(home, "no homepage in dist").toBeTruthy();
    expect(/class="cc-strip/.test(home![1]), "/: strip restates the hero").toBe(false);
  });

  it("gives the strip a text alternative that states the finding", () => {
    const bad: string[] = [];
    for (const [route, html] of stripPages) {
      const m = /class="cc-strip[\s\S]{0,400}?aria-label="([^"]+)"/.exec(html);
      if (!m) {
        bad.push(`${route}: strip has no aria-label`);
        continue;
      }
      if (!/threshold|hours/i.test(m[1]!))
        bad.push(`${route}: strip's alternative describes a shape rather than the finding`);
    }
    expect(bad, bad.join("; ")).toEqual([]);
  });
});
