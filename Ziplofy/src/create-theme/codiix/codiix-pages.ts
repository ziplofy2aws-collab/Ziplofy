import type { EditorSchemaDoc } from '../sidebar/create-theme-sidebar.types';
import type { ThemePreviewPage } from '../chrome/CreateThemeLivePreview';
import {
  buildThemeEditorPageMenu,
  flattenPageMenuItems,
} from '../utils/page-menu';
import {
  listBlogPostsTemplates,
  listBlogsTemplates,
  blogPostsTemplatePreviewPage,
  blogsTemplatePreviewPage,
} from '../utils/blog-templates.util';
import {
  listCollectionTemplates,
  collectionTemplatePreviewPage,
} from '../utils/collection-templates.util';
import {
  listProductTemplates,
  productTemplatePreviewPage,
} from '../utils/product-templates.util';

export type CodiixPageOption = {
  id: ThemePreviewPage;
  label: string;
  aliases: string[];
  kind?: 'page' | 'checkout';
};

export type CodiixPageAction = {
  id: string;
  label: string;
  pageId: ThemePreviewPage;
  kind?: 'page' | 'checkout';
};

export type CodiixPageMatch = {
  /** Navigate now, or only suggest pages to pick. */
  mode: 'navigate' | 'suggest';
  answer: string;
  target?: CodiixPageOption;
  suggestions: CodiixPageAction[];
};

const EXTRA_ALIASES: Record<string, string[]> = {
  index: ['home', 'homepage', 'home page', 'main page', 'landing', 'landing page', 'start'],
  products: ['all products', 'products page', 'products', 'shop all', 'catalog'],
  product: ['product page', 'product', 'pdp', 'default product', 'single product'],
  collection: ['collection page', 'collection', 'default collection'],
  'collections-list': ['collections list', 'all collections', 'collections page'],
  cart: ['cart', 'cart page', 'shopping cart', 'basket', 'bag'],
  checkout: ['checkout', 'checkout page', 'customer accounts', 'accounts'],
  search: ['search', 'search page', 'search results'],
  password: ['password', 'password page', 'store password'],
  '404': ['404', '404 page', 'not found', 'not found page', 'error page'],
  blogs: ['blog', 'blog page', 'default blog', 'blogs'],
  'blog-posts': ['blog post', 'blog posts', 'article', 'article page', 'post'],
  'gift-card': ['gift card', 'giftcard', 'gift cards'],
  pages: ['pages', 'static page', 'custom page'],
};

const SUBMENU_ONLY = new Set(['products', 'collections', 'blogs', 'blog-posts']);

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function unique(values: string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const value of values) {
    const n = normalize(value);
    if (!n || seen.has(n)) continue;
    seen.add(n);
    out.push(n);
  }
  return out;
}

function pushOption(
  list: CodiixPageOption[],
  seen: Set<string>,
  id: ThemePreviewPage,
  label: string,
  extra: string[] = [],
  kind: 'page' | 'checkout' = id === 'checkout' ? 'checkout' : 'page',
): void {
  if (!id || seen.has(id)) return;
  seen.add(id);
  list.push({
    id,
    label,
    kind,
    aliases: unique([
      label,
      id.replace(/[-_]/g, ' '),
      ...(EXTRA_ALIASES[id] ?? []),
      ...extra,
    ]),
  });
}

/** Same pages the header page picker can open. */
export function buildCodiixPageOptions(
  manifest: Record<string, unknown> | null,
  editorSchema: EditorSchemaDoc | null,
  themeConfig?: Record<string, unknown> | null,
): CodiixPageOption[] {
  const options: CodiixPageOption[] = [];
  const seen = new Set<string>();
  const menu = buildThemeEditorPageMenu(manifest, editorSchema);

  for (const item of flattenPageMenuItems(menu)) {
    // Parent rows that only open a submenu view in the picker.
    if (item.hasSubmenu && SUBMENU_ONLY.has(item.previewPage)) continue;
    pushOption(options, seen, item.previewPage, item.label);
  }

  // Explicit “All products” (products submenu entry).
  pushOption(options, seen, 'products', 'All products', ['all products', 'products']);

  for (const t of listProductTemplates(themeConfig ?? null)) {
    pushOption(options, seen, productTemplatePreviewPage(t.id), t.name, [
      'product template',
      'product page',
    ]);
  }
  for (const t of listCollectionTemplates(themeConfig ?? null)) {
    pushOption(options, seen, collectionTemplatePreviewPage(t.id), t.name, [
      'collection template',
      'collection page',
    ]);
  }
  for (const t of listBlogsTemplates(themeConfig ?? null)) {
    pushOption(options, seen, blogsTemplatePreviewPage(t.id), t.name, ['blog template', 'blog']);
  }
  for (const t of listBlogPostsTemplates(themeConfig ?? null)) {
    pushOption(options, seen, blogPostsTemplatePreviewPage(t.id), t.name, [
      'blog post template',
      'article',
    ]);
  }

  // Prefer a stable suggestion order for common pages.
  const preferred = [
    'index',
    'products',
    'product',
    'collection',
    'collections-list',
    'cart',
    'search',
    'blogs',
    'blog-posts',
    '404',
    'password',
    'gift-card',
    'checkout',
  ];
  options.sort((a, b) => {
    const ai = preferred.indexOf(a.id);
    const bi = preferred.indexOf(b.id);
    if (ai === -1 && bi === -1) return a.label.localeCompare(b.label);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  return options;
}

function toAction(page: CodiixPageOption): CodiixPageAction {
  return {
    id: `page-${page.id}`,
    label: `Go to ${page.label}`,
    pageId: page.id,
    kind: page.kind,
  };
}

function wantsPageList(query: string): boolean {
  return (
    /^(change page|switch page|switch pages|change pages|other page|another page)$/.test(query) ||
    /\b(change page|switch page|switch pages|change pages|which pages|what pages|list pages|show pages|available pages|page picker|other pages)\b/.test(
      query,
    ) ||
    /\b(take me to a page|go to a page|open a page|switch me to a page)\b/.test(query)
  );
}

function hasNavIntent(query: string): boolean {
  return /\b(take me|take mee|switch me|switch to|go to|go back|bring me|open|show me|navigate to|change to|change page to|move to|jump to|send me|back to)\b/.test(
    query,
  );
}

function isExplanatory(query: string): boolean {
  return /\b(how (do|does|to)|what (is|are|does)|why|explain|difference|vs|versus)\b/.test(query);
}

/** Strip nav filler so “take me back to the home page” → “home page”. */
function extractPageCore(query: string): string {
  return normalize(query)
    .replace(
      /\b(please|pls|can you|could you|would you|will you|alright|all right|ok|okay|yeah|yes|sure|just|now|then|also|for me|thanks|thank you)\b/g,
      ' ',
    )
    .replace(
      /\b(take me|take mee|switch me|bring me|send me|navigate me|go|switch|open|show|navigate|change|move|jump|back)\b/g,
      ' ',
    )
    .replace(/\b(to|onto|into|the|a|an|my|me|page|template|preview|editor)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function scorePage(core: string, query: string, page: CodiixPageOption): number {
  let score = 0;
  const label = normalize(page.label);

  for (const alias of page.aliases) {
    if (!alias) continue;
    if (core === alias || query === alias) score = Math.max(score, 40);
    else if (core.includes(alias) || query.includes(alias)) score = Math.max(score, 28);
    else if (alias.includes(core) && core.length >= 3) score = Math.max(score, 18);
  }

  if (core === label) score = Math.max(score, 40);
  else if (label.includes(core) && core.length >= 3) score = Math.max(score, 22);

  // “home page” / “cart page” after partial strip
  const withPage = `${core} page`;
  for (const alias of page.aliases) {
    if (withPage === alias || query.includes(`${alias} page`)) score = Math.max(score, 32);
  }

  return score;
}

function suggestionList(
  pages: CodiixPageOption[],
  currentPageId: string | undefined,
  limit = 6,
  excludeId?: string,
): CodiixPageAction[] {
  return pages
    .filter((p) => p.id !== currentPageId && p.id !== excludeId)
    .slice(0, limit)
    .map(toAction);
}

export function matchPageCommand(
  raw: string,
  pages: CodiixPageOption[],
  currentPageId?: string,
  previousPageId?: string | null,
): CodiixPageMatch | null {
  if (!pages.length) return null;
  const query = normalize(raw);
  if (!query || isExplanatory(query)) return null;

  // Don’t steal section-add phrasing (“add product”, “insert hero”).
  if (/\b(add|insert|create|include)\b/.test(query) && !hasNavIntent(query)) {
    return null;
  }

  const listIntent = wantsPageList(query);
  const navIntent = hasNavIntent(query);
  const pageWord = /\bpage\b/.test(query) || /\btemplate\b/.test(query);

  // “go back” / “take me back” without a destination → previous page, else home.
  if (
    /^(go back|take me back|back|previous page|last page)$/.test(query) ||
    (/\b(go back|take me back|previous page|last page)\b/.test(query) &&
      !extractPageCore(query))
  ) {
    const backId = previousPageId && previousPageId !== currentPageId ? previousPageId : 'index';
    const target = pages.find((p) => p.id === backId) ?? pages.find((p) => p.id === 'index');
    if (!target) return null;
    return {
      mode: 'navigate',
      target,
      answer:
        target.id === currentPageId
          ? `You’re already on **${target.label}**.`
          : `Taking you back to **${target.label}**.`,
      suggestions: suggestionList(pages, currentPageId, 5, target.id),
    };
  }

  if (listIntent && !extractPageCore(query.replace(/\b(change|switch|page|pages|other|another|a|the|to|me)\b/g, ' ').replace(/\s+/g, ' ').trim())) {
    return {
      mode: 'suggest',
      answer:
        currentPageId
          ? `You’re on **${pages.find((p) => p.id === currentPageId)?.label ?? 'this page'}** right now.\n\nPick a page below — same as the page selector in the top bar.`
          : 'Pick a page below — same as the page selector in the top bar.',
      suggestions: suggestionList(pages, currentPageId, 8),
    };
  }

  if (!navIntent && !pageWord && !listIntent) {
    // Allow bare page names that are unambiguous (“cart”, “home”, “search”, “404”).
    const bare = pages
      .map((p) => ({ p, score: scorePage(query, query, p) }))
      .filter((x) => x.score >= 40)
      .sort((a, b) => b.score - a.score);
    if (bare[0] && bare[0].score >= 40 && (bare.length === 1 || bare[0].score > bare[1].score)) {
      const target = bare[0].p;
      return {
        mode: 'navigate',
        target,
        answer:
          target.id === currentPageId
            ? `You’re already on **${target.label}**.`
            : `Switching you to **${target.label}**.`,
        suggestions: suggestionList(pages, currentPageId, 5, target.id),
      };
    }
    return null;
  }

  const core = extractPageCore(query);
  const ranked = pages
    .map((p) => ({ p, score: scorePage(core || query, query, p) }))
    .filter((x) => x.score >= 14)
    .sort((a, b) => b.score - a.score);

  if (!ranked.length) {
    if (navIntent || listIntent || pageWord) {
      return {
        mode: 'suggest',
        answer:
          'I couldn’t tell which page you meant.\n\nHere are pages from the top selector — tap one and I’ll switch you there.',
        suggestions: suggestionList(pages, currentPageId, 8),
      };
    }
    return null;
  }

  const best = ranked[0]!;
  const second = ranked[1];
  const ambiguous = second && best.score - second.score < 6 && second.score >= 18;

  if (ambiguous && !navIntent) {
    return {
      mode: 'suggest',
      answer: `A few pages match that — which one do you want?`,
      suggestions: ranked.slice(0, 5).map((r) => toAction(r.p)),
    };
  }

  const target = best.p;
  return {
    mode: 'navigate',
    target,
    answer:
      target.id === currentPageId
        ? `You’re already on **${target.label}**.\n\nWant a different page?`
        : `On it — switching you to **${target.label}** (same as the page selector above).`,
    suggestions: suggestionList(pages, currentPageId, 5, target.id),
  };
}

export function currentPageLabel(
  pages: CodiixPageOption[],
  currentPageId: string | undefined,
): string {
  return pages.find((p) => p.id === currentPageId)?.label ?? 'Home page';
}
