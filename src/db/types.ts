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

export type OutfitDetail = Outfit & { items: Item[] };

export type OutfitInput = Omit<Outfit, 'id'> & { itemIds: number[] };
export type ItemInput = Omit<Item, 'id'>;

export type ItemSort = 'newest' | 'leastRecentlyWorn' | 'mostWorn';

export type OutfitFilter = { person?: string; itemId?: number };
export type ItemFilter = { category?: string; sort?: ItemSort };

// People are stored as a comma-separated string on each outfit.
export function splitPeople(people: string): string[] {
  return people
    .split(/[,、，]/)
    .map((p) => p.trim())
    .filter(Boolean);
}
