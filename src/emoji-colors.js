/**
 * The colour a word takes from its emoji, where the emoji's own colour is the
 * thing's colour: an apple is red, a frog is green, a banana is yellow.
 *
 * An emoji is left out when its colour says nothing about the word — a figure
 * is skin-coloured whatever the word is, a book or a balloon is drawn in
 * whatever colour the font felt like, and a robot is grey. Those words take
 * their list's colour instead, or the ink.
 *
 * The names are palette keys; the values are in `styles.css` (DESIGN.md).
 */
export const EMOJI_COLORS = {
  // animals
  "🐱": "amber", "🐶": "amber", "🐮": "slate", "🐷": "pink", "🦆": "green",
  "🐔": "red", "🐤": "yellow", "🐦": "blue", "🦉": "brown", "🐟": "sky",
  "🦀": "red", "🐳": "sky", "🐬": "sky", "🐸": "green", "🐍": "green",
  "🐢": "green", "🐌": "amber", "🐝": "yellow", "🐜": "brown", "🐛": "green",
  "🕷️": "slate", "🐻": "brown", "🦁": "amber", "🐯": "orange", "🦊": "orange",
  "🐭": "slate", "🐰": "slate", "🐴": "brown", "🐑": "slate", "🐐": "slate",
  "🐵": "brown", "🐘": "slate", "🐧": "slate", "🦇": "slate", "🦌": "amber",
  "🐿️": "amber", "🦔": "amber", "🐓": "red",
  // fruit and vegetables
  "🍎": "red", "🍌": "yellow", "🍊": "orange", "🍋": "yellow", "🍑": "pink",
  "🍒": "red", "🍇": "violet", "🍈": "green", "🍐": "green", "🥭": "orange",
  "🥝": "green", "🍅": "red", "🥥": "brown", "🍍": "yellow", "🍉": "green",
  "🍓": "red", "🫐": "blue", "🫒": "green", "🥑": "green", "🌰": "brown",
  "🥕": "orange", "🌽": "yellow", "🍄": "red", "🫛": "green",
  // food
  "🍞": "amber", "🥛": "slate", "🥚": "slate", "🍰": "pink", "🍪": "amber",
  "🧀": "yellow", "🍯": "amber", "🍕": "orange", "🍲": "orange", "🍚": "slate",
  "🍜": "orange", "🧈": "yellow", "🧂": "slate", "🍳": "yellow", "🧃": "orange",
  "🍬": "pink", "🍫": "brown", "🍿": "yellow",
  // weather and sky
  "☀️": "yellow", "🌙": "yellow", "⭐": "yellow", "☁️": "slate", "🌧️": "sky",
  "❄️": "sky", "🌬️": "sky", "⛈️": "slate", "🧊": "sky", "🌫️": "slate",
  "⛄": "slate", "☄️": "orange", "🔥": "orange", "💧": "sky", "☂️": "violet",
  "🧤": "brown", "🥾": "brown",
  // vehicles
  "🚗": "red", "🚌": "orange", "🚂": "slate", "⛵": "slate", "🚢": "slate",
  "✈️": "sky", "🚀": "red", "🚲": "slate", "🚚": "blue", "🚜": "green",
  "🚕": "yellow", "🚁": "red", "🚑": "red", "🛴": "slate", "🛷": "orange",
  "🛶": "orange", "🛞": "slate",
  // toys and play
  "⚽": "slate", "🧸": "amber", "🪆": "red", "🧱": "orange", "🪁": "red",
  "🥁": "red", "🎈": "red", "🧩": "green", "🔔": "yellow", "🖍️": "red",
  "🤖": "slate", "📖": "blue", "🎮": "slate", "🎲": "slate", "🎸": "orange",
  "🎵": "blue", "🎟️": "orange",
  // home and things
  "🏠": "red", "🚪": "orange", "🛏️": "sky", "🪑": "orange", "🥤": "sky",
  "🥄": "slate", "🧦": "sky", "👟": "sky", "🧢": "sky", "🧥": "green",
  "🔑": "yellow", "💡": "yellow", "🕐": "sky", "📞": "slate", "📦": "amber",
  "👜": "amber", "🧼": "pink", "🧹": "yellow", "🌳": "green", "🌸": "pink",
  "🍃": "green", "🪣": "sky", "🧺": "amber", "🕯️": "yellow",
  // people and me — only where the emoji is not just a skin tone
  "❤️": "red", "💋": "red", "🦷": "slate", "👁️": "slate",
  // doing words
  "🎤": "slate", "😢": "sky", "🥵": "red", "🥶": "sky",
};
