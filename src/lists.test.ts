import { describe, expect, test } from "bun:test";
import { COLORS, DEFAULT_LIST_IDS, LISTS, wordsFor } from "./lists.js";

describe("the lists", () => {
  test("have unique ids, and a default that exists", () => {
    const ids = LISTS.map((list) => list.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of DEFAULT_LIST_IDS) expect(ids).toContain(id);
  });

  test("hold single lower-case words only", () => {
    // The tokenizer matches one letter run at a time, so an entry with a space
    // or a capital could never be found in the text.
    for (const list of LISTS) {
      for (const entry of list.words) expect(entry.word).toMatch(/^[a-z]+$/);
    }
  });

  test("never put one word in two lists", () => {
    // Two lists would give it two colours, and which one won would depend on
    // the order they were read in.
    const seen = new Map();
    for (const list of LISTS) {
      for (const entry of list.words) {
        expect(seen.has(entry.word)).toBe(false);
        seen.set(entry.word, list.id);
      }
    }
  });

  test("give every word a known colour, or none", () => {
    for (const list of LISTS) {
      expect(list.color === undefined || COLORS.includes(list.color)).toBe(true);
      for (const entry of list.words) {
        const color = entry.color ?? list.color;
        expect(color === undefined || COLORS.includes(color)).toBe(true);
      }
    }
  });

  test("stay clean of the words a two-year-old reaches by accident", () => {
    const unsafe = ["ass", "cum", "fag", "gay", "pee", "poo", "sex", "tit"];
    for (const list of LISTS) {
      for (const entry of list.words) expect(unsafe).not.toContain(entry.word);
    }
  });
});

describe("wordsFor", () => {
  test("gives the active lists' words, with their emoji and colour", () => {
    const words = wordsFor(["animals"]);
    expect(words.get("cat")).toEqual({ emoji: "🐱", color: "amber" });
    expect(words.has("apple")).toBe(false);
  });

  test("takes a word's own colour, else its emoji's, else its list's, else none", () => {
    const animals = wordsFor(["animals"]);
    expect(animals.get("butterfly")?.color).toBe("sky");   // the word's own colour wins
    expect(animals.get("frog")?.color).toBe("green");      // then what its emoji says
    expect(animals.get("cat")?.color).toBe("amber");       // also the emoji, over the list
    const people = wordsFor(["people"]);
    expect(people.get("mama")?.color).toBe("violet");      // a skin-tone emoji says nothing, so the list decides
    const actions = wordsFor(["actions"]);                 // a list with no colour
    expect(actions.get("play")?.color).toBeUndefined();    // left to the ink
  });

  test("gives nothing for no list", () => {
    expect(wordsFor([]).size).toBe(0);
  });
});
