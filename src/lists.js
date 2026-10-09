/**
 * The word lists the parent picks from in settings. An allow-list: the app
 * marks and speaks only words on an active list, never "whatever letters
 * make". One small, safe list is on by default, so the app works when opened
 * (PRODUCT.md).
 */

export const DEFAULT_LIST_IDS = ["first-words"];

export const LISTS = [
  {
    id: "first-words",
    name: "First words",
    words: [
      "apple", "arm", "baby", "bag", "ball", "bat", "bed", "bee", "bell", "big",
      "bird", "boat", "book", "boot", "box", "boy", "bug", "bun", "bus", "cake",
      "can", "car", "cat", "clap", "cold", "cow", "cup", "dad", "day", "dog",
      "doll", "duck", "ear", "eat", "egg", "eye", "fish", "fly", "foot", "fox",
      "fun", "girl", "good", "hair", "hand", "hat", "hen", "hop", "hot", "ice",
      "jam", "jar", "jump", "key", "kid", "kite", "leg", "milk", "moon", "mum",
      "nose", "park", "pig", "play", "red", "run", "sing", "sit", "sun", "tall",
      "tea", "toy", "train", "tree", "two", "warm", "water", "wet",
    ],
  },
];

/** The union of the active lists' words, lower-cased. */
export function wordsFor(listIds) {
  const set = new Set();
  for (const list of LISTS) {
    if (!listIds.includes(list.id)) continue;
    for (const word of list.words) set.add(word.toLowerCase());
  }
  return set;
}
