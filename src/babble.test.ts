import { describe, expect, test } from "bun:test";
import { createClassifier } from "./babble.js";
import { HELD_ANSWER_MS } from "./thresholds.js";

type Event = ["press" | "release" | "tick", string, number];

/** The physical key behind a character: "A" and "a" are the same key. */
const codeOf = (key: string) => `Key${key.toUpperCase()}`;

/** Replays events and reports the answer stream and the text left on screen. */
function replay(events: Event[]): { answered: string[]; text: string } {
  const classifier = createClassifier();
  const answered: string[] = [];
  let text = "";
  for (const [kind, key, now] of events) {
    const out = kind === "press" ? classifier.press(codeOf(key), key, now) : kind === "release" ? classifier.release(codeOf(key)) : classifier.tick(now);
    for (const letter of out) {
      answered.push(letter.key);
      text += letter.key;
    }
  }
  return { answered, text };
}

describe("babble", () => {
  test("a tap is answered when it comes up", () => {
    expect(replay([["press", "a", 0], ["release", "a", 40]]).answered).toEqual(["a"]);
  });

  test("a held key gives one letter, no repeat", () => {
    expect(replay([["press", "b", 0], ["press", "b", 400], ["tick", "", HELD_ANSWER_MS], ["tick", "", 500], ["release", "b", 700]]).answered).toEqual(["b"]);
  });

  test("a key held alone answers without waiting for the release", () => {
    expect(replay([["press", "c", 0], ["tick", "", HELD_ANSWER_MS - 1]]).answered).toEqual([]);
    expect(replay([["press", "c", 0], ["tick", "", HELD_ANSWER_MS]]).answered).toEqual(["c"]);
  });
});

describe("mash", () => {
  test("two keys down at once answer nothing", () => {
    expect(replay([["press", "a", 0], ["press", "b", 10], ["release", "a", 40], ["release", "b", 60]]).answered).toEqual([]);
  });

  test("a drag across the keyboard answers nothing", () => {
    const events: Event[] = [];
    let now = 0;
    for (const key of ["a", "s", "d", "f", "g", "h"]) events.push(["press", key, (now += 8)]);
    for (const key of ["a", "s", "d", "f", "g", "h"]) events.push(["release", key, (now += 6)]);
    expect(replay(events).answered).toEqual([]);
  });
});

describe("a capital letter", () => {
  test("a press and its release are the same key whatever case they report", () => {
    // Shift is up by the time the letter comes up, so the key reports "A" on
    // the way down and "a" on the way up. The keyboard must not go deaf.
    const { answered, text } = replay([["press", "A", 0], ["release", "a", 40], ["press", "b", 80], ["release", "b", 120]]);
    expect(answered).toEqual(["A", "b"]);
    expect(text).toBe("Ab");
  });
});

describe("never edit what the child typed", () => {
  test("fast typing keeps every letter", () => {
    const events: Event[] = [];
    let now = 0;
    for (const key of "asdaaaaaaaaaaaaaa") events.push(["press", key, (now += 30)], ["release", key, (now += 20)]);
    const { answered, text } = replay(events);
    expect(text).toBe("asdaaaaaaaaaaaaaa");
    expect(answered).toEqual([..."asdaaaaaaaaaaaaaa"]);
  });

  test("a letter once answered is never taken back", () => {
    const classifier = createClassifier();
    const events: Event[] = [
      ["press", "a", 0], ["release", "a", 20],
      ["press", "b", 40], ["press", "c", 50], ["release", "b", 60], ["release", "c", 80],
      ["press", "d", 100], ["release", "d", 120],
    ];
    let text = "";
    for (const [kind, key, now] of events) {
      const out = kind === "press" ? classifier.press(codeOf(key), key, now) : kind === "release" ? classifier.release(codeOf(key)) : classifier.tick(now);
      const before = text.length;
      for (const letter of out) text += letter.key;
      expect(text.length).toBeGreaterThanOrEqual(before);
    }
    expect(text).toBe("ad");
  });
});
