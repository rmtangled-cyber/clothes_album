export const CATEGORIES = [
  { key: 'tops', label: 'トップス' },
  { key: 'bottoms', label: 'ボトムス' },
  { key: 'onepiece', label: 'ワンピース' },
  { key: 'outer', label: 'アウター' },
  { key: 'shoes', label: 'シューズ' },
  { key: 'bag', label: 'バッグ' },
  { key: 'accessory', label: 'アクセサリー' },
  { key: 'other', label: 'その他' },
] as const;

export type CategoryKey = (typeof CATEGORIES)[number]['key'];

export function categoryLabel(key: string): string {
  return CATEGORIES.find((c) => c.key === key)?.label ?? 'その他';
}
