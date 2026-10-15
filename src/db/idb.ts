// Minimal promise wrapper around IndexedDB, used only by the web build.

const DB_NAME = 'album';
const DB_VERSION = 1;
export const STORE_DATA = 'data';
export const STORE_PHOTOS = 'photos';

let dbPromise: Promise<IDBDatabase> | null = null;

function request<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export function openIdb(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE_DATA)) db.createObjectStore(STORE_DATA);
        if (!db.objectStoreNames.contains(STORE_PHOTOS)) db.createObjectStore(STORE_PHOTOS);
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  return dbPromise;
}

export async function idbGet<T>(store: string, key: string): Promise<T | undefined> {
  const db = await openIdb();
  return request<T | undefined>(db.transaction(store).objectStore(store).get(key));
}

export async function idbPut(store: string, key: string, value: unknown): Promise<void> {
  const db = await openIdb();
  await request(db.transaction(store, 'readwrite').objectStore(store).put(value, key));
}

export async function idbDelete(store: string, key: string): Promise<void> {
  const db = await openIdb();
  await request(db.transaction(store, 'readwrite').objectStore(store).delete(key));
}

export async function idbEntries<T>(store: string): Promise<[string, T][]> {
  const db = await openIdb();
  const os = db.transaction(store).objectStore(store);
  const [keys, values] = await Promise.all([request(os.getAllKeys()), request(os.getAll())]);
  return keys.map((k, i) => [String(k), values[i] as T]);
}
