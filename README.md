# Keysmash

A typing app for a two-year-old. A deliberate keypress gets an answer — the letter is spoken and written; a hand dragged across the keyboard gets nothing. It runs offline, stores nothing, and gives the child no way out.

The behaviour is `docs/PRODUCT.md`, the screen is `docs/DESIGN.md`, and how it is served is `docs/SYSTEM.md`.

## Run it locally

```sh
bun run scripts/serve.ts
```

Open the printed address in a real Chrome, so the service worker and the speech run as they will on the device.

## Use it

One screen, the keyboard the only input. The parent starts it from its own screen and leaves by holding the left and right Shift keys for three seconds; behind that are the word lists and Stop.

## Checks

```sh
bun run check
```

Type-checks and runs the unit tests for the babble/mash rules and the word matching. The browser checks in `docs/SYSTEM.md` — a keypress writes the letter inside 150 ms, a drag is silent, a held key gives one letter, and a reload with the network off opens the app — are run against a served copy in a real Chrome; they are not part of the gate.
