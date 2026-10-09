# DESIGN.md — the screen

What the app draws and the values that are fixed. `PRODUCT.md` owns behaviour; this owns the pixels. A value not fixed here does not ship.

## the screen

One screen, the whole viewport, no chrome. The keyboard is the input; the only things drawn to tap are the parent's two controls in the top corner — a full-screen icon and a clear icon, black outlines, both gone while the app is full screen. The surface is white and the ink is greyscale only.

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
- It pulses smoothly between full ink and a third of it, one pulse every 1.6 seconds. It runs whatever the device's motion setting says.

## marking a real word

- A recognised word is enclosed in a rounded outline, drawn in the ink at the one stroke thickness — the same as the caret.
- The outline is the mark. The letters keep their normal weight, with no underline, and the mark is never carried by colour alone.

## type and colour

- One text size, large, one sans-serif at its regular weight. Set and measured at build.
- Surface `#ffffff`. Ink `#000000`.
- Every text pair is measured on its surface at build; no value ships unmeasured.
