# DESIGN.md — the screen

What the app draws and the values that are fixed. `PRODUCT.md` owns behaviour; this owns the pixels. A value not fixed here does not ship.

## the screen

One screen, the whole viewport, no chrome. The keyboard is the input; the only things drawn to tap are the parent's two controls in the top corner — a full-screen icon and a settings icon, black outlines, both gone while the app is full screen. The surface is white; the ink and the word colours are set below.

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

## a word's picture

- A word the parent has given a picture is drawn with the picture in the emoji's place, inside the pill before the word. The picture or the emoji, never both.
- It is drawn as a circle `1em` across: a square box the picture fills, so whatever its shape it is cropped to its middle rather than squeezed to fit a circle. Measured: a pill is 152.6px tall whether its word is drawn with an emoji, with a picture, or with neither, so a picture cannot change a pill's height or where a line wraps.
- It sits on the text's baseline, dropped `0.08em`, and holds a `0.12em` gap before the word — the emoji's gap.
- It is an element carrying no text, so the pill still holds exactly the characters the child typed.

## the settings page

The parent's page. It covers the play screen and is the app's own surface: white, the ink black, nothing else.

- One text size for the page, `clamp(17px, 2.4vmin, 26px)`; the title is `1.7em` of it and a list's name `1.2em`.
- The page's rules and every control's outline are one weight, `2px`, and every control the parent presses is an outline and a word: no fill, no colour, no shadow.
- A list shows its name, whether it is on, how many words it holds, and one control that opens its words.
- A word shows its letters; its emoji, in a field the parent can change; its picture, as a thumbnail, when it has one; and the controls that give it a picture, take the picture off, and take the word off the list.
- The page scrolls. It is the one screen in the app that holds more than a screenful.

## type and colour

- One text size, large, one sans-serif at its regular weight. Set and measured at build.
- Surface `#ffffff`. Ink `#000000`, for the text and for a word no list colours.
- A word's colour is the one it names for itself, else the one its emoji names, else its list's, else the ink. The outline takes the word's colour too.
- It takes its emoji's colour where that colour is the thing's colour, so an apple is red and a frog is green. Where the emoji says nothing about the word — a figure is skin-coloured whatever the word is, a book is drawn in whatever colour the font chose — the word keeps its list's colour.
- A number is drawn in its own colour, never a word's.
- Every colour is measured against the surface at build; no value ships unmeasured. Contrast against `#ffffff`:
  - red `#b91c1c`, 6.47:1
  - orange `#c2410c`, 5.18:1
  - amber `#b45309`, 5.02:1
  - yellow `#a16207`, 4.92:1
  - green `#15803d`, 5.02:1
  - teal `#0f766e`, 5.47:1
  - sky `#0369a1`, 5.93:1
  - blue `#1d4ed8`, 6.70:1
  - indigo `#4338ca`, 7.90:1
  - violet `#6d28d9`, 7.10:1
  - pink `#be185d`, 6.04:1
  - brown `#78350f`, 9.07:1
  - slate `#475569`, 7.58:1
  - a number `#4338ca`, 7.90:1
