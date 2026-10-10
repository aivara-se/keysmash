const ONES = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
  "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen",
  "seventeen", "eighteen", "nineteen",
];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
const SCALES = ["", "thousand", "million", "billion", "trillion"];

/** Longest run of digits read as one number; past it each digit is named. */
const MAX_NUMBER_DIGITS = 15;

function underThousand(n: number): string {
  if (n < 20) return ONES[n];
  if (n < 100) {
    const tens = Math.floor(n / 10);
    const ones = n % 10;
    return ones === 0 ? TENS[tens] : `${TENS[tens]}-${ONES[ones]}`;
  }
  const hundreds = Math.floor(n / 100);
  const rest = n % 100;
  return rest === 0 ? `${ONES[hundreds]} hundred` : `${ONES[hundreds]} hundred ${underThousand(rest)}`;
}

/**
 * Spells a non-negative integer the way it is said: 3 is "three", 33 is
 * "thirty-three". Numbers are names, never counts (PRODUCT.md).
 */
export function numberToName(n: number): string {
  if (!Number.isInteger(n) || n < 0) {
    throw new TypeError(`numberToName wants a non-negative integer, got ${n}`);
  }
  if (n < 1000) return underThousand(n);

  const groups: number[] = [];
  for (let rest = n; rest > 0; rest = Math.floor(rest / 1000)) groups.push(rest % 1000);
  const parts: string[] = [];
  for (let i = groups.length - 1; i >= 0; i--) {
    if (groups[i] === 0) continue;
    const scale = SCALES[i];
    parts.push(scale === "" ? underThousand(groups[i]) : `${underThousand(groups[i])} ${scale}`);
  }
  return parts.join(" ");
}

/** Reads a run of digits as a number, or digit by digit when too long. */
export function readDigits(digits: string): string {
  if (digits.length <= MAX_NUMBER_DIGITS) return numberToName(Number(digits));
  return [...digits].map((d) => ONES[Number(d)]).join(" ");
}
