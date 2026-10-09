// Runs the checks a change is held to before handover. Both must pass.
import { $ } from "bun";

await $`bunx tsc --noEmit`;
await $`bun test`;
