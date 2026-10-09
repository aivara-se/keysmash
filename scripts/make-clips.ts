// Regenerates the letter clips. Run: bun run scripts/make-clips.ts
// Requires espeak-ng on PATH. The clips are the letters' voice on a device
// with no local speech voice (SYSTEM.md).
import { $ } from "bun";
import { mkdir } from "node:fs/promises";

const LETTERS = "abcdefghijklmnopqrstuvwxyz";
const OUT = new URL("../clips/", import.meta.url).pathname;

await mkdir(OUT, { recursive: true });
for (const letter of LETTERS) {
  await $`espeak-ng -p 20 -s 140 -w ${`${OUT}${letter}.wav`} ${letter.toUpperCase()}`.quiet();
}
console.log(`wrote ${LETTERS.length} clips to ${OUT}`);
