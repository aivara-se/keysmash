/**
 * The device's own database: the word packs, their words and each word's
 * picture. IndexedDB is what a browser hands a page that must keep more than a
 * key's worth of data and still run with the network off (SYSTEMS.md).
 *
 * The built-in packs ship as JSON under `static/lists/` and are read into the
 * database on first run. From then on the database is the copy the app reads,
 * the parent's words and pictures included, and no request leaves the device.
 */
import { assetUrl } from "./assets.js";
import { CUSTOM_PACK_ID, type Pack } from "./packs.js";

const DB_NAME = "keysmash";
const DB_VERSION = 1;
/** The table's name on the device. It is older than the word "pack" here, and renaming it would need a migration that moves every parent's words. */
const PACK_STORE = "lists";
const META_STORE = "meta";

/** The meta entry holding the seed version the database was built from. */
const SEEDED = "seeded";

/**
 * Bump when the built-in files change in a way every device has to be seeded
 * with again — a new pack, a new word, a corrected emoji. A device holding an
 * older version is re-seeded on its next load, which discards its edits to the
 * built-in words; the parent's own pack is kept either way.
 */
const SEED_VERSION = 2;

/** The store as the rest of the app uses it. */
export interface Store {
  packs(): Promise<Pack[]>;
  put(pack: Pack): Promise<void>;
  restore(): Promise<void>;
}

/** The built-in pack ids, in the order the seed file names them. */
async function readPackIds(): Promise<string[]> {
  const response = await fetch(assetUrl("lists/index.json"));
  if (!response.ok) throw new Error(`lists/index.json: HTTP ${response.status}`);
  const ids: unknown = await response.json();
  if (!Array.isArray(ids) || ids.some((id) => typeof id !== "string")) {
    throw new Error("lists/index.json: expected a list of ids");
  }
  return ids;
}

/** One built-in pack, read from its own file. The file ships with the app. */
async function readPackFile(id: string): Promise<Pack> {
  const response = await fetch(assetUrl(`lists/${id}.json`));
  if (!response.ok) throw new Error(`lists/${id}.json: HTTP ${response.status}`);
  return (await response.json()) as Pack;
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
      if (!database.objectStoreNames.contains(PACK_STORE)) database.createObjectStore(PACK_STORE, { keyPath: "id" });
      if (!database.objectStoreNames.contains(META_STORE)) database.createObjectStore(META_STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Reads the built-in packs off the device's own files and into the database.
 *
 * The parent's own pack is never shipped over: a device that already holds one
 * keeps every word on it. A pack the app no longer ships — the nine lists the
 * English pack replaced — is taken out. Both reads happen before the write
 * transaction opens, because IndexedDB commits a transaction as soon as it is
 * left without work.
 */
async function seed(database: IDBDatabase): Promise<void> {
  const held = (await answered(database.transaction(PACK_STORE).objectStore(PACK_STORE).getAllKeys())) as IDBValidKey[];
  const mine = (await answered(database.transaction(PACK_STORE).objectStore(PACK_STORE).get(CUSTOM_PACK_ID))) as Pack | undefined;
  const ids = await readPackIds();
  const packs = await Promise.all(ids.map((id) => readPackFile(id)));

  const transaction = database.transaction([PACK_STORE, META_STORE], "readwrite");
  const store = transaction.objectStore(PACK_STORE);
  for (const id of held) if (!ids.includes(String(id))) store.delete(id);
  packs.forEach((pack, order) => {
    if (pack.id === CUSTOM_PACK_ID && mine !== undefined) return;
    store.put({ ...pack, order });
  });
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
     * The packs the app draws from, in the order the seed gave them. A device
     * that has never held them is seeded first; a device holding an older seed
     * is re-seeded, which is what puts a new built-in pack on it.
     */
    async packs(): Promise<Pack[]> {
      const db = await database();
      const seeded = await answered(db.transaction(META_STORE).objectStore(META_STORE).get(SEEDED));
      if (seeded !== SEED_VERSION) await seed(db);
      const all = await answered(db.transaction(PACK_STORE).objectStore(PACK_STORE).getAll() as IDBRequest<Pack[]>);
      return all.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    },

    /** Keeps one pack exactly as the parent left it. */
    async put(pack: Pack): Promise<void> {
      const db = await database();
      const transaction = db.transaction(PACK_STORE, "readwrite");
      transaction.objectStore(PACK_STORE).put(pack);
      await finished(transaction);
    },

    /** Puts the built-in packs back, taking the parent's own words and pictures off the device. */
    async restore(): Promise<void> {
      const db = await database();
      const transaction = db.transaction(PACK_STORE, "readwrite");
      transaction.objectStore(PACK_STORE).clear();
      await finished(transaction);
      await seed(db);
    },
  };
}
