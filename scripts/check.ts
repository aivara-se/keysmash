// Runs the checks a change is held to before handover. All must pass.
import { $ } from "bun";

// The types `$app/*` and the `#lib` alias resolve through are generated.
await $`bunx svelte-kit sync`;
await $`bunx svelte-check --tsconfig ./tsconfig.json --output human`;
// The service worker runs in its own context, with the web worker types rather
// than the page's, so it is type-checked by its own config.
await $`bunx tsc --noEmit -p ./src/service-worker/tsconfig.json`;
await $`bun test`;
