# Keysmash

A typing app for a two-year-old. Every key is written down, a deliberate press is answered with the letter's name, and the words the child makes are read back. It runs offline, keeps the word lists on the device, and gives the child no way out.

The behaviour is `docs/PRODUCT.md`, the screen is `docs/DESIGN.md`, and how it is built and served is `docs/SYSTEM.md`.

## Run it locally

```sh
bun install
bun run dev
```

Open the printed address in a real Chrome.

The dev server serves the app's source, which is enough to look at the screen. The service worker, and so the offline behaviour, exists only in a build:

```sh
bun run build
bun run preview
```

## Use it

One screen, the keyboard the only input. The parent's controls — full screen and settings — sit in the top corner while the app is not full screen; the settings control opens the settings page. While the app is full screen those controls are gone, and the page opens by holding the left and right Shift keys for three seconds.

Behind it: which word lists the app marks, the words on each of them, the emoji or the picture each word is drawn with, and a Restore that puts the built-in lists back.

## Checks

```sh
bun run check
```

Type-checks the app and the service worker, and runs the unit tests for the lists, words and numbers. The browser checks in `docs/SYSTEM.md` — a keypress writes its character inside 150 ms, a drag writes every character it passed, a held key gives one character, the settings page opens and edits the lists, and a reload with the network off opens the app — are run against a built copy in a real Chrome (`bun run build` then `bun run preview`); they are not part of the gate.
