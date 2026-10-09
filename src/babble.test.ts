import { describe, expect, test } from "bun:test";
import { createClassifier } from "./babble.js";

type Action = { type: "babble"; key: string } | { type: "undo"; count: number };
type Event = ["press" | "release", string, number];

/** Replays events and reports both the actions and the text left on the screen. */
function replay(events: Event[]): { actions: Action[]; text: string } {
  const classifier = createClassifier();
  const actions: Action[] = [];
  let text = "";
  for (const [kind, key, now] of events) {
    const out = (kind === "press" ? classifier.press(key, now) : classifier.release(key)) as Action[];
    for (const action of out) {
      actions.push(action);
      text = action.type === "babble" ? text + action.key : text.slice(0, text.length - action.count);
    }
  }
  return { actions, text };
}

describe("babble", () => {
  test("a deliberate press is answered at once", () => {
    expect(replay([["press", "a", 0]]).actions).toEqual([{ type: "babble", key: "a" }]);
    expect(replay([["press", "a", 0]]).text).toBe("a");
  });

  test("a held key gives one letter, no repeat", () => {
    expect(replay([["press", "b", 0], ["press", "b", 400], ["release", "b", 700]]).text).toBe("b");
  });

  test("presses at least the gap apart each stand", () => {
    expect(replay([["press", "a", 0], ["release", "a", 50], ["press", "b", 200], ["release", "b", 250]]).text).toBe("ab");
  });
});

describe("mash", () => {
  test("two keys down at once take back the press that began the burst", () => {
    const { actions, text } = replay([["press", "a", 0], ["press", "b", 20], ["release", "a", 40], ["release", "b", 60]]);
    expect(actions).toEqual([{ type: "babble", key: "a" }, { type: "undo", count: 1 }]);
    expect(text).toBe("");
  });

  test("a press inside the gap takes back the one before it", () => {
    const { actions, text } = replay([["press", "a", 0], ["release", "a", 50], ["press", "b", 100], ["release", "b", 140]]);
    expect(actions).toEqual([{ type: "babble", key: "a" }, { type: "undo", count: 1 }]);
    expect(text).toBe("");
  });

  test("a drag across the keyboard leaves nothing", () => {
    const events: Event[] = [];
    let now = 0;
    for (const key of ["a", "s", "d", "f", "g", "h", "j", "k"]) events.push(["press", key, (now += 10)]);
    for (const key of ["a", "s", "d", "f", "g", "h", "j", "k"]) events.push(["release", key, (now += 5)]);
    expect(replay(events).text).toBe("");
  });

  test("five presses inside the window take back the whole flurry", () => {
    const events: Event[] = [];
    "abcde".split("").forEach((key, i) => {
      events.push(["press", key, i * 200], ["release", key, i * 200 + 60]);
    });
    const { actions, text } = replay(events);
    expect(text).toBe("");
    expect(actions.at(-1)).toEqual({ type: "undo", count: 4 });
  });

  test("four presses inside the window are not a flurry", () => {
    const events: Event[] = [];
    "abcd".split("").forEach((key, i) => {
      events.push(["press", key, i * 200], ["release", key, i * 200 + 60]);
    });
    expect(replay(events).text).toBe("abcd");
  });
});
