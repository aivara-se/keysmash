import { HELD_ANSWER_MS } from "./thresholds.js";

/**
 * @typedef {{ key: string }} Letter
 * @typedef {{
 *   press(code: string, key: string, now: number): Letter[],
 *   release(code: string): Letter[],
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
 * A key is identified by its code, not by the character it produced: the same
 * key reports "A" while Shift is held and "a" once Shift is up, and a map keyed
 * by the character would keep that press for ever and go deaf. The character
 * comes from the press, so what is written is what the child typed.
 *
 * The classifier is pure: every method takes the time and returns the letters
 * to write and speak. Drive `tick` from a short interval. Key auto-repeat never
 * reaches it — the caller drops the repeat flag.
 *
 * @returns {Classifier}
 */
export function createClassifier() {
  /** @type {Map<string, { key: string, pressedAt: number, waiting: boolean }>} */
  const down = new Map();

  return {
    press(code, key, now) {
      if (down.has(code)) return [];
      const mash = down.size > 0;
      // The key this one interrupts belongs to the same mash: it is not answered.
      if (mash) for (const held of down.values()) held.waiting = false;
      down.set(code, { key, pressedAt: now, waiting: !mash });
      return [];
    },

    release(code) {
      const press = down.get(code);
      if (press === undefined) return [];
      down.delete(code);
      return press.waiting ? [{ key: press.key }] : [];
    },

    tick(now) {
      const answered = [];
      for (const [code, press] of down) {
        if (!press.waiting || now - press.pressedAt < HELD_ANSWER_MS) continue;
        press.waiting = false;
        answered.push({ key: press.key });
      }
      return answered;
    },
  };
}
