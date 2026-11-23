# Design System

The interface is one flat white surface with black ink. A word's colour is the one it names, else the one its emoji names, else the ink.

## Colours

The surface is `#ffffff`. The plain ink is `#000000`, for the text and for a word that names no colour. The palette below is the ink a pill can be drawn in; every value is measured against the surface.

| Token    | Hex       | Contrast on `#ffffff` | Used for                                        |
| -------- | --------- | --------------------- | ----------------------------------------------- |
| `red`    | `#b91c1c` | 6.47:1                | a word that names red, or an emoji that does    |
| `orange` | `#c2410c` | 5.18:1                | a word that names orange, or an emoji that does |
| `amber`  | `#b45309` | 5.02:1                | a word that names amber, or an emoji that does  |
| `yellow` | `#a16207` | 4.92:1                | a word that names yellow, or an emoji that does |
| `green`  | `#15803d` | 5.02:1                | a word that names green, or an emoji that does  |
| `teal`   | `#0f766e` | 5.47:1                | a word that names teal, or an emoji that does   |
| `sky`    | `#0369a1` | 5.93:1                | a word that names sky, or an emoji that does    |
| `blue`   | `#1d4ed8` | 6.70:1                | a word that names blue, or an emoji that does   |
| `indigo` | `#4338ca` | 7.90:1                | a word that names indigo, or an emoji that does |
| `violet` | `#6d28d9` | 7.10:1                | a word that names violet, or an emoji that does |
| `pink`   | `#be185d` | 6.04:1                | a word that names pink, or an emoji that does   |
| `brown`  | `#78350f` | 9.07:1                | a word that names brown, or an emoji that does  |
| `slate`  | `#475569` | 7.58:1                | a word that names slate, or an emoji that does  |
| `number` | `#4338ca` | 7.90:1                | every number, so it never reads as a word       |

## Typography

One family, `system-ui, sans-serif`, at its regular weight; no font is downloaded.

| Role            | Size                         | Line   | Tracking | Word spacing | Used for                                   |
| --------------- | ---------------------------- | ------ | -------- | ------------ | ------------------------------------------ |
| screen text     | `12vmin`                     | 2.2    | 0.06em   | 0.08em       | the child's text and its marks             |
| settings page   | `clamp(17px, 2.4vmin, 26px)` | 1.5    | —        | —            | the parent's page                          |
| settings pills  | `12vmin`                     | normal | —        | —            | the parent's words, as the child sees them |
| settings panel  | `clamp(14px, 1.8vmin, 20px)` | 1.2    | —        | —            | the emoji and picture controls             |
| section heading | `1.2em`                      | —      | —        | —            | My words                                   |

## Spacing

The base unit is the viewport minimum at the screen and `em` inside text, so both grow with the surface they sit on.

| Step      | Used for                                   |
| --------- | ------------------------------------------ |
| `7vmin`   | the screen's and the settings page's inset |
| `3vmin`   | the corner controls' offset                |
| `2vmin`   | the corner controls' gap                   |
| `4.5vmin` | a corner control's size                    |
| `0.3em`   | the gap between pills                      |
| `0.5em`   | the gap between a picker's controls        |
| `8px`     | the pill outline and the caret             |
| `2px`     | the settings page's control outlines       |
