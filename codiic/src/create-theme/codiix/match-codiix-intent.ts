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
import {
  matchPageCommand,
  type CodiixPageAction,
  type CodiixPageOption,
} from './codiix-pages';
import {
  matchReorderCommand,
  type CodiixReorderPlan,
  type CodiixStructureSection,
} from './codiix-reorder';
import {
  matchAnnouncementEditCommand,
  resolveAnnouncementContext,
  type CodiixAnnouncementContext,
  type CodiixEditPlan,
} from './codiix-edit-announcement';

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

/** Global editor commands — work in any mode (not Agentic-only). */
export type CodiixSystemAction =
  | 'save'
  | 'apply'
  | 'navigate'
  | 'list-pages'
  | 'reorder'
  | 'edit';

export type CodiixMatch = {
  intentId: string | null;
  answer: string;
  relatedSuggestions: { id: string; label: string }[];
  actions?: CodiixAgenticAction[];
  relatedActions?: CodiixAgenticAction[];
  relatedCategoryLabel?: string;
  previewElementId?: string;
  /** Editor command to run after answering (any mode). */
  systemAction?: CodiixSystemAction;
  pageTargetId?: string;
  pageActions?: CodiixPageAction[];
  /** One-tap editor actions (e.g. Apply theme after save). */
  editorActions?: { id: string; label: string; action: 'apply' }[];
  reorderPlan?: CodiixReorderPlan;
  structureHints?: { id: string; label: string }[];
  editPlan?: CodiixEditPlan;
  editHelpHints?: { id: string; label: string }[];
};

export type CodiixMatchOptions = {
  agentic?: boolean;
  pages?: CodiixPageOption[];
  currentPageId?: string;
  previousPageId?: string | null;
  structure?: CodiixStructureSection[];
  announcement?: CodiixAnnouncementContext | null;
};

/** “Save my changes” / “alright save” — not “what is save” / “save vs apply”. */
export function matchSaveCommand(raw: string): boolean {
  const query = normalize(raw);
  if (!query || !/\bsave\b/.test(query)) return false;

  // Explanatory / comparison questions → FAQ, not the save API.
  if (
    /\b(vs|versus|difference|differ|mean|means|explain|how (do|does|to)|what (is|does)|when (do|should)|why)\b/.test(
      query,
    )
  ) {
    return false;
  }

  // Strip casual filler so “alright save”, “ok please save it” → “save” / “save it”.
  const core = query
    .replace(
      /\b(alright|all right|allright|ok|okay|k|yeah|yep|yup|yes|sure|please|pls|just|now|then|also|too|again|can you|could you|would you|will you|go ahead( and)?|for me|thanks|thank you|thx|man|bro|dude|mate)\b/g,
      ' ',
    )
    .replace(
      /\b(i want( you)?( to)?|i need( you)?( to)?|i'd like( you)?( to)?|id like( you)?( to)?|hit|do)\b/g,
      ' ',
    )
    .replace(/\s+/g, ' ')
    .trim();

  if (!core || !/\bsave\b/.test(core)) return false;

  // Pure / near-pure save commands after filler strip.
  if (
    /^(save|save (it|this|that|them|now|changes|work|theme|progress|edits|everything|stuff)|save (my )?(changes|work|theme|progress|edits|stuff)|save the theme)$/.test(
      core,
    )
  ) {
    return true;
  }

  // Short imperative with “save” as the main verb (covers “save my work”, “save for later”, etc.).
  const words = core.split(' ');
  if (
    words.length <= 5 &&
    /\bsave\b/.test(core) &&
    !/\b(section|header|hero|banner|product|form|apply|publish|live|deploy)\b/.test(core)
  ) {
    return true;
  }

  return false;
}

/** “Apply theme” / “make it live” — not “save vs apply” FAQ. */
export function matchApplyCommand(raw: string): boolean {
  const query = normalize(raw);
  if (!query) return false;

  // Explanatory / comparison → FAQ.
  if (
    /\b(vs|versus|difference|differ|mean|means|explain|how (do|does|to)|what (is|does)|when (do|should)|why)\b/.test(
      query,
    )
  ) {
    return false;
  }

  const core = query
    .replace(
      /\b(alright|all right|allright|ok|okay|k|yeah|yep|yup|yes|sure|please|pls|just|now|then|also|too|again|can you|could you|would you|will you|go ahead( and)?|for me|thanks|thank you|thx|man|bro|dude|mate)\b/g,
      ' ',
    )
    .replace(
      /\b(i want( you)?( to)?|i need( you)?( to)?|i'd like( you)?( to)?|id like( you)?( to)?|hit|do)\b/g,
      ' ',
    )
    .replace(/\s+/g, ' ')
    .trim();

  if (
    /^(apply|apply theme|apply it|apply this|apply now|apply my theme|apply the theme|publish|publish theme|publish it|make it live|go live|push live|deploy|deploy theme)$/.test(
      core,
    )
  ) {
    return true;
  }

  return /\b(apply\s+(my\s+)?(theme|it|this|now)|apply\s+the\s+theme|make\s+it\s+live|go\s+live|publish(\s+theme)?|push\s+(it\s+)?live|deploy(\s+theme)?)\b/.test(
    query,
  );
}

export function matchCodiixIntent(
  raw: string,
  options?: CodiixMatchOptions,
): CodiixMatch {
  const query = normalize(raw);
  const agentic = Boolean(options?.agentic);
  const pages = options?.pages ?? [];

  if (!query) {
    return {
      intentId: null,
      answer: CODIX_FALLBACK,
      relatedSuggestions: CODIX_INTENTS.filter((i) => i.suggestion)
        .slice(0, 4)
        .map((i) => ({ id: i.id, label: i.suggestion! })),
    };
  }

  // Save works in normal + Agentic — always checked first.
  if (matchSaveCommand(query)) {
    return {
      intentId: 'save-command',
      answer:
        'On it — saving the work you’re doing on your theme now.',
      relatedSuggestions: [
        { id: 'save-apply', label: 'Save vs Apply theme' },
        { id: 'agentic-mode', label: 'What is Agentic mode?' },
        { id: 'add-section', label: 'How do I add a section?' },
      ],
      systemAction: 'save',
      editorActions: [{ id: 'apply-theme', label: 'Apply theme', action: 'apply' }],
    };
  }

  // Apply theme — any mode (same as ⋮ → Apply theme).
  if (matchApplyCommand(query)) {
    return {
      intentId: 'apply-command',
      answer:
        'On it — applying this theme to your storefront so your customers can see it. If it’s already applied, nothing changes.',
      relatedSuggestions: [
        { id: 'save-apply', label: 'Save vs Apply theme' },
        { id: 'pages-templates', label: 'Pages & templates' },
        { id: 'agentic-mode', label: 'What is Agentic mode?' },
      ],
      systemAction: 'apply',
    };
  }

  // Announcement bar edits (any mode) — first element with chat editing.
  {
    const editHit = matchAnnouncementEditCommand(raw, options?.announcement ?? null);
    if (editHit) {
      return {
        intentId:
          editHit.mode === 'edit'
            ? 'edit-announcement'
            : editHit.mode === 'missing'
              ? 'edit-announcement-missing'
              : 'edit-announcement-help',
        answer: editHit.answer,
        relatedSuggestions: [
          { id: 'header-elements', label: 'What are header elements?' },
          { id: 'reorder', label: 'How do I reorder sections?' },
          { id: 'save-apply', label: 'Save vs Apply theme' },
        ],
        systemAction: editHit.mode === 'edit' ? 'edit' : undefined,
        editPlan: editHit.plan,
        editHelpHints: editHit.helpHints,
      };
    }
  }

  // Reorder sections on the current page (any mode).
  const structure = options?.structure ?? [];
  if (structure.length || /\b(move|reorder|sections|structure)\b/.test(query)) {
    const reorderHit = matchReorderCommand(query, structure);
    if (reorderHit) {
      return {
        intentId:
          reorderHit.mode === 'reorder'
            ? 'reorder-command'
            : reorderHit.mode === 'list'
              ? 'structure-list'
              : 'reorder-suggest',
        answer: reorderHit.answer,
        relatedSuggestions: [
          { id: 'reorder', label: 'How do I reorder sections?' },
          { id: 'pages-templates', label: 'Pages & templates' },
          { id: 'agentic-mode', label: 'What is Agentic mode?' },
        ],
        systemAction: reorderHit.mode === 'reorder' ? 'reorder' : undefined,
        reorderPlan: reorderHit.plan,
        structureHints: reorderHit.structureHints,
      };
    }
  }

  // Page navigation — any mode, using the same pages as the top selector.
  if (pages.length) {
    const pageHit = matchPageCommand(
      query,
      pages,
      options?.currentPageId,
      options?.previousPageId,
    );
    if (pageHit) {
      return {
        intentId: pageHit.mode === 'navigate' ? 'page-navigate' : 'page-list',
        answer: pageHit.answer,
        relatedSuggestions: [
          { id: 'pages-templates', label: 'Pages & templates' },
          { id: 'save-apply', label: 'Save vs Apply theme' },
          { id: 'agentic-mode', label: 'What is Agentic mode?' },
        ],
        systemAction: pageHit.mode === 'navigate' ? 'navigate' : 'list-pages',
        pageTargetId: pageHit.target?.id,
        pageActions: pageHit.suggestions,
      };
    }
  }

  if (agentic) {
    // Don’t let “add product” matching steal FAQ questions like “what are product elements?”
    const looksLikeQuestion =
      /\b(what|how|why|which|where|who|explain|tell me about)\b/.test(query) ||
      /\?$/.test(raw.trim());
    if (!looksLikeQuestion) {
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
        ? `${CODIX_FALLBACK}\n\n**Agentic tip:** try “add header”, “hero”, “faq”, or “contact form”.\n**Pages:** try “take me to cart” or “switch to home”.`
        : `${CODIX_FALLBACK}\n\nTip: say **“take me to cart”** or **“change page”** to switch templates.`,
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
  let pageActions: CodiixPageAction[] | undefined;
  let systemAction: CodiixSystemAction | undefined;

  if (agentic && actions && actions.length > 0) {
    relatedCategoryLabel = getCodiixCategoryLabel(best.intent.categoryId!);
    previewElementId = actions[0]?.elementId;
    answer +=
      `\n\n**Agentic mode is on** — here’s a preview of **${actions[0]?.label.replace(/^Add\s+/i, '')}**, plus more from **${relatedCategoryLabel}**.`;
  } else if (!agentic && /\b(add|insert|create)\b/.test(query)) {
    answer +=
      '\n\nWant me to do it? Turn on **Agentic** in the Codiix header, then ask again (even just “hero” or “add faq”).';
  }

  // When talking about pages/templates, attach quick page jumps from the picker.
  if (best.intent.id === 'pages-templates' && pages.length) {
    pageActions = pages
      .filter((p) => p.id !== options?.currentPageId)
      .slice(0, 6)
      .map((p) => ({
        id: `page-${p.id}`,
        label: `Go to ${p.label}`,
        pageId: p.id,
        kind: p.kind,
      }));
    systemAction = 'list-pages';
    answer +=
      '\n\nOr just tell me — e.g. **“take me to cart”**, **“switch to product page”**, or **“go back”**.';
  }

  return {
    intentId: best.intent.id,
    answer,
    relatedSuggestions: related,
    actions: actions?.slice(0, 1),
    relatedActions: actions && actions.length > 1 ? actions.slice(1) : undefined,
    relatedCategoryLabel,
    previewElementId,
    systemAction,
    pageActions,
  };
}

export function answerForIntentId(id: string): string | null {
  return CODIX_INTENTS.find((i) => i.id === id)?.answer ?? null;
}

export function categoryIdForIntent(id: string): string | undefined {
  return CODIX_INTENTS.find((i) => i.id === id)?.categoryId;
}
