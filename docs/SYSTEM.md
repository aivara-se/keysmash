# SYSTEM.md — how the app is served

Everything static: the repository is the app, the committed files are the published files, and nothing builds between them.

## hosting

- Host: GitHub Pages (`aivara-se/keysmash`), branch `main`, folder `/`.
- Build: none — no bundler, no transpiler, no lockfile.
- Backend: none — no server, no database, no API, no analytics.
- TLS: GitHub-managed.
- A merge to `main` is a deploy; Pages rebuilds in about a minute, so there is no staging step.

## the shell

- One page fills the viewport. Nothing navigates; the child is given no second screen.
- The only third-party file, if any, is vendored in the repository, pinned and hashed, with its licence beside it — never a CDN. The app promises no third-party request, and a CDN is one more thing that must be up for it to work offline.
- Keyboard input is the browser's own key events. The system's key auto-repeat is ignored (the event's own repeat flag), which is what "a held key gives one babble, no repeat" means in code.

## speech

- Speech is the device's own speech synthesis (Web Speech API). One local voice is chosen at start and held; a voice that needs the network is never used, because the app runs with the network off.
- The requirement a voice must meet: a letter begins within 150 ms of the key, measured, with the network off. If no local voice holds that, the letters ship as pre-recorded clips, and the clips are then the mechanism.
- The voice chosen, and the latency it measured, are recorded here.

## offline

- A service worker precaches the shell — the files the app needs to boot and draw its one screen — so the app opens with the network off.
- The shell list names that screen and is closed under its imports. A change to a file in it, or to the list, bumps the cache name in the same commit, or a returning device keeps the old file.

## storage

- The parent's settings — the active word lists — live in the visitor's `localStorage`, on the device.
- The child's text is never stored; it is gone when the app closes.

## the kiosk

- The parent opens the app in a kiosk so the child cannot leave it. On a desktop Chrome that is a kiosk launch:

```sh
chrome --kiosk https://aivara-se.github.io/keysmash/
```

- Without the kiosk step the app cannot keep the child from the OS, and it says so in its own instructions.

## checks

There is no build, so nothing here needs a browser for the site to exist. What a change is held to, run against a served copy in a real Chrome:

- a keypress speaks the letter name and writes it, within the 150 ms budget, measured;
- a replayed drag across the keyboard is silent and writes nothing;
- a held key gives one letter;
- a reload with the network off opens the app;
- no console error.

Screenshots are looked at; a check does not prove a screen is right to a child.
