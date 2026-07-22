import {
  CODIX_ADMIN_FALLBACK,
  CODIX_ADMIN_INTENTS,
  CODIX_ADMIN_SUGGESTIONS,
} from './codiix-admin-knowledge';
import { matchAdminNavCommand } from './codiix-admin-nav';
import { buildCreateBlogForm, buildCreateBlogPostForm, buildCreateCollectionForm, matchCreateBlogCommand, matchCreateBlogPostCommand, matchCreateCollectionCommand } from './codiix-chat-form';
import type { CodiixChatForm } from './codiix-chat-form';
import {
  matchAppliedThemeCommand,
  matchChangeThemeCommand,
  matchEditCurrentThemeCommand,
  type CodiixPanelAction,
  type CodiixThemePickOption,
} from './codiix-admin-themes';
import {
  CODIX_FALLBACK,
  CODIX_INTENTS,
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

/** Global editor / admin commands — work in any mode (not Agentic-only). */
export type CodiixSystemAction =
  | 'save'
  | 'apply'
  | 'navigate'
  | 'list-pages'
  | 'reorder'
  | 'edit'
  | 'admin-navigate'
  | 'admin-form'
  | 'admin-applied-theme'
  | 'admin-change-theme'
  | 'admin-edit-current-theme';

export type CodiixSurface = 'theme-editor' | 'admin';

export type CodiixMatch = {
  intentId: string | null;
  answer: string;
  relatedSuggestions: { id: string; label: string }[];
  actions?: CodiixAgenticAction[];
  relatedActions?: CodiixAgenticAction[];
  relatedCategoryLabel?: string;
  previewElementId?: string;
  /** Editor / admin command to run after answering (any mode). */
  systemAction?: CodiixSystemAction;
  pageTargetId?: string;
  /** Admin sidebar path to open. */
  adminPath?: string;
  pageActions?: CodiixPageAction[];
  /** One-tap editor actions (e.g. Apply theme after save). */
  editorActions?: { id: string; label: string; action: 'apply' }[];
  reorderPlan?: CodiixReorderPlan;
  structureHints?: { id: string; label: string }[];
  editPlan?: CodiixEditPlan;
  editHelpHints?: { id: string; label: string }[];
  adminNavActions?: { id: string; label: string; path: string; primary?: boolean }[];
  /** In-chat form to collect inputs (admin create flows). */
  form?: CodiixChatForm;
  panelActions?: CodiixPanelAction[];
  themePickActions?: CodiixThemePickOption[];
};

export type CodiixMatchOptions = {
  agentic?: boolean;
  /** theme-editor (default) or store admin. */
  surface?: CodiixSurface;
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

function matchAdminSurfaceIntent(raw: string, query: string): CodiixMatch {
  if (matchEditCurrentThemeCommand(raw)) {
    return {
      intentId: 'admin-edit-current-theme',
      answer: 'Opening your live theme editor…',
      relatedSuggestions: [
        { id: 'admin-applied-theme', label: 'Which theme is applied?' },
        { id: 'admin-change-theme', label: 'Change theme' },
      ],
      systemAction: 'admin-edit-current-theme',
    };
  }

  if (matchChangeThemeCommand(raw)) {
    return {
      intentId: 'admin-change-theme',
      answer: 'Loading your themes…',
      relatedSuggestions: [
        { id: 'admin-applied-theme', label: 'Which theme is applied?' },
        { id: 'admin-edit-current-theme', label: 'Edit my current theme' },
      ],
      systemAction: 'admin-change-theme',
    };
  }

  if (matchAppliedThemeCommand(raw)) {
    return {
      intentId: 'admin-applied-theme',
      answer: 'Checking your live theme…',
      relatedSuggestions: [
        { id: 'admin-edit-current-theme', label: 'Edit my current theme' },
        { id: 'admin-change-theme', label: 'Change theme' },
      ],
      systemAction: 'admin-applied-theme',
    };
  }

  // Blog post before blog — “create a blog post” must not open the blog form.
  if (matchCreateBlogPostCommand(raw)) {
    return {
      intentId: 'admin-create-blog-post',
      answer:
        'Sure — pick a blog and fill in the post details below, then I’ll create it for you.',
      relatedSuggestions: [
        { id: 'admin-create-blog', label: 'Create a blog' },
        { id: 'admin-create-collection', label: 'Create a collection' },
      ],
      systemAction: 'admin-form',
      // Panel fills blog options before showing the form.
      form: buildCreateBlogPostForm([]),
    };
  }

  if (matchCreateBlogCommand(raw)) {
    return {
      intentId: 'admin-create-blog',
      answer:
        'Sure — fill in the blog details below and I’ll create it for you.',
      relatedSuggestions: [
        { id: 'admin-create-blog-post', label: 'Create a blog post' },
        { id: 'admin-create-collection', label: 'Create a collection' },
      ],
      systemAction: 'admin-form',
      form: buildCreateBlogForm(),
    };
  }

  if (matchCreateCollectionCommand(raw)) {
    return {
      intentId: 'admin-create-collection',
      answer:
        'Sure — fill in the collection details below and I’ll create it for you.',
      relatedSuggestions: [
        { id: 'admin-products', label: 'How do I add a product?' },
        { id: 'admin-create-blog', label: 'Create a blog' },
      ],
      systemAction: 'admin-form',
      form: buildCreateCollectionForm(),
    };
  }

  const navHit = matchAdminNavCommand(raw);
  if (navHit) {
    return {
      intentId: `admin-nav-${navHit.target.id}`,
      answer: navHit.answer,
      relatedSuggestions: CODIX_ADMIN_SUGGESTIONS.slice(0, 3),
      systemAction: 'admin-navigate',
      adminPath: navHit.target.path,
      adminNavActions: CODIX_ADMIN_NAV_QUICK.filter((t) => t.path !== navHit.target.path).slice(
        0,
        4,
      ),
    };
  }

  const ranked = CODIX_ADMIN_INTENTS.map((intent) => ({
    intent,
    score: scoreIntent(query, intent),
  })).sort((a, b) => b.score - a.score);

  const best = ranked[0];
  if (!best || best.score < 2) {
    return {
      intentId: null,
      answer: `${CODIX_ADMIN_FALLBACK}\n\nTip: say **“create a collection”**, **“create a blog post”**, or **“take me to products”**.`,
      relatedSuggestions: CODIX_ADMIN_SUGGESTIONS.slice(0, 4),
    };
  }

  const related = ranked
    .slice(1)
    .filter((r) => r.score >= 2 && r.intent.suggestion)
    .slice(0, 3)
    .map((r) => ({ id: r.intent.id, label: r.intent.suggestion! }));

  if (best.intent.id === 'admin-create-blog-post') {
    return {
      intentId: 'admin-create-blog-post',
      answer:
        'Sure — pick a blog and fill in the post details below, then I’ll create it for you.',
      relatedSuggestions: related,
      systemAction: 'admin-form',
      form: buildCreateBlogPostForm([]),
    };
  }

  if (best.intent.id === 'admin-create-blog') {
    return {
      intentId: 'admin-create-blog',
      answer:
        'Sure — fill in the blog details below and I’ll create it for you.',
      relatedSuggestions: related,
      systemAction: 'admin-form',
      form: buildCreateBlogForm(),
    };
  }

  if (best.intent.id === 'admin-create-collection') {
    return {
      intentId: 'admin-create-collection',
      answer:
        'Sure — fill in the collection details below and I’ll create it for you.',
      relatedSuggestions: related,
      systemAction: 'admin-form',
      form: buildCreateCollectionForm(),
    };
  }

  if (best.intent.id === 'admin-applied-theme') {
    return {
      intentId: 'admin-applied-theme',
      answer: 'Checking your live theme…',
      relatedSuggestions: related,
      systemAction: 'admin-applied-theme',
    };
  }

  if (best.intent.id === 'admin-change-theme') {
    return {
      intentId: 'admin-change-theme',
      answer: 'Loading your themes…',
      relatedSuggestions: related,
      systemAction: 'admin-change-theme',
    };
  }

  if (best.intent.id === 'admin-edit-current-theme') {
    return {
      intentId: 'admin-edit-current-theme',
      answer: 'Opening your live theme editor…',
      relatedSuggestions: related,
      systemAction: 'admin-edit-current-theme',
    };
  }

  return {
    intentId: best.intent.id,
    answer: best.intent.answer,
    relatedSuggestions: related.length
      ? related
      : CODIX_ADMIN_SUGGESTIONS.filter((s) => s.id !== best.intent.id).slice(0, 3),
    adminNavActions: CODIX_ADMIN_NAV_QUICK.slice(0, 4),
  };
}

const CODIX_ADMIN_NAV_QUICK = [
  { id: 'products', label: 'Go to Products', path: '/products' },
  { id: 'orders', label: 'Go to Orders', path: '/orders' },
  { id: 'customers', label: 'Go to Customers', path: '/customers' },
  { id: 'themes', label: 'Go to Themes', path: '/online-store/themes' },
  { id: 'discounts', label: 'Go to Discounts', path: '/discounts' },
  { id: 'settings', label: 'Go to Settings', path: '/settings' },
];

export function matchCodiixIntent(
  raw: string,
  options?: CodiixMatchOptions,
): CodiixMatch {
  const query = normalize(raw);
  const agentic = Boolean(options?.agentic);
  const pages = options?.pages ?? [];
  const surface = options?.surface ?? 'theme-editor';

  if (surface === 'admin') {
    if (!query) {
      return {
        intentId: null,
        answer: CODIX_ADMIN_FALLBACK,
        relatedSuggestions: CODIX_ADMIN_SUGGESTIONS.slice(0, 4),
      };
    }
    return matchAdminSurfaceIntent(raw, query);
  }

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

export function answerForIntentId(
  id: string,
  surface: CodiixSurface = 'theme-editor',
): string | null {
  const intents = surface === 'admin' ? CODIX_ADMIN_INTENTS : CODIX_INTENTS;
  return intents.find((i) => i.id === id)?.answer ?? null;
}

export function categoryIdForIntent(
  id: string,
  surface: CodiixSurface = 'theme-editor',
): string | undefined {
  const intents = surface === 'admin' ? CODIX_ADMIN_INTENTS : CODIX_INTENTS;
  return intents.find((i) => i.id === id)?.categoryId;
}
