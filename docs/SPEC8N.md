# Specification

## Direction

Keysmash is a typing screen for a two-year-old whose parent has handed over the device and wants it back unchanged. The parent sets the goal; the app keeps the child's words on the device and gives the child no way out. This version is one screen, English and the parent's own words, offline and installed. A second language, a parent dashboard and reading the marks back are later. Lessons, levels, scoring, rewards, accounts, sync, servers, analytics, ads and any request that leaves the device are out.

## Requirements

One screen fills the viewport and the keyboard is the only input. Every character key writes its character as it goes down; the system's auto-repeat writes one character, not many. A letter is named only when no other letter follows within 150 ms. Half a second after the child stops, every word the language holds and every number is marked, and a new mark is spoken once. A mark takes its own colour, its emoji's, or the plain ink, and draws its emoji or picture inside its pill. A number keeps its own colour and is read as a name: a digit alone is "three", digits in a row are one number. A completed word takes one space, the only character the app adds. The parent adds a word, gives it an emoji or picture, and removes it; a word the language already holds is refused, naming the language. The parent's only controls are full screen and settings; in full screen, holding both Shift keys for three seconds opens settings. Nothing edits a character already written, and the text is gone when the app closes. Storage is the device's alone.

## Architecture

GitHub Pages serves the static files `bun run build` emits. The shell is one client-rendered SvelteKit page, prerendered to `index.html` and to `404.html`, which Pages answers for any path. Behind the screen sit four parts: the mark reads the text against the packs and colours it; the store keeps the packs, emoji and pictures in IndexedDB and the language in localStorage; speech names a letter with the device's local voice, or the committed clips when there is none; the service worker precaches the shell, packs and clips. The child's text lives in memory and is written nowhere. Build-time dependencies are Bun, Vite, Svelte 5 and the static adapter; the device supplies speech or the clips, and espeak-ng regenerates the clips. The gate is `bun run check`, the format check, and the organisation's document, entry-file and settings checks.
