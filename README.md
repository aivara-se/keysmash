# Keysmash

A typing app for a two-year-old. Every key is written down, a deliberate press is answered with the letter's name, and the words the child makes are read back. It runs offline, keeps the word lists on the device, and gives the child no way out.

The behaviour is `docs/PRODUCT.md`, the screen is `docs/DESIGN.md`, and how it is served is `docs/SYSTEM.md`.

## Run it locally

```sh
bun run scripts/serve.ts
```

Open the printed address in a real Chrome, so the service worker and the speech run as they will on the device.

## Use it

One screen, the keyboard the only input. The parent's controls — full screen and settings — sit in the top corner while the app is not full screen; the settings control opens the settings page. While the app is full screen those controls are gone, and the page opens by holding the left and right Shift keys for three seconds.

Behind it: which word lists the app marks, the words on each of them, the emoji or the picture each word is drawn with, and a Restore that puts the built-in lists back.

## Checks

```sh
bun run check
```

Type-checks and runs the unit tests for the lists, words and numbers. The browser checks in `docs/SYSTEM.md` — a keypress writes its character inside 150 ms, a drag writes every character it passed, a held key gives one character, the settings page opens and edits the lists, and a reload with the network off opens the app — are run against a served copy in a real Chrome; they are not part of the gate.
