/**
 * The device's own database: the word lists, their words and each word's
 * picture. IndexedDB is what a browser hands a page that must keep more than a
 * key's worth of data and still run with the network off (SYSTEM.md).
 *
 * The built-in lists ship as JSON under `static/lists/` and are read into the
 * database on first run. From then on the database is the copy the app reads,
 * the parent's edits and images included, and no request leaves the device.
 */
import { assetUrl } from "./assets.js";
import type { List } from "./lists.js";

const DB_NAME = "keysmash";
const DB_VERSION = 1;
const LIST_STORE = "lists";
const META_STORE = "meta";

/** The meta entry holding the seed version the database was built from. */
const SEEDED = "seeded";

/**
 * Bump when the built-in files change in a way every device has to be seeded
 * with again — a new list, a new word, a corrected emoji. A device holding an
 * older version is re-seeded on its next load, which discards its edits.
 */
const SEED_VERSION = 1;

/** The store as the rest of the app uses it. */
export interface Store {
  lists(): Promise<List[]>;
  put(list: List): Promise<void>;
  restore(): Promise<void>;
}

/** The built-in list ids, in the order the seed file names them. */
async function readListIds(): Promise<string[]> {
  const response = await fetch(assetUrl("lists/index.json"));
  if (!response.ok) throw new Error(`lists/index.json: HTTP ${response.status}`);
  const ids: unknown = await response.json();
  if (!Array.isArray(ids) || ids.some((id) => typeof id !== "string")) {
    throw new Error("lists/index.json: expected a list of ids");
  }
  return ids;
}

/** One built-in list, read from its own file. The file ships with the app. */
async function readListFile(id: string): Promise<List> {
  const response = await fetch(assetUrl(`lists/${id}.json`));
  if (!response.ok) throw new Error(`lists/${id}.json: HTTP ${response.status}`);
  return (await response.json()) as List;
}

/** Settles when the transaction is done, or rejects with why it was not. */
function finished(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}

/** Settles with the request's result, or rejects with its error. */
function answered<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(LIST_STORE)) database.createObjectStore(LIST_STORE, { keyPath: "id" });
      if (!database.objectStoreNames.contains(META_STORE)) database.createObjectStore(META_STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/** Reads the built-in lists off the device's own files and into the database. */
async function seed(database: IDBDatabase): Promise<void> {
  const ids = await readListIds();
  const lists = await Promise.all(ids.map((id) => readListFile(id)));
  const transaction = database.transaction([LIST_STORE, META_STORE], "readwrite");
  const store = transaction.objectStore(LIST_STORE);
  lists.forEach((list, order) => store.put({ ...list, order }));
  transaction.objectStore(META_STORE).put(SEED_VERSION, SEEDED);
  await finished(transaction);
}

export function createStore(): Store {
  let connection: IDBDatabase | null = null;

  async function database(): Promise<IDBDatabase> {
    if (connection === null) connection = await open();
    return connection;
  }

  return {
    /**
     * The lists the app draws from, in the order the seed gave them. A device
     * that has never held them is seeded first; a device holding an older seed
     * is re-seeded, which is what puts a new built-in list on it.
     */
    async lists(): Promise<List[]> {
      const db = await database();
      const seeded = await answered(db.transaction(META_STORE).objectStore(META_STORE).get(SEEDED));
      if (seeded !== SEED_VERSION) await seed(db);
      const all = await answered(db.transaction(LIST_STORE).objectStore(LIST_STORE).getAll() as IDBRequest<List[]>);
      return all.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    },

    /** Keeps one list exactly as the parent left it. */
    async put(list: List): Promise<void> {
      const db = await database();
      const transaction = db.transaction(LIST_STORE, "readwrite");
      transaction.objectStore(LIST_STORE).put(list);
      await finished(transaction);
    },

    /** Puts the built-in lists back, discarding the parent's edits and images. */
    async restore(): Promise<void> {
      const db = await database();
      const transaction = db.transaction(LIST_STORE, "readwrite");
      transaction.objectStore(LIST_STORE).clear();
      await finished(transaction);
      await seed(db);
    },
  };
}
