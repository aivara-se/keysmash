import { describe, expect, test } from "bun:test";
import { markText, newUtterances } from "./words.js";

const words = new Map([
  ["cat", { emoji: "🐱", color: "animals" }],
  ["cats", {}],
  ["dog", { emoji: "🐶", color: "animals" }],
  ["mum", { color: "people" }],
]);

describe("markText", () => {
  test("marks a word on the active list, and only that", () => {
    expect(markText("cat", words).map((m) => m.value)).toEqual(["cat"]);
    expect(markText("cot", words)).toEqual([]);
  });

  test("marks every word and number in the text", () => {
    const marks = markText("cat dog 33", words);
    expect(marks.map((m) => [m.kind, m.spoken])).toEqual([
      ["word", "cat"],
      ["word", "dog"],
      ["number", "thirty-three"],
    ]);
  });

  test("a single digit is spoken as its name", () => {
    expect(markText("3", words)).toEqual([{ start: 0, end: 1, kind: "number", value: "3", spoken: "three" }]);
  });

  test("matching is case-insensitive, and records the covered range", () => {
    expect(markText("Cat", words)).toEqual([
      { start: 0, end: 3, kind: "word", value: "Cat", spoken: "cat", emoji: "🐱", color: "animals" },
    ]);
  });

  test("a word carries the emoji and colour its list gave it", () => {
    expect(markText("cat", words)).toEqual([
      { start: 0, end: 3, kind: "word", value: "cat", spoken: "cat", emoji: "🐱", color: "animals" },
    ]);
    // no emoji, or no colour, is left undefined rather than invented
    expect(markText("cats", words)).toEqual([
      { start: 0, end: 4, kind: "word", value: "cats", spoken: "cats", emoji: undefined, color: undefined },
    ]);
    expect(markText("mum", words)).toEqual([
      { start: 0, end: 3, kind: "word", value: "mum", spoken: "mum", emoji: undefined, color: "people" },
    ]);
  });

  test("a number carries no emoji or colour of its own", () => {
    expect(markText("7", words)[0]).not.toHaveProperty("emoji");
    expect(markText("7", words)[0]).not.toHaveProperty("color");
  });
});

describe("newUtterances", () => {
  test("speaks a word once until it changes", () => {
    const spoken = new Map<number, string>();
    expect(newUtterances(markText("cat", words), spoken)).toEqual(["cat"]);
    expect(newUtterances(markText("cat", words), spoken)).toEqual([]);
    expect(newUtterances(markText("cats dog", words), spoken)).toEqual(["cats", "dog"]);
  });
});
