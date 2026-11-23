# Keysmash

A typing app for a two-year-old. Every key is written down, a deliberate press is answered with the letter's name, and the words the child makes are read back. It runs offline, keeps the words on the device, and gives the child no way out.

## Setup

Bun 1.4.4 or newer.

```sh
bun install
bun run dev
```

The dev server has no service worker. Build and preview to exercise the offline shell:

```sh
bun run build
bun run preview
```

## Usage

One screen, the keyboard the only input. The parent's controls, full screen and settings, sit in the top corner and are gone in full screen, where holding both Shift keys for three seconds opens settings. The app marks English and the parent's own words, with the emoji or picture each is drawn with.

The behaviour is `docs/SPEC8N.md`; the values are `docs/DESIGN.md`.

Check a change the way the gate does:

```sh
bun run check
bun fmt --no-script --check .
```

A merge to `main` builds the site and publishes it to GitHub Pages.

## License

MIT
