# Agent Instructions

Keysmash is a typing app for a two-year-old: every key the child presses is written down, a deliberate press is answered with the letter's name, and the words the child has made are read back. It is one static page, it runs with the network off, and the child has no way out of it.

This file is the `aivara-se` agent convention: the rules that hold in every repository. Adopt it, do not fork it. It never describes the state of the work — that lives in the documents below.

## Where a fact lives

- `docs/PRODUCT.md` — what the app is, who it serves, what it must not do, and what would make it done.
- `docs/SYSTEMS.md` — how it is built, stored and served, and what it does when a part fails.
- `docs/DESIGN.md` — the screen and the values it fixes.
- `README.md` — how to run it locally.

One fact, one home: link to a document, never restate it. A sentence here that starts describing the work instead of how work is done belongs in `PRODUCT.md`.

## House rules

- **Never** break a rule `PRODUCT.md` fixes: nothing typed is withheld, cleared or rewritten, and the parent's actions never edit a character the child typed.
- **Never** add a request off the device — no CDN, no font host, no analytics, no third-party script. A file the app needs is vendored in the tree or it does not ship.
- **Never** choose a voice that needs the network: speech is the device's own local voice, or the committed clips in `static/clips/`.
- **Measure the answer budget, do not assume it.** Every character is written as its key goes down and a letter is named only after 150 ms of quiet; both are measured in a real Chrome against a built copy.
- **A word pack is data**, under `static/lists/`, named in `index.json`. Adding words is not a code change.

## Tooling

- **Bun runs the scripts.** A script that runs commands is TypeScript, run with `bun run scripts/<name>.ts` — never Python, and a shell script only when it stays a few lines. A command typed at the prompt is not a script.
- **Never** add a second package manager, lockfile, formatter or test runner. The toolchain is the one the repository already declares.
- **Never** report "tests pass", "it builds" or "verified" without the command and the tree it ran against.

## Skills

The organisation's skills live in `aivara-se/.agents/skills` and every agent reads them from there; a repository carries no copy. Each declares a `when-to-use`: open the one that covers the work before starting it.

## Verify before pushing

```bash
bun install --frozen-lockfile
bun fmt --no-script --check .   # names every file the formatter would rewrite
bun run check    # svelte-check, tsc over the service worker, and the unit tests
bun run build    # vite build, and the checks the build reruns
```

Run the whole sequence and read every result — the last exit code says nothing about the first.

What no script can see — a keypress inside 150 ms, a drag written in full, a held key, the settings page, a reload with the network off — is `docs/SYSTEMS.md` § Failure modes and the browser pass in `README.md` § Checks: a real Chrome against `bun run build` then `bun run preview`.

The same commands run in `.github/workflows/validate.yml`, whose job is named `validate` — the name the organisation's baseline requires a check under before a merge.

## Version Control

- **Branches**: lowercase, hyphens, one per task: `docs/`, `feat/`, `fix/` or `chore/` and a short name — `docs/adopt-agents-config`, `fix-log-timezone`. No uppercase, no underscores, no personal prefixes.
- **Commits**: Conventional Commits, lowercase, single line, no scopes — `type: short description`.
- **Never** commit to `main` directly, and **never** force-push a branch someone else has seen.
- Keep history linear: no merge commits, no empty commits, no work-in-progress commits.
- Commit under your own identity, never another agent's.
- Remote work is a branch plus a pull request: the body says what changed, what was verified and how, and what was left out. Leave the tree clean.
- Request review from the operator (`thani-sh`) alone for a documents-only change, and from the operator and one peer agent for an implementation one.
