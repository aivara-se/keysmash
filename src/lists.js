import { EMOJI_COLORS } from "./emoji-colors.js";

/**
 * The word lists the parent picks from in settings. An allow-list: the app
 * marks and speaks only words on an active list, never "whatever letters
 * make" (PRODUCT.md).
 *
 * Each list carries the colour its words are drawn in, and each word may carry
 * its own to override it. A word with no colour at all is drawn in the plain
 * ink, and a word with no emoji is drawn without one. The colour names are
 * keys: the values, and their measured contrast, live in `styles.css` and
 * `docs/DESIGN.md`.
 */

export const DEFAULT_LIST_IDS = ["animals", "fruit", "toys"];

/**
 * The colour keys a word or a list may name. The values, and their measured
 * contrast against the surface, are in `styles.css` and `docs/DESIGN.md`.
 */
export const COLORS = ["red", "orange", "amber", "yellow", "green", "teal", "sky", "blue", "indigo", "violet", "pink", "brown", "slate"];

/**
 * @typedef {{ word: string, emoji?: string, color?: string }} WordEntry
 * @typedef {{ id: string, name: string, color?: string, words: WordEntry[] }} WordList
 */

/** @type {WordList[]} */
export const LISTS = [
  {
    id: "animals",
    name: "Animals",
    color: "amber",
    words: [
      { word: "cat", emoji: "🐱" }, { word: "dog", emoji: "🐶" }, { word: "cow", emoji: "🐮" },
      { word: "pig", emoji: "🐷" }, { word: "duck", emoji: "🦆" }, { word: "hen", emoji: "🐔" },
      { word: "chick", emoji: "🐤" }, { word: "bird", emoji: "🐦" }, { word: "owl", emoji: "🦉" },
      { word: "fish", emoji: "🐟" }, { word: "crab", emoji: "🦀" }, { word: "whale", emoji: "🐳" },
      { word: "dolphin", emoji: "🐬" }, { word: "frog", emoji: "🐸" }, { word: "snake", emoji: "🐍" },
      { word: "turtle", emoji: "🐢" }, { word: "snail", emoji: "🐌" }, { word: "bee", emoji: "🐝" },
      { word: "ant", emoji: "🐜" }, { word: "bug", emoji: "🐛" }, { word: "spider", emoji: "🕷️" },
      { word: "butterfly", emoji: "🦋", color: "sky" }, { word: "bear", emoji: "🐻" }, { word: "lion", emoji: "🦁" },
      { word: "tiger", emoji: "🐯" }, { word: "fox", emoji: "🦊" }, { word: "mouse", emoji: "🐭" },
      { word: "rabbit", emoji: "🐰" }, { word: "horse", emoji: "🐴" }, { word: "sheep", emoji: "🐑" },
      { word: "goat", emoji: "🐐" }, { word: "monkey", emoji: "🐵" }, { word: "elephant", emoji: "🐘" },
      { word: "penguin", emoji: "🐧" }, { word: "bat", emoji: "🦇" }, { word: "deer", emoji: "🦌" },
      { word: "squirrel", emoji: "🐿️" }, { word: "hedgehog", emoji: "🦔" }, { word: "rooster", emoji: "🐓" },
    ],
  },
  {
    id: "fruit",
    name: "Fruit and vegetables",
    color: "red",
    words: [
      { word: "apple", emoji: "🍎" }, { word: "banana", emoji: "🍌" }, { word: "orange", emoji: "🍊" },
      { word: "lemon", emoji: "🍋" }, { word: "peach", emoji: "🍑" }, { word: "cherry", emoji: "🍒" },
      { word: "grape", emoji: "🍇" }, { word: "melon", emoji: "🍈" }, { word: "pear", emoji: "🍐" },
      { word: "mango", emoji: "🥭" }, { word: "kiwi", emoji: "🥝" }, { word: "tomato", emoji: "🍅" },
      { word: "coconut", emoji: "🥥" }, { word: "pineapple", emoji: "🍍" }, { word: "watermelon", emoji: "🍉" },
      { word: "strawberry", emoji: "🍓" }, { word: "blueberry", emoji: "🫐" }, { word: "olive", emoji: "🫒" },
      { word: "avocado", emoji: "🥑" }, { word: "chestnut", emoji: "🌰" }, { word: "carrot", emoji: "🥕" },
      { word: "corn", emoji: "🌽" }, { word: "mushroom", emoji: "🍄" }, { word: "pea", emoji: "🫛" },
    ],
  },
  {
    id: "food",
    name: "Food",
    color: "orange",
    words: [
      { word: "bread", emoji: "🍞" }, { word: "milk", emoji: "🥛" }, { word: "egg", emoji: "🥚" },
      { word: "cake", emoji: "🍰" }, { word: "cookie", emoji: "🍪" }, { word: "cheese", emoji: "🧀" },
      { word: "honey", emoji: "🍯" }, { word: "pizza", emoji: "🍕" }, { word: "soup", emoji: "🍲" },
      { word: "rice", emoji: "🍚" }, { word: "noodle", emoji: "🍜" }, { word: "butter", emoji: "🧈" },
      { word: "salt", emoji: "🧂" }, { word: "pan", emoji: "🍳" }, { word: "juice", emoji: "🧃" },
      { word: "candy", emoji: "🍬" }, { word: "chocolate", emoji: "🍫" }, { word: "popcorn", emoji: "🍿" },
    ],
  },
  {
    id: "weather",
    name: "Weather and sky",
    color: "sky",
    words: [
      { word: "sun", emoji: "☀️" }, { word: "moon", emoji: "🌙" }, { word: "star", emoji: "⭐" },
      { word: "cloud", emoji: "☁️" }, { word: "rain", emoji: "🌧️" }, { word: "snow", emoji: "❄️" },
      { word: "wind", emoji: "🌬️" }, { word: "storm", emoji: "⛈️" }, { word: "rainbow", emoji: "🌈" },
      { word: "ice", emoji: "🧊" }, { word: "fog", emoji: "🌫️" }, { word: "snowman", emoji: "⛄" },
      { word: "comet", emoji: "☄️" }, { word: "fire", emoji: "🔥" }, { word: "water", emoji: "💧" },
      { word: "umbrella", emoji: "☂️" }, { word: "gloves", emoji: "🧤" }, { word: "boots", emoji: "🥾" },
    ],
  },
  {
    id: "vehicles",
    name: "Vehicles",
    color: "blue",
    words: [
      { word: "car", emoji: "🚗" }, { word: "bus", emoji: "🚌" }, { word: "train", emoji: "🚂" },
      { word: "boat", emoji: "⛵" }, { word: "ship", emoji: "🚢" }, { word: "plane", emoji: "✈️" },
      { word: "rocket", emoji: "🚀" }, { word: "bike", emoji: "🚲" }, { word: "truck", emoji: "🚚" },
      { word: "tractor", emoji: "🚜" }, { word: "taxi", emoji: "🚕" }, { word: "helicopter", emoji: "🚁" },
      { word: "ambulance", emoji: "🚑" }, { word: "scooter", emoji: "🛴" }, { word: "sled", emoji: "🛷" },
      { word: "canoe", emoji: "🛶" }, { word: "sailboat", emoji: "⛵" }, { word: "wheel", emoji: "🛞" },
    ],
  },
  {
    id: "toys",
    name: "Toys and play",
    color: "pink",
    words: [
      { word: "ball", emoji: "⚽" }, { word: "teddy", emoji: "🧸" }, { word: "doll", emoji: "🪆" },
      { word: "block", emoji: "🧱" }, { word: "kite", emoji: "🪁" }, { word: "drum", emoji: "🥁" },
      { word: "balloon", emoji: "🎈" }, { word: "puzzle", emoji: "🧩" }, { word: "bell", emoji: "🔔" },
      { word: "paint", emoji: "🎨" }, { word: "crayon", emoji: "🖍️" }, { word: "robot", emoji: "🤖" },
      { word: "book", emoji: "📖" }, { word: "game", emoji: "🎮" }, { word: "dice", emoji: "🎲" },
      { word: "guitar", emoji: "🎸" }, { word: "song", emoji: "🎵" }, { word: "ticket", emoji: "🎟️" },
    ],
  },
  {
    id: "home",
    name: "Home and things",
    color: "green",
    words: [
      { word: "house", emoji: "🏠" }, { word: "door", emoji: "🚪" }, { word: "bed", emoji: "🛏️" },
      { word: "chair", emoji: "🪑" }, { word: "cup", emoji: "🥤" }, { word: "spoon", emoji: "🥄" },
      { word: "sock", emoji: "🧦" }, { word: "shoe", emoji: "👟" }, { word: "hat", emoji: "🧢" },
      { word: "coat", emoji: "🧥" }, { word: "key", emoji: "🔑" }, { word: "light", emoji: "💡" },
      { word: "clock", emoji: "🕐" }, { word: "phone", emoji: "📞" }, { word: "box", emoji: "📦" },
      { word: "bag", emoji: "👜" }, { word: "soap", emoji: "🧼" }, { word: "broom", emoji: "🧹" },
      { word: "tree", emoji: "🌳" }, { word: "flower", emoji: "🌸" }, { word: "leaf", emoji: "🍃" },
      { word: "bucket", emoji: "🪣" }, { word: "basket", emoji: "🧺" }, { word: "candle", emoji: "🕯️" },
    ],
  },
  {
    id: "people",
    name: "People and me",
    color: "violet",
    words: [
      { word: "mama", emoji: "👩" }, { word: "papa", emoji: "👨" }, { word: "baby", emoji: "👶" },
      { word: "boy", emoji: "👦" }, { word: "girl", emoji: "👧" }, { word: "hand", emoji: "✋" },
      { word: "foot", emoji: "🦶" }, { word: "eye", emoji: "👁️" }, { word: "ear", emoji: "👂" },
      { word: "nose", emoji: "👃" }, { word: "mouth", emoji: "👄" }, { word: "tooth", emoji: "🦷" },
      { word: "arm", emoji: "💪" }, { word: "leg", emoji: "🦵" }, { word: "face", emoji: "🙂" },
      { word: "hair" }, { word: "nail" }, { word: "heart", emoji: "❤️" },
    ],
  },
  {
    id: "actions",
    name: "Doing words",
    words: [
      { word: "eat", emoji: "🍽️" }, { word: "sleep", emoji: "😴" }, { word: "run", emoji: "🏃" },
      { word: "jump", emoji: "🤸" }, { word: "walk", emoji: "🚶" }, { word: "sing", emoji: "🎤" },
      { word: "sit", emoji: "🪑" }, { word: "clap", emoji: "👏" }, { word: "wash", emoji: "🧼" },
      { word: "read", emoji: "📖" }, { word: "play" }, { word: "lips", emoji: "💋" },
      { word: "cry", emoji: "😢" }, { word: "big" }, { word: "small" }, { word: "hot", emoji: "🥵" },
      { word: "cold", emoji: "🥶" }, { word: "wet" }, { word: "good" }, { word: "tall" },
    ],
  },
];

/** The words of the active lists, lower-cased, each with its emoji and colour. */
export function wordsFor(listIds) {
  const words = new Map();
  for (const list of LISTS) {
    if (!listIds.includes(list.id)) continue;
    for (const entry of list.words) {
      words.set(entry.word.toLowerCase(), {
        emoji: entry.emoji,
        color: entry.color ?? EMOJI_COLORS[entry.emoji] ?? list.color,
      });
    }
  }
  return words;
}
