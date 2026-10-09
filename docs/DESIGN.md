# DESIGN.md — the screen

What the app draws and the values that are fixed. `PRODUCT.md` owns behaviour; this owns the pixels. A value not fixed here does not ship.

## the screen

One screen, the whole viewport, no chrome. Nothing drawn is tappable; the keyboard is the only input.

## the 2:1 point

The caret is pinned at the **2:1 point**: two-thirds across and two-thirds down. The newest character always appears there.

## alignment and growth

- Text is right-aligned to the point's vertical line.
- A new character inserts at the caret; the line extends left and the caret does not move.
- A finished line leaves the point and rises, freeing the point for the next line.

## aging

- The current line is full ink. A finished line fades in steps as it rises.
- Two steps beyond the current line: previous, then older (the concept's three shades).
- The oldest line drops out at the top.

## overflow

- The text column is the left two-thirds. A line fills it from the point leftward to its left edge.
- At the left edge the line is finished (rises, fades) and a new line starts at the point.
- The screen holds only what fits above the point; older lines are already gone.

## marking a real word

- A recognised word's letters are drawn heavier than the rest and underlined, so marking survives without colour.
- A marked word is never signalled by colour alone.

## type and colour

- One text size, large. Set and measured at build.
- Every text pair is measured on its surface at build; no value ships unmeasured.

## reduced motion

- The fade is the only motion. Under `prefers-reduced-motion: reduce` a rising line snaps instead of fading.
