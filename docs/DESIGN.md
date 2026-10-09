# DESIGN.md — the screen

What the app draws and the values that are fixed. `PRODUCT.md` owns behaviour; this owns the pixels. A value not fixed here does not ship.

## the screen

One screen, the whole viewport, no chrome. Nothing drawn is tappable; the keyboard is the only input. The surface is white and the ink is greyscale only.

## padding

The text keeps clear of every edge: the screen is inset by its padding on all four sides.

## flow

- Text is left-aligned and starts at the top left of the padded area.
- A new character is written at the caret; the text grows rightward and wraps at the right edge.
- A wrapped line starts back at the left edge, one line down.
- When the text passes the bottom of the padded area, the screen scrolls up so the newest line stays in view; older lines leave at the top.

## the caret

- The caret is a thin bar in the ink, one text-height tall, drawn immediately after the newest character.
- It moves with the text: every character is written before it. It does not blink.

## marking a real word

- A recognised word is enclosed in a rounded outline, drawn in the ink.
- The outline is the mark. The letters keep their normal weight, with no underline, and the mark is never carried by colour alone.

## type and colour

- One text size, large, one sans-serif at its regular weight. Set and measured at build.
- Surface `#ffffff`. Ink `#000000`.
- Every text pair is measured on its surface at build; no value ships unmeasured.
