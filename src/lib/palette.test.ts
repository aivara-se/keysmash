import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import { EMOJI_COLORS } from "./emoji-colors.js";
import { COLORS } from "./packs.js";

/**
 * The palette against the documents that promise it. `docs/DESIGN.md` says every
 * colour is measured against the surface at build and that no value ships
 * unmeasured, and its table repeats the values `src/app.css` declares. A test
 * that reads a document is pinned to it on purpose: the document states the
 * values, so a change that moves one copy without the other fails.
 */

const APP_CSS = join(import.meta.dir, "..", "app.css");
const DESIGN = join(import.meta.dir, "..", "..", "docs", "DESIGN.md");

/** The surface every colour is drawn on, and measured against. */
const SURFACE = "#ffffff";

/** The WCAG AAA floor for small text; every colour here is text. */
const MINIMUM = 4.5;

/** The `--ink-*` colours declared in app.css, by their palette key. */
async function declaredColors(): Promise<Map<string, string>> {
  const css = await Bun.file(APP_CSS).text();
  const colors = new Map<string, string>();
  for (const match of css.matchAll(/--ink-([a-z]+):\s*(#[0-9a-fA-F]{6})\s*;/g)) colors.set(match[1], match[2].toLowerCase());
  return colors;
}

/** The colour table in DESIGN.md: each colour's hex value and its printed ratio. */
async function documentedColors(): Promise<Map<string, { hex: string; ratio: number }>> {
  const doc = await Bun.file(DESIGN).text();
  const colors = new Map<string, { hex: string; ratio: number }>();
  for (const line of doc.split("\n")) {
    const match = /^\s*-\s+(?:a\s+)?([a-z]+)\s+`(#[0-9a-fA-F]{6})`,\s*([0-9.]+):1\s*$/.exec(line);
    if (match) colors.set(match[1], { hex: match[2].toLowerCase(), ratio: Number(match[3]) });
  }
  return colors;
}

/** A colour's WCAG 2 relative luminance. */
function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((at) => {
    const channel = parseInt(hex.slice(at, at + 2), 16) / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Two colours' WCAG contrast ratio, lighter over darker. */
function contrast(a: string, b: string): number {
  const [lighter, darker] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (lighter + 0.05) / (darker + 0.05);
}

const declared = await declaredColors();
const documented = await documentedColors();

describe("the palette", () => {
  test("declares a colour for every key, and measures each at 4.5:1 against the surface", () => {
    // The number's colour is the palette's own key, so the declared set is the
    // word colours and it.
    expect([...declared.keys()].sort()).toEqual([...COLORS, "number"].sort());
    const tooLight = [...declared]
      .filter(([, hex]) => contrast(hex, SURFACE) < MINIMUM)
      .map(([name, hex]) => `${name} ${hex} is ${contrast(hex, SURFACE).toFixed(2)}:1`);
    expect(tooLight).toEqual([]);
  });

  test("prints in DESIGN.md the same values and ratios as app.css", () => {
    const unlisted = [...declared.keys()].filter((name) => !documented.has(name));
    expect(unlisted).toEqual([]);
    const invented = [...documented.keys()].filter((name) => !declared.has(name));
    expect(invented).toEqual([]);
    const moved = [...declared]
      .filter(([name, hex]) => {
        const printed = documented.get(name);
        return printed?.hex !== hex || printed.ratio !== Number(contrast(hex, SURFACE).toFixed(2));
      })
      .map(([name, hex]) => `${name} ${hex} is ${contrast(hex, SURFACE).toFixed(2)}:1`);
    expect(moved).toEqual([]);
  });

  test("gives every emoji a key the palette declares", () => {
    const unknown = Object.entries(EMOJI_COLORS)
      .filter(([, key]) => !COLORS.includes(key))
      .map(([emoji, key]) => `${emoji} names ${key}`);
    expect(unknown).toEqual([]);
  });
});
