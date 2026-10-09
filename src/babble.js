import { BABBLE_GAP_MS, MASH_PRESSES, MASH_WINDOW_MS } from "./thresholds.js";

/**
 * @typedef {{ type: "babble", key: string } | { type: "undo", count: number }} Action
 * @typedef {{ press(key: string, now: number): Action[], release(key: string): Action[] }} Classifier
 */

/**
 * Classifies keyboard input into babbles and mashes (PRODUCT.md).
 *
 * A deliberate press is answered at once: its letter is written and spoken.
 * A mash is caught as it forms, and the burst it belongs to is taken back —
 * the letters already answered for it are undone and its own press answers
 * nothing. That keeps "the whole burst is a mash, including the presses that
 * began it" without waiting to see whether another press is coming, which is
 * what would push the answer past the 150 ms budget.
 *
 * A mash is two keys down at once, any press while a key is down, a press
 * within BABBLE_GAP_MS of the previous, or MASH_PRESSES presses within
 * MASH_WINDOW_MS.
 *
 * The classifier is pure: every method takes the time and returns the actions
 * to carry out, in order. Drive it from the browser's key events; key
 * auto-repeat never reaches it — the caller drops the repeat flag.
 *
 * @returns {Classifier}
 */
export function createClassifier() {
  /** @type {Map<string, number>} currently-down key -> pressedAt */
  const down = new Map();
  /** @type {{ key: string, at: number, answered: boolean }[]} presses still in the window */
  let recent = [];
  let lastPressAt = null;

  /** The trailing run of presses close enough together to be one burst. */
  function trailingBurst() {
    const burst = [recent[recent.length - 1]];
    for (let i = recent.length - 1; i > 0; i--) {
      if (recent[i].at - recent[i - 1].at < BABBLE_GAP_MS) burst.push(recent[i - 1]);
      else break;
    }
    return burst;
  }

  return {
    press(key, now) {
      if (down.has(key)) return [];

      recent.push({ key, at: now, answered: false });
      recent = recent.filter((entry) => now - entry.at < MASH_WINDOW_MS);

      const overlapping = down.size > 0;
      const rapid = lastPressAt !== null && now - lastPressAt < BABBLE_GAP_MS;
      const flurry = recent.length >= MASH_PRESSES;
      down.set(key, now);
      lastPressAt = now;

      if (overlapping || rapid || flurry) {
        const victims = flurry ? recent : trailingBurst();
        let count = 0;
        for (const entry of victims) {
          if (!entry.answered) continue;
          entry.answered = false;
          count++;
        }
        return count > 0 ? [{ type: "undo", count }] : [];
      }

      recent[recent.length - 1].answered = true;
      return [{ type: "babble", key }];
    },

    release(key) {
      down.delete(key);
      return [];
    },
  };
}
