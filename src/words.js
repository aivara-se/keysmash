import { readDigits } from "./numbers.js";

const TOKEN = /[A-Za-z]+|[0-9]+/g;

/**
 * Finds the real words and numbers in the text.
 *
 * A letter run is a word when it is on the active lists — an allow-list, never
 * "whatever letters make". A digit run is always a number. Each mark carries
 * the text it covers and the form to speak (PRODUCT.md), and a word carries the
 * emoji and colour its list gave it, for the pill to draw.
 *
 * @param {string} text The child's text so far.
 * @param {Map<string, { emoji?: string, color?: string }>} words The active lists, lower-cased.
 * @returns {{ start: number, end: number, kind: "word" | "number", value: string, spoken: string, emoji?: string, color?: string }[]}
 */
export function markText(text, words) {
  const marks = [];
  for (const match of text.matchAll(TOKEN)) {
    const value = match[0];
    const start = match.index;
    if (value[0] >= "0" && value[0] <= "9") {
      marks.push({ start, end: start + value.length, kind: "number", value, spoken: readDigits(value) });
      continue;
    }
    const entry = words.get(value.toLowerCase());
    if (entry === undefined) continue;
    marks.push({ start, end: start + value.length, kind: "word", value, spoken: value.toLowerCase(), emoji: entry.emoji, color: entry.color });
  }
  return marks;
}

/**
 * The marks to speak now: those not already spoken in that form. Calling it
 * records what is spoken, so a marked word is not spoken again until it
 * changes (PRODUCT.md).
 *
 * @param {{ start: number, spoken: string }[]} marks
 * @param {Map<number, string>} spoken Mark start -> last spoken form.
 * @returns {string[]}
 */
export function newUtterances(marks, spoken) {
  const utterances = [];
  for (const mark of marks) {
    if (spoken.get(mark.start) === mark.spoken) continue;
    spoken.set(mark.start, mark.spoken);
    utterances.push(mark.spoken);
  }
  return utterances;
}
