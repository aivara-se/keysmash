import { describe, expect, test } from "bun:test";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import {
  COLORS,
  CUSTOM_PACK_ID,
  addWord,
  clearImage,
  normalizeWord,
  ownerOf,
  removeWord,
  setEmoji,
  setImage,
  validWord,
  wordsFor,
  type Pack,
} from "./packs.js";

/** The built-in packs live beside the app, in the directory they are served from. */
const DIR = join(import.meta.dir, "..", "..", "static", "lists");

/** The built-in packs exactly as they ship, read from their own files. */
async function shipped(): Promise<{ ids: string[]; packs: Pack[] }> {
  const ids = (await Bun.file(join(DIR, "index.json")).json()) as string[];
  const packs = (await Promise.all(
    ids.map((id) => Bun.file(join(DIR, `${id}.json`)).json()),
  )) as Pack[];
  return { ids, packs };
}

const { ids, packs } = await shipped();

/** The one language the app ships, and the parent's own pack. */
const ENGLISH = "english";

const wordIn = (of: Pack[], packId: string, word: string) =>
  of
    .find((pack) => pack.id === packId)
    ?.words.find((entry) => entry.word === word);

describe("the built-in packs", () => {
  test("have a file each, and the index names none that is missing", () => {
    const files = readdirSync(DIR)
      .filter((name) => name.endsWith(".json") && name !== "index.json")
      .map((name) => name.slice(0, -".json".length));
    expect(new Set(files)).toEqual(new Set(ids));
  });

  test("are named once each, in the order the index gives", () => {
    expect(new Set(packs.map((pack) => pack.id)).size).toBe(packs.length);
    expect(packs.map((pack) => pack.id)).toEqual(ids);
  });

  test("ship one language, English, and the parent's own pack", () => {
    expect(ids).toEqual([ENGLISH, CUSTOM_PACK_ID]);
    expect(packs.find((pack) => pack.id === ENGLISH)?.name).toBe("English");
  });

  test("hold single lower-case words only", () => {
    // The tokenizer matches one letter run at a time, so an entry with a space
    // or a capital could never be found in the text.
    for (const pack of packs) {
      for (const entry of pack.words) expect(entry.word).toMatch(/^[a-z]+$/);
    }
  });

  test("never put one word in two packs", () => {
    // Two packs would give it two colours, and which one won would depend on
    // the order they were read in.
    const seen = new Set<string>();
    for (const pack of packs) {
      for (const entry of pack.words) {
        expect(seen.has(entry.word)).toBe(false);
        seen.add(entry.word);
      }
    }
  });

  test("give every word a known colour, or none", () => {
    for (const pack of packs) {
      for (const entry of pack.words) {
        expect(entry.color === undefined || COLORS.includes(entry.color)).toBe(
          true,
        );
      }
    }
  });

  test("stay clean of the words a two-year-old reaches by accident", () => {
    const unsafe = ["ass", "cum", "fag", "gay", "pee", "poo", "sex", "tit"];
    for (const pack of packs) {
      for (const entry of pack.words) expect(unsafe).not.toContain(entry.word);
    }
  });

  test("ship the parent's own pack, with nothing on it", () => {
    expect(packs.find((pack) => pack.id === CUSTOM_PACK_ID)?.words).toEqual([]);
  });

  test("carry no picture: pictures are the parent's own and stay on the device", () => {
    for (const pack of packs) {
      for (const entry of pack.words) expect(entry.image).toBeUndefined();
    }
  });

  test("draw the words the nine lists used to hold", () => {
    // Every word the older seed shipped is on English, drawn as it was: the
    // colour its list gave it is written onto the word by the merge.
    expect(wordIn(packs, ENGLISH, "cat")).toEqual({ word: "cat", emoji: "🐱" });
    expect(wordIn(packs, ENGLISH, "apple")).toEqual({
      word: "apple",
      emoji: "🍎",
    });
    expect(wordIn(packs, ENGLISH, "mama")).toEqual({
      word: "mama",
      emoji: "👩",
      color: "violet",
    });
    expect(wordIn(packs, ENGLISH, "play")).toEqual({ word: "play" });
  });
});

describe("wordsFor", () => {
  test("gives the chosen language's words, with their emoji, colour and no picture", () => {
    const words = wordsFor(ENGLISH, packs);
    expect(words.get("cat")).toEqual({
      emoji: "🐱",
      color: "amber",
      image: undefined,
    });
    expect(words.get("apple")).toEqual({
      emoji: "🍎",
      color: "red",
      image: undefined,
    });
  });

  test("takes a word's own colour, else its emoji's, else none", () => {
    expect(wordsFor(ENGLISH, packs).get("butterfly")?.color).toBe("sky"); // the word's own colour wins
    expect(wordsFor(ENGLISH, packs).get("frog")?.color).toBe("green"); // then what its emoji says
    expect(wordsFor(ENGLISH, packs).get("mama")?.color).toBe("violet"); // a skin-tone emoji says nothing, so the word's colour decides
    expect(wordsFor(ENGLISH, packs).get("play")?.color).toBeUndefined(); // a word with neither, left to the ink
  });

  test("marks the parent's own words whatever the language", () => {
    const withMine = addWord(packs, CUSTOM_PACK_ID, "doggy").packs;
    expect(wordsFor(ENGLISH, withMine).has("doggy")).toBe(true);
    expect(wordsFor("", withMine).has("doggy")).toBe(true);
    expect(wordsFor("", withMine).has("cat")).toBe(false);
  });

  test("marks nothing from a language the app does not ship", () => {
    expect(wordsFor("klingon", packs).size).toBe(0);
  });

  test("carries a word's picture through to the screen", () => {
    const sent = setImage(packs, ENGLISH, "hair", "data:image/png;base64,AAAA");
    expect(wordsFor(ENGLISH, sent).get("hair")?.image).toBe(
      "data:image/png;base64,AAAA",
    );
  });

  test("gives nothing for no pack at all", () => {
    expect(wordsFor(ENGLISH, []).size).toBe(0);
  });
});

describe("the shape of a word", () => {
  test("is one run of lower-case letters", () => {
    expect(validWord("cat")).toBe(true);
    for (const word of ["", "two words", "Cat", "cat1", "cat!", "dog's"])
      expect(validWord(word)).toBe(false);
  });

  test("is trimmed and lower-cased when the parent types it", () => {
    expect(normalizeWord("  Doggy ")).toBe("doggy");
  });

  test("is owned by the one pack that holds it", () => {
    expect(ownerOf(packs, "cat")).toBe(ENGLISH);
    expect(ownerOf(packs, "CAT")).toBe(ENGLISH);
    expect(ownerOf(packs, "doggy")).toBeNull();
  });
});

describe("adding a word", () => {
  test("puts it on the pack the parent chose", () => {
    const result = addWord(packs, CUSTOM_PACK_ID, "  Doggy ");
    expect(result.error).toBeNull();
    expect(wordIn(result.packs, CUSTOM_PACK_ID, "doggy")).toEqual({
      word: "doggy",
    });
  });

  test("refuses anything but one run of letters, and changes nothing", () => {
    for (const typed of ["", "  ", "two words", "123", "dog!", "Dog-gy"]) {
      const result = addWord(packs, CUSTOM_PACK_ID, typed);
      expect(result.error).toBe("A word is letters only.");
      expect(result.packs).toBe(packs);
    }
  });

  test("refuses a word another pack already holds, and names that pack", () => {
    expect(addWord(packs, CUSTOM_PACK_ID, "cat").error).toBe(
      "Already in English.",
    );
    expect(addWord(packs, CUSTOM_PACK_ID, "CAT").error).toBe(
      "Already in English.",
    );
    expect(addWord(packs, ENGLISH, "cat").error).toBe("Already in English.");
  });

  test("handles every other pack the same object, so only one is written back", () => {
    const result = addWord(packs, CUSTOM_PACK_ID, "doggy");
    for (const pack of result.packs) {
      const kept = packs.find((candidate) => candidate.id === pack.id);
      expect(kept).toBeDefined();
      if (pack.id === CUSTOM_PACK_ID) {
        expect(kept).not.toBe(pack);
        continue;
      }
      expect(kept).toBe(pack);
    }
  });
});

describe("editing a word", () => {
  test("sets its emoji", () => {
    expect(
      wordIn(setEmoji(packs, ENGLISH, "hair", "💇"), ENGLISH, "hair")?.emoji,
    ).toBe("💇");
  });

  test("takes an emoji away when the field is left empty", () => {
    expect(
      wordIn(setEmoji(packs, ENGLISH, "cat", "   "), ENGLISH, "cat"),
    ).toEqual({ word: "cat" });
  });

  test("gives it a picture, and takes it away again", () => {
    const sent = setImage(packs, ENGLISH, "hair", "data:image/png;base64,AAAA");
    expect(wordIn(sent, ENGLISH, "hair")?.image).toBe(
      "data:image/png;base64,AAAA",
    );
    expect(
      wordIn(clearImage(sent, ENGLISH, "hair"), ENGLISH, "hair")?.image,
    ).toBeUndefined();
  });

  test("removes it from its pack", () => {
    const next = removeWord(packs, ENGLISH, "cat");
    expect(ownerOf(next, "cat")).toBeNull();
    expect(next.find((pack) => pack.id === ENGLISH)?.words.length).toBe(
      (packs.find((pack) => pack.id === ENGLISH)?.words.length ?? 0) - 1,
    );
  });
});
