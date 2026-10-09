/**
 * The babble/mash constants. PRODUCT.md owns the behaviour; v1 freezes the
 * values the spec left provisional, because no recording of a real two-year-old
 * exists yet (issue #4).
 */

/** A babble is at least this long after the previous press. Also the answer budget. */
export const BABBLE_GAP_MS = 150;

/** Five presses inside this window are a mash. */
export const MASH_WINDOW_MS = 1000;

/** This many presses inside the window are a mash. */
export const MASH_PRESSES = 5;

/** A word or number is read this long after the child stops. */
export const READ_IDLE_MS = 500;
