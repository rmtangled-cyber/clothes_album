import type { ItemWithStats } from '@/db/types';
import { daysSince } from '@/lib/date';

export function lastWornText(item: Pick<ItemWithStats, 'wear_count' | 'last_worn'>): string {
  if (!item.last_worn) return 'まだ着ていない';
  const days = daysSince(item.last_worn);
  const when = days <= 0 ? '今日' : `${days}日前`;
  return `${item.wear_count}回着用・最後は${when}`;
}
