# DESIGN.md — the screen

What the app draws and the values that are fixed. `PRODUCT.md` owns behaviour; this owns the pixels. A value not fixed here does not ship.

## the screen

One screen, the whole viewport, no chrome. Nothing drawn is tappable; the keyboard is the only input. The surface is white and the ink is greyscale only.

## the 2:1 point

The caret is pinned at the **2:1 point**: two-thirds across and two-thirds down. It is a thin bar in the current line's ink, one line tall. The newest character sits immediately left of it, so the newest character and the caret are both at the point.

## alignment and growth

- Text is right-aligned to the point's vertical line.
- A new character inserts immediately left of the caret; the line extends left and the caret does not move.
- A finished line leaves the point and rises, freeing the point for the next line.

## aging

- The line on the point is the current line, in the darkest shade. Each finished line takes the next shade as it rises: previous, then older.
- Three shades in all, given under type and colour.
- The oldest line drops out at the top.

## overflow

- The text column is the left two-thirds. A line fills it from the point leftward to its left edge.
- At the left edge the line is finished (rises, takes the next shade) and a new line starts at the point.
- The screen holds only what fits above the point; older lines are already gone.

## marking a real word

- A recognised word is enclosed in a rounded outline, drawn in that line's own ink.
- The outline is the mark. The letters keep their normal weight, with no underline, and the mark is never carried by colour alone.

## type and colour

- One text size, large, one sans-serif at its regular weight. Set and measured at build.
- Surface `#ffffff`. Ink, three shades: current `#000000`, previous `#a3a3a3`, older `#d4d4d4`.
- Every text pair is measured on its surface at build; no value ships unmeasured.

## reduced motion

- The fade is the only motion. Under `prefers-reduced-motion: reduce` a rising line snaps instead of fading.
