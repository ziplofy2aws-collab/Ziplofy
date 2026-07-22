import { CODIX_ADMIN_NAV, type CodiixAdminNavTarget } from './codiix-admin-knowledge';

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/[^a-z0-9\s'#?]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function looksLikeNavCommand(query: string): boolean {
  return (
    /\b(take me|take me to|go to|open|show me|navigate|switch to|bring me|jump to)\b/.test(
      query,
    ) || /^(orders|products|customers|discounts|themes|settings|inventory|home)$/.test(query)
  );
}

function scoreNav(query: string, target: CodiixAdminNavTarget): number {
  let score = 0;
  for (const phrase of target.phrases ?? []) {
    const p = normalize(phrase);
    if (!p) continue;
    if (query === p) score += 14;
    else if (query.includes(p)) score += 10;
  }
  for (const kw of target.keywords) {
    const k = normalize(kw);
    if (!k) continue;
    if (k.includes(' ')) {
      if (query.includes(k)) score += 5;
    } else {
      const re = new RegExp(`\\b${k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (re.test(query)) score += 3;
    }
  }
  return score;
}

export type CodiixAdminNavHit = {
  target: CodiixAdminNavTarget;
  answer: string;
};

/**
 * “Take me to products” / “open orders” — admin sidebar jumps.
 * Returns null for explanatory questions (“how do I manage orders?”).
 */
export function matchAdminNavCommand(raw: string): CodiixAdminNavHit | null {
  const query = normalize(raw);
  if (!query) return null;

  // Explanatory questions should hit FAQ intents instead.
  if (
    /\b(how (do|does|to)|what (is|are|does)|where (is|are|do)|why|explain|tell me about)\b/.test(
      query,
    ) &&
    !/\b(take me|go to|open|navigate|jump to|switch to)\b/.test(query)
  ) {
    return null;
  }

  if (!looksLikeNavCommand(query)) return null;

  const ranked = CODIX_ADMIN_NAV.map((target) => ({
    target,
    score: scoreNav(query, target),
  })).sort((a, b) => b.score - a.score);

  const best = ranked[0];
  if (!best || best.score < 5) return null;

  return {
    target: best.target,
    answer: `Opening **${best.target.label}** for you.`,
  };
}
