import { describe, expect, test } from "bun:test";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import {
  COLORS,
  CUSTOM_LIST_ID,
  addWord,
  clearImage,
  normalizeWord,
  ownerOf,
  removeWord,
  setEmoji,
  setImage,
  validWord,
  wordsFor,
  type List,
} from "./lists.js";

/** The built-in lists live beside the app, in the directory they are served from. */
const DIR = join(import.meta.dir, "..", "..", "static", "lists");

/** The built-in lists exactly as they ship, read from their own files. */
async function shipped(): Promise<{ ids: string[]; lists: List[] }> {
  const ids = (await Bun.file(join(DIR, "index.json")).json()) as string[];
  const lists = (await Promise.all(ids.map((id) => Bun.file(join(DIR, `${id}.json`)).json()))) as List[];
  return { ids, lists };
}

const { ids, lists } = await shipped();

const wordIn = (of: List[], listId: string, word: string) =>
  of.find((list) => list.id === listId)?.words.find((entry) => entry.word === word);

describe("the built-in lists", () => {
  test("have a file each, and the index names none that is missing", () => {
    const files = readdirSync(DIR)
      .filter((name) => name.endsWith(".json") && name !== "index.json")
      .map((name) => name.slice(0, -".json".length));
    expect(new Set(files)).toEqual(new Set(ids));
  });

  test("are named once each, in the order the index gives", () => {
    expect(new Set(lists.map((list) => list.id)).size).toBe(lists.length);
    expect(lists.map((list) => list.id)).toEqual(ids);
  });

  test("hold single lower-case words only", () => {
    // The tokenizer matches one letter run at a time, so an entry with a space
    // or a capital could never be found in the text.
    for (const list of lists) {
      for (const entry of list.words) expect(entry.word).toMatch(/^[a-z]+$/);
    }
  });

  test("never put one word in two lists", () => {
    // Two lists would give it two colours, and which one won would depend on
    // the order they were read in.
    const seen = new Set<string>();
    for (const list of lists) {
      for (const entry of list.words) {
        expect(seen.has(entry.word)).toBe(false);
        seen.add(entry.word);
      }
    }
  });

  test("give every word a known colour, or none", () => {
    for (const list of lists) {
      expect(list.color === undefined || COLORS.includes(list.color)).toBe(true);
      for (const entry of list.words) {
        const color = entry.color ?? list.color;
        expect(color === undefined || COLORS.includes(color)).toBe(true);
      }
    }
  });

  test("stay clean of the words a two-year-old reaches by accident", () => {
    const unsafe = ["ass", "cum", "fag", "gay", "pee", "poo", "sex", "tit"];
    for (const list of lists) {
      for (const entry of list.words) expect(unsafe).not.toContain(entry.word);
    }
  });

  test("ship the parent's own list, with nothing on it", () => {
    expect(lists.find((list) => list.id === CUSTOM_LIST_ID)?.words).toEqual([]);
  });

  test("carry no picture: pictures are the parent's own and stay on the device", () => {
    for (const list of lists) {
      for (const entry of list.words) expect(entry.image).toBeUndefined();
    }
  });
});

describe("wordsFor", () => {
  test("gives the active lists' words, with their emoji, colour and no picture", () => {
    const words = wordsFor(["animals"], lists);
    expect(words.get("cat")).toEqual({ emoji: "🐱", color: "amber", image: undefined });
    expect(words.has("apple")).toBe(false);
  });

  test("takes a word's own colour, else its emoji's, else its list's, else none", () => {
    expect(wordsFor(["animals"], lists).get("butterfly")?.color).toBe("sky");   // the word's own colour wins
    expect(wordsFor(["animals"], lists).get("frog")?.color).toBe("green");      // then what its emoji says
    expect(wordsFor(["animals"], lists).get("cat")?.color).toBe("amber");       // also the emoji, over the list
    expect(wordsFor(["people"], lists).get("mama")?.color).toBe("violet");      // a skin-tone emoji says nothing, so the list decides
    expect(wordsFor(["actions"], lists).get("play")?.color).toBeUndefined();    // a list with no colour, left to the ink
  });

  test("carries a word's picture through to the screen", () => {
    const sent = setImage(lists, "people", "hair", "data:image/png;base64,AAAA");
    expect(wordsFor(["people"], sent).get("hair")?.image).toBe("data:image/png;base64,AAAA");
  });

  test("gives nothing for no list", () => {
    expect(wordsFor([], lists).size).toBe(0);
  });
});

describe("the shape of a word", () => {
  test("is one run of lower-case letters", () => {
    expect(validWord("cat")).toBe(true);
    for (const word of ["", "two words", "Cat", "cat1", "cat!", "dog's"]) expect(validWord(word)).toBe(false);
  });

  test("is trimmed and lower-cased when the parent types it", () => {
    expect(normalizeWord("  Doggy ")).toBe("doggy");
  });

  test("is owned by the one list that holds it", () => {
    expect(ownerOf(lists, "cat")).toBe("animals");
    expect(ownerOf(lists, "CAT")).toBe("animals");
    expect(ownerOf(lists, "doggy")).toBeNull();
  });
});

describe("adding a word", () => {
  test("puts it on the list the parent chose", () => {
    const result = addWord(lists, CUSTOM_LIST_ID, "  Doggy ");
    expect(result.error).toBeNull();
    expect(wordIn(result.lists, CUSTOM_LIST_ID, "doggy")).toEqual({ word: "doggy" });
  });

  test("refuses anything but one run of letters, and changes nothing", () => {
    for (const typed of ["", "  ", "two words", "123", "dog!", "Dog-gy"]) {
      const result = addWord(lists, CUSTOM_LIST_ID, typed);
      expect(result.error).toBe("A word is letters only.");
      expect(result.lists).toBe(lists);
    }
  });

  test("refuses a word another list already holds, and names that list", () => {
    expect(addWord(lists, CUSTOM_LIST_ID, "cat").error).toBe("Already on Animals.");
    expect(addWord(lists, CUSTOM_LIST_ID, "CAT").error).toBe("Already on Animals.");
    expect(addWord(lists, "animals", "cat").error).toBe("Already on Animals.");
  });

  test("handles every other list the same object, so only one is written back", () => {
    const result = addWord(lists, CUSTOM_LIST_ID, "doggy");
    for (const list of result.lists) {
      const kept = lists.find((candidate) => candidate.id === list.id);
      expect(kept).toBeDefined();
      if (list.id === CUSTOM_LIST_ID) {
        expect(kept).not.toBe(list);
        continue;
      }
      expect(kept).toBe(list);
    }
  });
});

describe("editing a word", () => {
  test("sets its emoji", () => {
    expect(wordIn(setEmoji(lists, "people", "hair", "💇"), "people", "hair")?.emoji).toBe("💇");
  });

  test("takes an emoji away when the field is left empty", () => {
    expect(wordIn(setEmoji(lists, "animals", "cat", "   "), "animals", "cat")).toEqual({ word: "cat" });
  });

  test("gives it a picture, and takes it away again", () => {
    const sent = setImage(lists, "people", "hair", "data:image/png;base64,AAAA");
    expect(wordIn(sent, "people", "hair")?.image).toBe("data:image/png;base64,AAAA");
    expect(wordIn(clearImage(sent, "people", "hair"), "people", "hair")?.image).toBeUndefined();
  });

  test("removes it from its list", () => {
    const next = removeWord(lists, "animals", "cat");
    expect(ownerOf(next, "cat")).toBeNull();
    expect(next.find((list) => list.id === "animals")?.words.length).toBe(
      (lists.find((list) => list.id === "animals")?.words.length ?? 0) - 1,
    );
  });
});
