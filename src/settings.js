import { DEFAULT_LIST_IDS } from "./lists.js";

const KEY = "keysmash.lists";

/** The parent's settings, kept on the device in localStorage (SYSTEM.md). */
export function createSettings() {
  return {
    /** The active list ids: what is stored, or the default when nothing valid is. */
    activeListIds() {
      let raw = null;
      try {
        raw = localStorage.getItem(KEY);
      } catch {
        return DEFAULT_LIST_IDS;
      }
      if (raw === null) return DEFAULT_LIST_IDS;
      try {
        const ids = JSON.parse(raw);
        return Array.isArray(ids) && ids.every((id) => typeof id === "string") ? ids : DEFAULT_LIST_IDS;
      } catch {
        return DEFAULT_LIST_IDS;
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
