import { HELD_ANSWER_MS } from "./thresholds.js";

/**
 * @typedef {{ key: string }} Letter
 * @typedef {{
 *   press(key: string, now: number): Letter[],
 *   release(key: string, now: number): Letter[],
 *   tick(now: number): Letter[],
 * }} Classifier
 */

/**
 * Decides which presses are answered (PRODUCT.md), and never takes an answer
 * back.
 *
 * A press is answered when it is one key alone — released before the next
 * press, or held on its own for HELD_ANSWER_MS. A press that goes down while
 * another key is down is a mash: it answers nothing, and the key it interrupted
 * is not answered either. Once a letter is answered it is never undone, so what
 * the child has typed stays exactly as typed, however fast or meaningless.
 *
 * The classifier is pure: every method takes the time and returns the letters
 * to write and speak. Drive `tick` from a short interval. Key auto-repeat never
 * reaches it — the caller drops the repeat flag.
 *
 * @returns {Classifier}
 */
export function createClassifier() {
  /** @type {Map<string, { pressedAt: number, waiting: boolean }>} */
  const down = new Map();

  return {
    press(key, now) {
      if (down.has(key)) return [];
      const mash = down.size > 0;
      // The key this one interrupts belongs to the same mash: it is not answered.
      if (mash) for (const held of down.values()) held.waiting = false;
      down.set(key, { pressedAt: now, waiting: !mash });
      return [];
    },

    release(key) {
      const press = down.get(key);
      if (press === undefined) return [];
      down.delete(key);
      return press.waiting ? [{ key }] : [];
    },

    tick(now) {
      const answered = [];
      for (const [key, press] of down) {
        if (!press.waiting || now - press.pressedAt < HELD_ANSWER_MS) continue;
        press.waiting = false;
        answered.push({ key });
      }
      return answered;
    },
  };
}
