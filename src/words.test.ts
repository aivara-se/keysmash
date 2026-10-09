import { describe, expect, test } from "bun:test";
import { markText, newUtterances } from "./words.js";

const words = new Set(["cat", "cats", "dog", "mum"]);

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
      { start: 0, end: 3, kind: "word", value: "Cat", spoken: "cat" },
    ]);
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
