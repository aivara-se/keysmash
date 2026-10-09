# DESIGN.md — the screen

What the app draws and the values that are fixed. `PRODUCT.md` owns behaviour; this owns the pixels. A value not fixed here does not ship.

## the screen

One screen, the whole viewport, no chrome. The keyboard is the input; the only things drawn to tap are the parent's two controls in the top corner — a full-screen icon and a clear icon, black outlines, both gone while the app is full screen. The surface is white; the ink and the word colours are set below.

## padding

The text keeps clear of every edge: the screen is inset by its padding on all four sides.

## flow

- Text is left-aligned and anchored to the bottom of the padded area: the newest line sits on the bottom padding and older lines move up as the text grows.
- A new character is written at the caret; the text grows rightward and wraps at the right edge.
- A wrapped line starts back at the left edge, one line further up.
- When the text fills the padded area, the older lines leave at the top and the newest line stays on the bottom padding.

## aging

- The current line and anything below it are full ink. A line above the current one is lighter the further it sits from it, fading out over the few lines above the caret.
- The fade is continuous and follows the caret, not a step per line.

## the caret

- The caret is a bar in the ink, as thick as a word's outline and taller than it, centred on the text so it reaches above and below the letters. It is drawn immediately after the newest character.
- It moves with the text: every character is written before it.
- It pulses along a sine wave from full ink to none and back, one pulse every 1.6 seconds. It runs whatever the device's motion setting says.

## marking a real word

- A recognised word is enclosed in a rounded outline, drawn in the ink at the one stroke thickness — the same as the caret.
- The outline is the mark. The letters keep their normal weight, with no underline, and the mark is never carried by colour alone.
- The word inside reads with a capital first letter. That is a rendering of the mark only; the text the child typed is untouched.
- The word sits high in the pill: less room above the letters than below them.
- A pill is drawn as one piece: its emoji and its word never split across lines.
- A word that has an emoji is drawn with it inside the pill, before the word. A word with none is drawn with none.

## type and colour

- One text size, large, one sans-serif at its regular weight. Set and measured at build.
- Surface `#ffffff`. Ink `#000000`, for the text and for a word no list colours.
- One colour per list of words, and a word may name its own; the word's own wins, then its list's, then the ink. The outline takes the word's colour too.
- A number is drawn in its own colour, never a word's.
- Every colour is measured against the surface at build; no value ships unmeasured. Contrast against `#ffffff`:
  - animals `#b45309`, 5.02:1
  - fruit `#b91c1c`, 6.47:1
  - food `#c2410c`, 5.18:1
  - weather `#0369a1`, 5.93:1
  - vehicles `#6d28d9`, 7.10:1
  - toys `#be185d`, 6.04:1
  - home `#0f766e`, 5.47:1
  - people `#15803d`, 5.02:1
  - a number `#4338ca`, 7.90:1
