const KEY = "keysmash.lists.v2";

/**
 * The parent's choice of which lists are on, kept on the device in localStorage
 * (SYSTEM.md). The lists themselves, and everything on them, live in the
 * database (`src/store.js`).
 *
 * The key carries a version. The default changed from a small set of lists to
 * every list, and a device holding a choice made against the old default would
 * otherwise keep the narrow set for ever.
 */
export function createSettings() {
  return {
    /**
     * The active list ids: what is stored, or every list the app knows when
     * nothing valid is. It is told what the app knows, because a first run asks
     * before the lists have been read.
     */
    activeListIds(known) {
      let raw = null;
      try {
        raw = localStorage.getItem(KEY);
      } catch {
        return known;
      }
      if (raw === null) return known;
      try {
        const ids = JSON.parse(raw);
        return Array.isArray(ids) && ids.every((id) => typeof id === "string") ? ids : known;
      } catch {
        return known;
      }
    },

    setActiveListIds(ids) {
      try {
        localStorage.setItem(KEY, JSON.stringify(ids));
      } catch {
        // A device that refuses storage still plays; the choice just does not stick.
      }
    },
  };
}
