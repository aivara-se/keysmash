const KEY = "keysmash.language.v3";

/** The parent's choice of language, as the rest of the app uses it. */
export interface Settings {
  language(known: readonly string[]): string;
  setLanguage(id: string): void;
}

/**
 * The parent's choice of language, kept on the device in localStorage
 * (SYSTEMS.md). The packs themselves, and everything in them, live in the
 * database (`src/lib/store.ts`).
 *
 * The key carries a version: a device holding the old choice of lists must not
 * read one of them as a language.
 */
export function createSettings(): Settings {
  return {
    /**
     * The language to mark: what is stored when the app still ships it, else
     * the first the app knows. It is told what the app knows, because a first
     * run asks before the packs have been read.
     */
    language(known: readonly string[]): string {
      let raw: string | null = null;
      try {
        raw = localStorage.getItem(KEY);
      } catch {
        return known[0] ?? "";
      }
      return raw !== null && known.includes(raw) ? raw : (known[0] ?? "");
    },

    setLanguage(id: string): void {
      try {
        localStorage.setItem(KEY, id);
      } catch {
        // A device that refuses storage still plays; the choice just does not stick.
      }
    },
  };
}
