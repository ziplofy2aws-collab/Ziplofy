import { formatNavBreadcrumb, type ClientNavSearchItem } from './client-nav-catalog';

const SUGGESTED_IDS = [
  '/client/dashboard',
  '/client/chat?channel=whatsapp',
  '/client/contacts',
  '/client/broadcasts',
  '/client/templates',
  '/client/orders',
  '/client/settings',
  '/client/billing',
];

function scoreItem(item: ClientNavSearchItem, query: string): number {
  const q = query.trim().toLowerCase();
  if (!q) return 0;

  const title = item.title.toLowerCase();
  const section = item.section.toLowerCase();
  const crumb = formatNavBreadcrumb(item).toLowerCase();
  const keys = item.keywords.join(' ').toLowerCase();
  const path = item.href.toLowerCase();

  if (title === q) return 100;
  if (title.startsWith(q)) return 90;
  if (title.includes(q)) return 75;
  if (section.startsWith(q) || section.includes(q)) return 60;
  if (keys.split(/\s+/).some((k) => k.startsWith(q))) return 55;
  if (keys.includes(q)) return 50;
  if (crumb.includes(q)) return 45;
  if (path.includes(q.replace(/\s+/g, '-'))) return 35;
  if (path.includes(q.replace(/\s+/g, '/'))) return 30;

  const tokens = q.split(/\s+/).filter(Boolean);
  if (tokens.length > 1) {
    const hay = `${title} ${section} ${keys} ${path} ${crumb}`;
    if (tokens.every((t) => hay.includes(t))) return 48;
  }

  return 0;
}

export function searchClientNavCatalog(
  catalog: ClientNavSearchItem[],
  query: string,
  limit = 14
): ClientNavSearchItem[] {
  const q = query.trim();
  if (!q) {
    return catalog.filter((item) => SUGGESTED_IDS.includes(item.href)).slice(0, 8);
  }

  return catalog
    .map((item) => ({ item, score: scoreItem(item, q) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title))
    .slice(0, limit)
    .map((x) => x.item);
}

export function groupClientNavResults(
  items: ClientNavSearchItem[]
): { section: string; items: ClientNavSearchItem[] }[] {
  const map = new Map<string, ClientNavSearchItem[]>();
  for (const item of items) {
    const list = map.get(item.section) ?? [];
    list.push(item);
    map.set(item.section, list);
  }
  return Array.from(map.entries()).map(([section, groupItems]) => ({
    section,
    items: groupItems,
  }));
}
