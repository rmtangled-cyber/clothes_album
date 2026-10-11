import type { SQLiteDatabase } from 'expo-sqlite';

export type Outfit = {
  id: number;
  photo: string;
  date: string;
  people: string;
  memo: string;
};

export type Item = {
  id: number;
  name: string;
  category: string;
  color: string;
  photo: string | null;
  memo: string;
};

export type ItemWithStats = Item & {
  wear_count: number;
  last_worn: string | null;
};

export type OutfitInput = Omit<Outfit, 'id'> & { itemIds: number[] };
export type ItemInput = Omit<Item, 'id'>;

// ---- Outfits ----

export async function listOutfits(
  db: SQLiteDatabase,
  filter: { person?: string; itemId?: number } = {}
): Promise<Outfit[]> {
  const params: number[] = [];
  let whereSql = '';
  if (filter.itemId) {
    whereSql = 'WHERE o.id IN (SELECT outfit_id FROM outfit_items WHERE item_id = ?)';
    params.push(filter.itemId);
  }
  const outfits = await db.getAllAsync<Outfit>(
    `SELECT o.id, o.photo, o.date, o.people, o.memo FROM outfits o ${whereSql}
     ORDER BY o.date DESC, o.id DESC`,
    params
  );
  // Match people by exact name so "みき" does not also match "みきこ".
  const person = filter.person;
  return person ? outfits.filter((o) => splitPeople(o.people).includes(person)) : outfits;
}

export async function getOutfit(db: SQLiteDatabase, id: number) {
  const outfit = await db.getFirstAsync<Outfit>(
    'SELECT id, photo, date, people, memo FROM outfits WHERE id = ?',
    id
  );
  if (!outfit) return null;
  const items = await db.getAllAsync<Item>(
    `SELECT i.id, i.name, i.category, i.color, i.photo, i.memo
     FROM items i JOIN outfit_items oi ON oi.item_id = i.id
     WHERE oi.outfit_id = ? ORDER BY i.category, i.name`,
    id
  );
  return { ...outfit, items };
}

export async function createOutfit(db: SQLiteDatabase, input: OutfitInput): Promise<number> {
  let id = 0;
  await db.withExclusiveTransactionAsync(async (txn) => {
    const result = await txn.runAsync(
      'INSERT INTO outfits (photo, date, people, memo) VALUES (?, ?, ?, ?)',
      input.photo,
      input.date,
      input.people,
      input.memo
    );
    id = result.lastInsertRowId;
    for (const itemId of input.itemIds) {
      await txn.runAsync('INSERT INTO outfit_items (outfit_id, item_id) VALUES (?, ?)', id, itemId);
    }
  });
  return id;
}

export async function deleteOutfit(db: SQLiteDatabase, id: number) {
  await db.runAsync('DELETE FROM outfits WHERE id = ?', id);
}

// ---- Items ----

export type ItemSort = 'newest' | 'leastRecentlyWorn' | 'mostWorn';

export async function listItems(
  db: SQLiteDatabase,
  options: { category?: string; sort?: ItemSort } = {}
): Promise<ItemWithStats[]> {
  const orderBy = {
    newest: 'i.id DESC',
    // Never-worn items first, then the ones worn longest ago.
    leastRecentlyWorn: 'last_worn IS NOT NULL, last_worn ASC, i.id DESC',
    mostWorn: 'wear_count DESC, i.id DESC',
  }[options.sort ?? 'newest'];
  const params: string[] = [];
  let whereSql = '';
  if (options.category) {
    whereSql = 'WHERE i.category = ?';
    params.push(options.category);
  }
  return db.getAllAsync<ItemWithStats>(
    `SELECT i.id, i.name, i.category, i.color, i.photo, i.memo,
            COUNT(o.id) AS wear_count, MAX(o.date) AS last_worn
     FROM items i
     LEFT JOIN outfit_items oi ON oi.item_id = i.id
     LEFT JOIN outfits o ON o.id = oi.outfit_id
     ${whereSql}
     GROUP BY i.id
     ORDER BY ${orderBy}`,
    params
  );
}

export async function getItem(db: SQLiteDatabase, id: number) {
  return db.getFirstAsync<Item>(
    'SELECT id, name, category, color, photo, memo FROM items WHERE id = ?',
    id
  );
}

export async function createItem(db: SQLiteDatabase, input: ItemInput): Promise<number> {
  const result = await db.runAsync(
    'INSERT INTO items (name, category, color, photo, memo) VALUES (?, ?, ?, ?, ?)',
    input.name,
    input.category,
    input.color,
    input.photo,
    input.memo
  );
  return result.lastInsertRowId;
}

export async function deleteItem(db: SQLiteDatabase, id: number) {
  await db.runAsync('DELETE FROM items WHERE id = ?', id);
}

// ---- People ----

// People are stored as a comma-separated string on each outfit.
export function splitPeople(people: string): string[] {
  return people
    .split(/[,、，]/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export async function listPeople(db: SQLiteDatabase): Promise<string[]> {
  const rows = await db.getAllAsync<{ people: string }>(
    "SELECT people FROM outfits WHERE people != '' ORDER BY date DESC"
  );
  const seen = new Set<string>();
  for (const row of rows) {
    for (const person of splitPeople(row.people)) seen.add(person);
  }
  return [...seen];
}
