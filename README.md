# Keysmash

A typing app for a two-year-old. Every key is written down, a deliberate press is answered with the letter's name, and the words the child makes are read back. It runs offline, stores nothing, and gives the child no way out.

The behaviour is `docs/PRODUCT.md`, the screen is `docs/DESIGN.md`, and how it is served is `docs/SYSTEM.md`.

## Run it locally

```sh
bun run scripts/serve.ts
```

Open the printed address in a real Chrome, so the service worker and the speech run as they will on the device.

## Use it

One screen, the keyboard the only input. The parent's controls — full screen and clear — sit in the top corner while the app is not full screen. The parent screen opens by holding the left and right Shift keys for three seconds; behind it are the word lists.

## Checks

```sh
bun run check
```

Type-checks and runs the unit tests for word and number matching. The browser checks in `docs/SYSTEM.md` — a keypress writes its character inside 150 ms, a drag writes every character it passed, a held key gives one character, and a reload with the network off opens the app — are run against a served copy in a real Chrome; they are not part of the gate.
