// Web data access. Mirrors the exports of queries.ts, but keeps all records in
// memory and persists them to IndexedDB after every change. Photos are stored
// separately (see lib/photos.web.ts), so the saved record stays small.
import { idbGet, idbPut, STORE_DATA } from './idb';
import {
  splitPeople,
  type Item,
  type ItemFilter,
  type ItemInput,
  type ItemWithStats,
  type Outfit,
  type OutfitDetail,
  type OutfitFilter,
  type OutfitInput,
} from './types';

export type WebData = {
  outfits: Outfit[];
  items: Item[];
  links: { outfitId: number; itemId: number }[];
  nextOutfitId: number;
  nextItemId: number;
};

const DATA_KEY = 'v1';

export class WebDb {
  constructor(public data: WebData) {}

  static async load(): Promise<WebDb> {
    const saved = await idbGet<WebData>(STORE_DATA, DATA_KEY);
    return new WebDb(saved ?? { outfits: [], items: [], links: [], nextOutfitId: 1, nextItemId: 1 });
  }

  async save() {
    await idbPut(STORE_DATA, DATA_KEY, this.data);
  }
}

type Db = WebDb;

const byDateDesc = (a: Outfit, b: Outfit) =>
  a.date === b.date ? b.id - a.id : a.date < b.date ? 1 : -1;

// ---- Outfits ----

export async function listOutfits(db: Db, filter: OutfitFilter = {}): Promise<Outfit[]> {
  let outfits = db.data.outfits;
  if (filter.itemId) {
    const ids = new Set(db.data.links.filter((l) => l.itemId === filter.itemId).map((l) => l.outfitId));
    outfits = outfits.filter((o) => ids.has(o.id));
  }
  const person = filter.person;
  if (person) {
    outfits = outfits.filter((o) => splitPeople(o.people).includes(person));
  }
  return [...outfits].sort(byDateDesc);
}

export async function getOutfit(db: Db, id: number): Promise<OutfitDetail | null> {
  const outfit = db.data.outfits.find((o) => o.id === id);
  if (!outfit) return null;
  const itemIds = new Set(db.data.links.filter((l) => l.outfitId === id).map((l) => l.itemId));
  const items = db.data.items
    .filter((i) => itemIds.has(i.id))
    .sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
  return { ...outfit, items };
}

export async function createOutfit(db: Db, input: OutfitInput): Promise<number> {
  const { itemIds, ...fields } = input;
  const id = db.data.nextOutfitId++;
  db.data.outfits.push({ id, ...fields });
  for (const itemId of itemIds) db.data.links.push({ outfitId: id, itemId });
  await db.save();
  return id;
}

export async function deleteOutfit(db: Db, id: number) {
  db.data.outfits = db.data.outfits.filter((o) => o.id !== id);
  db.data.links = db.data.links.filter((l) => l.outfitId !== id);
  await db.save();
}

// ---- Items ----

export async function listItems(db: Db, options: ItemFilter = {}): Promise<ItemWithStats[]> {
  const dates = new Map(db.data.outfits.map((o) => [o.id, o.date]));
  let items: ItemWithStats[] = db.data.items.map((item) => {
    const worn = db.data.links
      .filter((l) => l.itemId === item.id)
      .map((l) => dates.get(l.outfitId))
      .filter((d): d is string => !!d)
      .sort();
    return { ...item, wear_count: worn.length, last_worn: worn.at(-1) ?? null };
  });
  if (options.category) items = items.filter((i) => i.category === options.category);

  const sort = options.sort ?? 'newest';
  return items.sort((a, b) => {
    if (sort === 'leastRecentlyWorn') {
      // Never-worn items first, then the ones worn longest ago.
      if (a.last_worn !== b.last_worn) {
        if (a.last_worn === null) return -1;
        if (b.last_worn === null) return 1;
        return a.last_worn < b.last_worn ? -1 : 1;
      }
    } else if (sort === 'mostWorn' && a.wear_count !== b.wear_count) {
      return b.wear_count - a.wear_count;
    }
    return b.id - a.id;
  });
}

export async function getItem(db: Db, id: number): Promise<Item | null> {
  return db.data.items.find((i) => i.id === id) ?? null;
}

export async function createItem(db: Db, input: ItemInput): Promise<number> {
  const id = db.data.nextItemId++;
  db.data.items.push({ id, ...input });
  await db.save();
  return id;
}

export async function deleteItem(db: Db, id: number) {
  db.data.items = db.data.items.filter((i) => i.id !== id);
  db.data.links = db.data.links.filter((l) => l.itemId !== id);
  await db.save();
}

// ---- People ----

export async function listPeople(db: Db): Promise<string[]> {
  const seen = new Set<string>();
  for (const outfit of [...db.data.outfits].sort(byDateDesc)) {
    for (const person of splitPeople(outfit.people)) seen.add(person);
  }
  return [...seen];
}
