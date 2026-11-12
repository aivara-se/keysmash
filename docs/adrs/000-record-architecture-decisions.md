# 000 - Record Architecture Decisions

## Context

Keysmash is one static page, changed by agents, and a change outlives the turn that made it. The choices behind it — no build at run time, nothing asked of another origin, the word packs as data — are decisions a later reader must be able to find, and their status must not depend on anyone's memory.

## Decision

We record one significant architectural decision per file in `docs/adrs`, as Markdown. A decision is **Accepted** when its file is merged into `main`, and **In Review** while its pull request is open. An accepted record is not edited: a decision that contradicts it is a new record that names the clauses it overrides, and the old file stays as the account of what was believed then.

An ADR is written before the code that depends on it, and it says what the choice costs, not only what it buys.

## Consequences

- The why behind a choice is searchable and outlives the agent who made it.
- A reader can tell which decisions are live and which are history.
- A decision that inverts costs a new file rather than a rewrite, so the record keeps its history.
