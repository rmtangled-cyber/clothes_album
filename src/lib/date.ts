// Dates are stored as 'YYYY-MM-DD' strings in the local time zone.

export function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function fromDateString(value: string): Date {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatDate(value: string): string {
  const date = fromDateString(value);
  const week = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} (${week})`;
}

export function daysSince(value: string): number {
  const today = fromDateString(toDateString(new Date()));
  return Math.round((today.getTime() - fromDateString(value).getTime()) / 86400000);
}
