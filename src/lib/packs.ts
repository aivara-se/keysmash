import { colorOfEmoji } from "./emoji-colors.js";
import type { Drawing } from "./words.js";

/**
 * The rules about word packs: the words a pack holds, and how the parent's
 * edits change them.
 *
 * A pack is one language's words, or the parent's own. The built-in packs are
 * the JSON under `static/lists/`, read into the device's database on first run
 * (SYSTEMS.md). Everything here is pure — it takes the packs and returns new
 * ones — so the rules can be read and tested without a database or a page.
 * Keeping them is `src/lib/store.ts`; drawing them is
 * `src/lib/components/SettingsPage.svelte`.
 */

/** One word in a pack, and how it is drawn. */
export interface Word {
  word: string;
  emoji?: string;
  color?: string;
  image?: string;
}

/** One pack of words: a language the app marks, or the parent's own. */
export interface Pack {
  id: string;
  name: string;
  words: Word[];
  /** The place the seed gave it; nothing here reads it. */
  order?: number;
}

/**
 * The colour keys a word may name. The values, and their measured contrast
 * against the surface, are in `src/app.css` and `docs/DESIGN.md`.
 */
export const COLORS: readonly string[] = [
  "red",
  "orange",
  "amber",
  "yellow",
  "green",
  "teal",
  "sky",
  "blue",
  "indigo",
  "violet",
  "pink",
  "brown",
  "slate",
];

/**
 * The pack the parent's own words go in. It ships empty and the parent fills
 * it, and it is marked whatever language the parent chose.
 */
export const CUSTOM_PACK_ID = "custom";

/** A word the tokenizer can find: one letter run, lower-case. */
export function validWord(word: string): boolean {
  return /^[a-z]+$/.test(word);
}

/** The parent's typed word, made matchable: trimmed and lower-cased. */
export function normalizeWord(word: string): string {
  return String(word).trim().toLowerCase();
}

/**
 * The id of the pack that already holds the word, or null. One word lives in
 * one place, so a second home would give it a second colour and the colour it
 * won with would depend on the order the packs were read in (PRODUCT.md).
 */
export function ownerOf(packs: readonly Pack[], word: string): string | null {
  const key = normalizeWord(word);
  for (const pack of packs) {
    if (pack.words.some((entry) => entry.word === key)) return pack.id;
  }
  return null;
}

/** A word's colour: its own, else its emoji's, else none. */
function colorOf(entry: Word): string | undefined {
  return entry.color ?? colorOfEmoji(entry.emoji);
}

/** How one word is drawn: the emoji, colour and picture a pill shows for it. */
export function drawingOf(entry: Word): Drawing {
  return { emoji: entry.emoji, color: colorOf(entry), image: entry.image };
}

/**
 * The words the app marks, keyed lower-case, each with the emoji, colour and
 * image it is drawn with: those of the chosen language and those of the
 * parent's own pack, which the language does not turn off.
 */
export function wordsFor(
  language: string,
  packs: readonly Pack[],
): Map<string, Drawing> {
  const words = new Map<string, Drawing>();
  for (const pack of packs) {
    if (pack.id !== language && pack.id !== CUSTOM_PACK_ID) continue;
    for (const entry of pack.words) {
      words.set(entry.word, drawingOf(entry));
    }
  }
  return words;
}

/** Replaces one word of one pack, leaving every other pack as it was. */
function editWord(
  packs: readonly Pack[],
  packId: string,
  word: string,
  change: (entry: Word) => Word,
): Pack[] {
  return packs.map((pack) => {
    if (pack.id !== packId) return pack;
    return {
      ...pack,
      words: pack.words.map((entry) =>
        entry.word === word ? change(entry) : entry,
      ),
    };
  });
}

/**
 * Adds a word to a pack. Returns the new packs and a null error, or the packs
 * untouched and the reason it was refused: a word is letters only, and one word
 * lives in one place, so a word another pack holds comes back naming that pack.
 */
export function addWord(
  packs: Pack[],
  packId: string,
  typed: string,
): { packs: Pack[]; error: string | null } {
  const word = normalizeWord(typed);
  // A refusal hands the packs back by identity, so the caller can see nothing
  // changed and keep the parent's typing where it is.
  if (!validWord(word)) return { packs, error: "A word is letters only." };
  const owner = ownerOf(packs, word);
  if (owner !== null) {
    const name = packs.find((pack) => pack.id === owner)?.name ?? owner;
    return { packs, error: `Already in ${name}.` };
  }
  return {
    error: null,
    packs: packs.map((pack) =>
      pack.id === packId ? { ...pack, words: [...pack.words, { word }] } : pack,
    ),
  };
}

/** Takes a word off a pack. */
export function removeWord(
  packs: readonly Pack[],
  packId: string,
  word: string,
): Pack[] {
  return packs.map((pack) => {
    if (pack.id !== packId) return pack;
    return {
      ...pack,
      words: pack.words.filter((entry) => entry.word !== word),
    };
  });
}

/** Sets a word's emoji, or takes it away when the parent leaves the field empty. */
export function setEmoji(
  packs: readonly Pack[],
  packId: string,
  word: string,
  typed: string,
): Pack[] {
  const emoji = String(typed).trim();
  return editWord(packs, packId, word, (entry) => {
    const next = { ...entry };
    if (emoji === "") delete next.emoji;
    else next.emoji = emoji;
    return next;
  });
}

/** Gives a word a picture, which is drawn instead of its emoji. */
export function setImage(
  packs: readonly Pack[],
  packId: string,
  word: string,
  dataUrl: string,
): Pack[] {
  return editWord(packs, packId, word, (entry) => ({
    ...entry,
    image: dataUrl,
  }));
}

/** Takes a word's picture away, leaving its emoji or its plain ink. */
export function clearImage(
  packs: readonly Pack[],
  packId: string,
  word: string,
): Pack[] {
  return editWord(packs, packId, word, (entry) => {
    const next = { ...entry };
    delete next.image;
    return next;
  });
}
