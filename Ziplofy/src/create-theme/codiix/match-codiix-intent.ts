import {
  CODIX_FALLBACK,
  CODIX_INTENTS,
  type CodiixIntent,
} from './codiix-knowledge';
import {
  agenticSuggestionsForCategory,
  getCodiixCategoryLabel,
  matchAgenticCommand,
  type CodiixAgenticAction,
} from './codiix-elements-catalog';

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/[^a-z0-9\s'#?]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function scoreIntent(query: string, intent: CodiixIntent): number {
  let score = 0;

  for (const phrase of intent.phrases ?? []) {
    const p = normalize(phrase);
    if (!p) continue;
    if (query === p) score += 12;
    else if (query.includes(p)) score += 8;
  }

  for (const kw of intent.keywords) {
    const k = normalize(kw);
    if (!k) continue;
    if (k.includes(' ')) {
      if (query.includes(k)) score += 4;
    } else {
      const re = new RegExp(`\\b${k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (re.test(query)) score += 2;
    }
  }

  return score;
}

export type CodiixMatch = {
  intentId: string | null;
  answer: string;
  relatedSuggestions: { id: string; label: string }[];
  actions?: CodiixAgenticAction[];
  relatedActions?: CodiixAgenticAction[];
  relatedCategoryLabel?: string;
  previewElementId?: string;
};

export function matchCodiixIntent(
  raw: string,
  options?: { agentic?: boolean },
): CodiixMatch {
  const query = normalize(raw);
  const agentic = Boolean(options?.agentic);

  if (!query) {
    return {
      intentId: null,
      answer: CODIX_FALLBACK,
      relatedSuggestions: CODIX_INTENTS.filter((i) => i.suggestion)
        .slice(0, 4)
        .map((i) => ({ id: i.id, label: i.suggestion! })),
    };
  }

  if (agentic) {
    const agenticHit = matchAgenticCommand(query);
    if (agenticHit) {
      return {
        intentId: agenticHit.action.id,
        answer: agenticHit.answer,
        relatedSuggestions: [
          { id: 'product-elements', label: 'What are product elements?' },
          { id: 'banner-elements', label: 'What are banner elements?' },
          { id: 'agentic-mode', label: 'What is Agentic mode?' },
        ],
        actions: [agenticHit.action],
        relatedActions: agenticHit.relatedActions,
        relatedCategoryLabel: agenticHit.relatedCategoryLabel,
        previewElementId: agenticHit.previewElementId,
      };
    }
  }

  const ranked = CODIX_INTENTS.map((intent) => ({
    intent,
    score: scoreIntent(query, intent),
  })).sort((a, b) => b.score - a.score);

  const best = ranked[0];
  if (!best || best.score < 2) {
    return {
      intentId: null,
      answer: agentic
        ? `${CODIX_FALLBACK}\n\n**Agentic tip:** try “add header”, “hero”, “faq”, or “contact form”.`
        : CODIX_FALLBACK,
      relatedSuggestions: CODIX_INTENTS.filter((i) => i.suggestion)
        .slice(0, 4)
        .map((i) => ({ id: i.id, label: i.suggestion! })),
    };
  }

  const related = ranked
    .slice(1)
    .filter((r) => r.score >= 2 && r.intent.suggestion)
    .slice(0, 3)
    .map((r) => ({ id: r.intent.id, label: r.intent.suggestion! }));

  const actions =
    agentic && best.intent.categoryId
      ? agenticSuggestionsForCategory(best.intent.categoryId)
      : undefined;

  let answer = best.intent.answer;
  let relatedCategoryLabel: string | undefined;
  let previewElementId: string | undefined;

  if (agentic && actions && actions.length > 0) {
    relatedCategoryLabel = getCodiixCategoryLabel(best.intent.categoryId!);
    previewElementId = actions[0]?.elementId;
    answer +=
      `\n\n**Agentic mode is on** — here’s a preview of **${actions[0]?.label.replace(/^Add\s+/i, '')}**, plus more from **${relatedCategoryLabel}**.`;
  } else if (!agentic && /\b(add|insert|create)\b/.test(query)) {
    answer +=
      '\n\nWant me to do it? Turn on **Agentic** in the Codiix header, then ask again (even just “hero” or “add faq”).';
  }

  return {
    intentId: best.intent.id,
    answer,
    relatedSuggestions: related,
    actions: actions?.slice(0, 1),
    relatedActions: actions && actions.length > 1 ? actions.slice(1) : undefined,
    relatedCategoryLabel,
    previewElementId,
  };
}

export function answerForIntentId(id: string): string | null {
  return CODIX_INTENTS.find((i) => i.id === id)?.answer ?? null;
}

export function categoryIdForIntent(id: string): string | undefined {
  return CODIX_INTENTS.find((i) => i.id === id)?.categoryId;
}
