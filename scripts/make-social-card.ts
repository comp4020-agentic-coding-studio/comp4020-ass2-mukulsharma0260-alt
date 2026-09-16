#!/usr/bin/env node
// Generates the SLOP6246 link-preview card at src/assets/images/card.png.
//
// The card is drawn, not photographed: its trough is the course's own shared
// synthetic trace, and its palette is derived from the Slop brand token
// (--at-primary) using the same OKLCH relative-colour formulas the theme uses
// in tokens.css. So the artwork cannot drift from either the data or the brand,
// and no stock imagery or external asset is involved.
//
// Run: node scripts/make-social-card.ts
// Uses sharp, already a dependency; adds nothing.

import { writeFileSync } from "node:fs";
import sharp from "sharp";
import { THRESHOLD_PCT, TRACE_HOURS, trace } from "../src/lib/trace.ts";
import { EVENT_LENGTH_HOURS, EVENT_START_HOUR } from "../src/lib/trace.ts";

// ── colour: sRGB ↔ OKLab/OKLCH (Ottosson), matching the theme's derivations ──
const srgbToLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const linearToSrgb = (c: number) => (c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055);

function hexToOklch(hex: string): { L: number; C: number; h: number } {
  const [r, g, b] = [1, 3, 5].map((i) => srgbToLinear(parseInt(hex.slice(i, i + 2), 16) / 255));
  const l = Math.cbrt(0.4122214708 * r! + 0.5363325363 * g! + 0.0514459929 * b!);
  const m = Math.cbrt(0.2119034982 * r! + 0.6806995451 * g! + 0.1073969566 * b!);
  const s = Math.cbrt(0.0883024619 * r! + 0.2817188376 * g! + 0.6299787005 * b!);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return { L, C: Math.hypot(A, B), h: Math.atan2(B, A) };
}

function oklchToHex(L: number, C: number, h: number): string {
  const A = C * Math.cos(h);
  const B = C * Math.sin(h);
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
  const rgb = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map((v) => {
    const clamped = Math.min(1, Math.max(0, linearToSrgb(v)));
    return Math.round(clamped * 255)
      .toString(16)
      .padStart(2, "0");
  });
  return `#${rgb.join("")}`;
}

const PRIMARY = "#b97d1c"; // astro-theme-slop: the lockup gold
const { h } = hexToOklch(PRIMARY);
// Light-mode values, same lightness/chroma the theme's tokens ask for.
const BG = oklchToHex(0.994, 0.004, h);
const BG_ALT = oklchToHex(0.965, 0.006, h);
const INK = oklchToHex(0.2, 0.01, h);

// ── geometry ────────────────────────────────────────────────────────────────
const W = 1200;
const HEIGHT = 630;
const PLOT = { x: 0, y: 360, w: W, h: 210 };
const MAX = 70;

const px = (hour: number) => PLOT.x + (hour / (TRACE_HOURS - 1)) * PLOT.w;
const py = (pct: number) => PLOT.y + PLOT.h - (Math.min(pct, MAX) / MAX) * PLOT.h;

const area =
  `M${px(0).toFixed(1)} ${(PLOT.y + PLOT.h).toFixed(1)} ` +
  trace.total.map((v, i) => `L${px(i).toFixed(1)} ${py(v).toFixed(1)}`).join(" ") +
  ` L${px(TRACE_HOURS - 1).toFixed(1)} ${(PLOT.y + PLOT.h).toFixed(1)} Z`;

const eventX = px(EVENT_START_HOUR);
const eventW = px(EVENT_START_HOUR + EVENT_LENGTH_HOURS) - eventX;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${HEIGHT}" viewBox="0 0 ${W} ${HEIGHT}">
  <rect width="${W}" height="${HEIGHT}" fill="${BG}"/>
  <rect x="0" y="0" width="${W}" height="${PLOT.y - 24}" fill="${BG}"/>
  <line x1="64" y1="86" x2="${W - 64}" y2="86" stroke="${PRIMARY}" stroke-width="2"/>
  <text x="64" y="70" font-family="ui-monospace, monospace" font-size="24" letter-spacing="4" fill="${INK}" opacity="0.62">SLOP6246 · SLOP UNIVERSITY</text>
  <text x="64" y="196" font-family="Georgia, serif" font-size="104" fill="${PRIMARY}">Dunkelflaute</text>
  <text x="64" y="256" font-family="Georgia, serif" font-size="40" fill="${INK}">Designing for the week the weather stops</text>
  <text x="64" y="318" font-family="ui-monospace, monospace" font-size="23" fill="${INK}" opacity="0.62">A renewable grid is designed by the event it must survive</text>
  <rect x="0" y="${PLOT.y - 24}" width="${W}" height="${PLOT.h + 24}" fill="${BG_ALT}"/>
  <rect x="${eventX.toFixed(1)}" y="${PLOT.y - 24}" width="${eventW.toFixed(1)}" height="${PLOT.h + 24}" fill="${PRIMARY}" opacity="0.12"/>
  <path d="${area}" fill="${PRIMARY}" fill-opacity="0.3" stroke="${PRIMARY}" stroke-width="2.5"/>
  <line x1="0" y1="${py(THRESHOLD_PCT).toFixed(1)}" x2="${W}" y2="${py(THRESHOLD_PCT).toFixed(1)}" stroke="${INK}" stroke-width="2" stroke-dasharray="10 7"/>
  <text x="${(eventX + eventW + 14).toFixed(1)}" y="${(PLOT.y + 18).toFixed(1)}" font-family="ui-monospace, monospace" font-size="21" fill="${INK}">${EVENT_LENGTH_HOURS} h BELOW ${THRESHOLD_PCT}%</text>
</svg>`;

const out = "src/assets/images/card.png";
writeFileSync("/tmp/card.svg", svg);
await sharp(Buffer.from(svg)).png().toFile(out);
console.log(`wrote ${out} (${W}x${HEIGHT}) — palette derived from ${PRIMARY}, trough from the shared trace`);
