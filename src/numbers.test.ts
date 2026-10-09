import { describe, expect, test } from "bun:test";
import { readDigits } from "./numbers.js";

describe("readDigits", () => {
  test.each([
    ["1", "one"],
    ["3", "three"],
    ["9", "nine"],
    ["12", "twelve"],
    ["33", "thirty-three"],
    ["80", "eighty"],
    ["100", "one hundred"],
    ["256", "two hundred fifty-six"],
    ["1000", "one thousand"],
    ["1234", "one thousand two hundred thirty-four"],
  ])("reads %s as %s", (digits, spoken) => {
    expect(readDigits(digits)).toBe(spoken);
  });

  test("falls back to naming each digit when the run is too long", () => {
    expect(readDigits("1234567890123456")).toBe(
      "one two three four five six seven eight nine zero one two three four five six",
    );
  });
});
