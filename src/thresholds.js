/** A key held on its own answers after this long. */
export const HELD_ANSWER_MS = 150;

/** A word or number is read this long after the child stops. */
export const READ_IDLE_MS = 500;

/**
 * A letter is spoken only when no other letter arrives inside this window, so
 * fast typing is written but not read aloud.
 */
export const SPEAK_DEBOUNCE_MS = 150;
