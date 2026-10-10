import { EMOJI_COLORS } from "./emoji-colors.js";

/**
 * The rules about word lists: the words an active list holds, and how the
 * parent's edits change a list.
 *
 * The built-in lists are the JSON under `lists/`, read into the device's
 * database on first run (SYSTEM.md). Everything here is pure — it takes the
 * lists and returns new ones — so the rules can be read and tested without a
 * database or a page. Keeping them is `src/store.js`; drawing them is
 * `src/settings-page.js`.
 *
 * A word is `{ word, emoji?, color?, image? }`. A list is
 * `{ id, name, color?, words }`, and a list may carry `order`, the place the
 * seed gave it, which nothing here reads. A word's `image` is the alternative
 * to its `emoji`, drawn in the emoji's place; it is a data URL (SYSTEM.md).
 */

/**
 * The colour keys a word or a list may name. The values, and their measured
 * contrast against the surface, are in `styles.css` and `docs/DESIGN.md`.
 */
export const COLORS = ["red", "orange", "amber", "yellow", "green", "teal", "sky", "blue", "indigo", "violet", "pink", "brown", "slate"];

/** The list the parent's own words go on. It ships empty and the parent fills it. */
export const CUSTOM_LIST_ID = "custom";

/** A word the tokenizer can find: one letter run, lower-case. */
export function validWord(word) {
  return typeof word === "string" && /^[a-z]+$/.test(word);
}

/** The parent's typed word, made matchable: trimmed and lower-cased. */
export function normalizeWord(word) {
  return String(word).trim().toLowerCase();
}

/**
 * The id of the list that already holds the word, or null. One word lives on
 * one list, so a second home would give it a second colour and the colour it
 * won with would depend on the order the lists were read in (PRODUCT.md).
 */
export function ownerOf(lists, word) {
  const key = normalizeWord(word);
  for (const list of lists) {
    if (list.words.some((entry) => entry.word === key)) return list.id;
  }
  return null;
}

/** A word's colour: its own, else its emoji's, else its list's, else none. */
function colorOf(list, entry) {
  return entry.color ?? EMOJI_COLORS[entry.emoji] ?? list.color;
}

/**
 * The words of the active lists, keyed lower-case, each with the emoji, colour
 * and image it is drawn with. A word is here only while its list is active, so
 * the app marks and speaks nothing else.
 */
export function wordsFor(listIds, lists) {
  const words = new Map();
  for (const list of lists) {
    if (!listIds.includes(list.id)) continue;
    for (const entry of list.words) {
      words.set(entry.word, { emoji: entry.emoji, color: colorOf(list, entry), image: entry.image });
    }
  }
  return words;
}

/** Replaces one word of one list, leaving every other list as it was. */
function editWord(lists, listId, word, change) {
  return lists.map((list) => {
    if (list.id !== listId) return list;
    return { ...list, words: list.words.map((entry) => (entry.word === word ? change(entry) : entry)) };
  });
}

/**
 * Adds a word to a list. Returns the new lists and a null error, or the lists
 * untouched and the reason it was refused: a word is letters only, and one word
 * lives on one list, so a word another list holds comes back naming that list.
 */
export function addWord(lists, listId, typed) {
  const word = normalizeWord(typed);
  if (!validWord(word)) return { lists, error: "A word is letters only." };
  const owner = ownerOf(lists, word);
  if (owner !== null) {
    const name = lists.find((list) => list.id === owner)?.name ?? owner;
    return { lists, error: `Already on ${name}.` };
  }
  return {
    error: null,
    lists: lists.map((list) => (list.id === listId ? { ...list, words: [...list.words, { word }] } : list)),
  };
}

/** Takes a word off a list. */
export function removeWord(lists, listId, word) {
  return lists.map((list) => {
    if (list.id !== listId) return list;
    return { ...list, words: list.words.filter((entry) => entry.word !== word) };
  });
}

/** Sets a word's emoji, or takes it away when the parent leaves the field empty. */
export function setEmoji(lists, listId, word, typed) {
  const emoji = String(typed).trim();
  return editWord(lists, listId, word, (entry) => {
    const next = { ...entry };
    if (emoji === "") delete next.emoji;
    else next.emoji = emoji;
    return next;
  });
}

/** Gives a word a picture, which is drawn instead of its emoji. */
export function setImage(lists, listId, word, dataUrl) {
  return editWord(lists, listId, word, (entry) => ({ ...entry, image: dataUrl }));
}

/** Takes a word's picture away, leaving its emoji or its list's drawing. */
export function clearImage(lists, listId, word) {
  return editWord(lists, listId, word, (entry) => {
    const next = { ...entry };
    delete next.image;
    return next;
  });
}
