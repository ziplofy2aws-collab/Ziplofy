export type CodiixElementCategory = {
  id: string;
  label: string;
  where: string;
  items: { name: string; elementId?: string; ready: boolean }[];
};

export type CodiixAgenticAction = {
  id: string;
  label: string;
  elementId: string;
};

export type CodiixAgenticMatch = {
  answer: string;
  action: CodiixAgenticAction;
  relatedActions: CodiixAgenticAction[];
  relatedCategoryLabel: string;
  previewElementId: string;
};

type CodiixElementDef = {
  elementId: string;
  name: string;
  categoryId: string;
  ready?: boolean;
  /** Extra spoken phrases beyond auto-generated “add {name}” variants */
  phrases?: string[];
  keywords?: string[];
};

const CATEGORY_META: Record<string, { label: string; where: string }> = {
  header: {
    label: 'Header elements',
    where: 'Left sidebar → Header group → Add section',
  },
  banners: {
    label: 'Banner elements',
    where: 'Left sidebar → Template → Add section → Banners',
  },
  text: {
    label: 'Text elements',
    where: 'Left sidebar → Template → Add section → Text',
  },
  products: {
    label: 'Product elements',
    where: 'Left sidebar → Template → Add section → Products',
  },
  collections: {
    label: 'Collection elements',
    where: 'Left sidebar → Template → Add section → Collections',
  },
  forms: {
    label: 'Forms',
    where: 'Left sidebar → Template or Footer → Add section → Forms',
  },
  storytelling: {
    label: 'Storytelling elements',
    where: 'Left sidebar → Template → Add section → Storytelling',
  },
  layout: {
    label: 'Layout elements',
    where: 'Left sidebar → Template / Footer → Add section → Layout',
  },
  footer: {
    label: 'Footer elements',
    where: 'Left sidebar → Footer group → Add section',
  },
};

/**
 * Single source of truth for Codiix — every create-theme section id + how to ask for it.
 * Aligns with CREATE_THEME_ELEMENTS / catalog-groups.
 */
const CODIX_ELEMENTS: CodiixElementDef[] = [
  // Header
  {
    elementId: 'announcement-bar',
    name: 'Announcement bar',
    categoryId: 'header',
    phrases: ['add announcement', 'add announcement bar'],
    keywords: ['announcement', 'announcement bar'],
  },
  {
    elementId: 'header',
    name: 'Header',
    categoryId: 'header',
    phrases: ['add header', 'add a header', 'insert header'],
    keywords: ['header', 'navigation'],
  },
  {
    elementId: 'divider',
    name: 'Divider',
    categoryId: 'header',
    phrases: ['add divider', 'add a divider'],
    keywords: ['divider', 'separator'],
  },

  // Banners
  {
    elementId: 'hero',
    name: 'Hero',
    categoryId: 'banners',
    phrases: ['add hero', 'add a hero', 'add banner', 'add a banner'],
    keywords: ['hero', 'banner'],
  },
  {
    elementId: 'hero-bottom-aligned',
    name: 'Hero: Bottom aligned',
    categoryId: 'banners',
    phrases: ['add hero bottom aligned', 'add bottom aligned hero'],
    keywords: ['hero bottom', 'bottom aligned'],
  },
  {
    elementId: 'hero-marquee',
    name: 'Hero: Marquee',
    categoryId: 'banners',
    phrases: ['add hero marquee'],
    keywords: ['hero marquee'],
  },
  {
    elementId: 'large-logo',
    name: 'Large logo',
    categoryId: 'banners',
    phrases: ['add large logo'],
    keywords: ['large logo'],
  },
  {
    elementId: 'layered-slideshow',
    name: 'Layered slideshow',
    categoryId: 'banners',
    phrases: ['add layered slideshow', 'add slideshow'],
    keywords: ['layered slideshow', 'slideshow'],
  },
  {
    elementId: 'slideshow-full-frame',
    name: 'Slideshow: Full frame',
    categoryId: 'banners',
    phrases: ['add full frame slideshow', 'add slideshow full frame'],
    keywords: ['full frame', 'slideshow full'],
  },
  {
    elementId: 'slideshow-inset',
    name: 'Slideshow: Inset',
    categoryId: 'banners',
    phrases: ['add inset slideshow', 'add slideshow inset'],
    keywords: ['inset slideshow', 'slideshow inset'],
  },
  {
    elementId: 'split-showcase',
    name: 'Split showcase',
    categoryId: 'banners',
    phrases: ['add split showcase'],
    keywords: ['split showcase', 'split'],
  },

  // Text
  {
    elementId: 'faq',
    name: 'FAQ',
    categoryId: 'text',
    phrases: [
      'add faq',
      'add a faq',
      'add collapsible',
      'add collapsible content',
      'collapsible content',
    ],
    keywords: ['faq', 'accordion', 'collapsible', 'collapsible content'],
  },
  {
    elementId: 'icons-with-text',
    name: 'Icons with text',
    categoryId: 'text',
    phrases: ['add icons with text', 'add icons'],
    keywords: ['icons with text', 'icons'],
  },
  {
    elementId: 'text-marquee',
    name: 'Marquee',
    categoryId: 'text',
    phrases: ['add marquee', 'add text marquee'],
    keywords: ['marquee', 'scrolling text'],
  },
  {
    elementId: 'multicolumn',
    name: 'Multicolumn',
    categoryId: 'text',
    phrases: ['add multicolumn', 'add multi column', 'add columns'],
    keywords: ['multicolumn', 'columns'],
  },
  {
    elementId: 'pull-quote',
    name: 'Pull quote',
    categoryId: 'text',
    phrases: ['add pull quote', 'add quote'],
    keywords: ['pull quote', 'quote'],
  },
  {
    elementId: 'rich-text',
    name: 'Rich text',
    categoryId: 'text',
    phrases: ['add rich text', 'add text section'],
    keywords: ['rich text'],
  },

  // Products
  {
    elementId: 'featured-collection-carousel',
    name: 'Featured collection: Carousel',
    categoryId: 'products',
    phrases: ['add featured collection carousel', 'add collection carousel'],
    keywords: ['featured collection carousel', 'collection carousel'],
  },
  {
    elementId: 'featured-collection-editorial',
    name: 'Featured collection: Editorial',
    categoryId: 'products',
    phrases: ['add featured collection editorial', 'add collection editorial'],
    keywords: ['featured collection editorial', 'collection editorial'],
  },
  {
    elementId: 'featured-collection-grid',
    name: 'Featured collection: Grid',
    categoryId: 'products',
    phrases: ['add featured collection', 'add featured collection grid', 'add collection grid', 'add product grid'],
    keywords: ['featured collection grid', 'featured collection', 'product grid'],
  },
  {
    elementId: 'featured-product',
    name: 'Featured product',
    categoryId: 'products',
    phrases: ['add featured product'],
    keywords: ['featured product'],
  },
  {
    elementId: 'product-highlight',
    name: 'Product highlight',
    categoryId: 'products',
    phrases: ['add product highlight'],
    keywords: ['product highlight'],
  },
  {
    elementId: 'product-hotspots',
    name: 'Product hotspots',
    categoryId: 'products',
    phrases: ['add product hotspots', 'add product hotspot', 'add hotspots'],
    keywords: ['product hotspot', 'product hotspots', 'hotspots'],
  },
  {
    elementId: 'recommended-products',
    name: 'Recommended products',
    categoryId: 'products',
    phrases: ['add recommended products'],
    keywords: ['recommended products', 'recommended'],
  },

  // Collections
  {
    elementId: 'collection-links-spotlight',
    name: 'Collection links: Spotlight',
    categoryId: 'collections',
    phrases: ['add collection links spotlight', 'add collection spotlight'],
    keywords: ['collection links spotlight', 'collection spotlight'],
  },
  {
    elementId: 'collection-links-text',
    name: 'Collection links: Text',
    categoryId: 'collections',
    phrases: ['add collection links text', 'add collection links'],
    keywords: ['collection links text', 'collection links'],
  },
  {
    elementId: 'collection-list-bento',
    name: 'Collection list: Bento',
    categoryId: 'collections',
    phrases: ['add collection list bento', 'add bento'],
    keywords: ['collection list bento', 'bento'],
  },
  {
    elementId: 'collection-list-carousel',
    name: 'Collection list: Carousel',
    categoryId: 'collections',
    phrases: ['add collection list carousel'],
    keywords: ['collection list carousel'],
  },
  {
    elementId: 'collection-list-editorial',
    name: 'Collection list: Editorial',
    categoryId: 'collections',
    phrases: ['add collection list editorial'],
    keywords: ['collection list editorial'],
  },
  {
    elementId: 'collection-list-grid',
    name: 'Collection list: Grid',
    categoryId: 'collections',
    phrases: ['add collection list grid', 'add collection list'],
    keywords: ['collection list grid', 'collection list'],
  },

  // Forms
  {
    elementId: 'contact-form',
    name: 'Contact form',
    categoryId: 'forms',
    phrases: ['add contact form', 'add contact'],
    keywords: ['contact form', 'contact'],
  },
  {
    elementId: 'email-signup',
    name: 'Email signup',
    categoryId: 'forms',
    phrases: [
      'add email signup',
      'add newsletter',
      'add signup',
      'newsletter',
      'email signup',
      'newsletter signup',
    ],
    keywords: ['email signup', 'newsletter', 'signup', 'subscribe', 'mailing list'],
  },
  {
    elementId: 'not-found-main',
    name: '404',
    categoryId: 'forms',
    phrases: ['add 404', 'add not found', 'add 404 page'],
    keywords: ['404', 'not found'],
  },

  // Storytelling
  {
    elementId: 'blog-posts-carousel',
    name: 'Blog posts: Carousel',
    categoryId: 'storytelling',
    phrases: ['add blog posts carousel', 'add blog carousel'],
    keywords: ['blog posts carousel', 'blog carousel'],
  },
  {
    elementId: 'blog-posts-editorial',
    name: 'Blog posts: Editorial',
    categoryId: 'storytelling',
    phrases: ['add blog posts editorial', 'add blog editorial'],
    keywords: ['blog posts editorial', 'blog editorial'],
  },
  {
    elementId: 'blog-posts-grid',
    name: 'Blog posts: Grid',
    categoryId: 'storytelling',
    phrases: ['add blog posts grid', 'add blog grid', 'add blog posts'],
    keywords: ['blog posts grid', 'blog posts', 'blog grid'],
  },
  {
    elementId: 'storytelling-carousel',
    name: 'Carousel',
    categoryId: 'storytelling',
    phrases: ['add storytelling carousel', 'add carousel'],
    keywords: ['storytelling carousel', 'carousel'],
  },
  {
    elementId: 'editorial',
    name: 'Editorial',
    categoryId: 'storytelling',
    phrases: ['add editorial'],
    keywords: ['editorial'],
  },
  {
    elementId: 'editorial-jumbo',
    name: 'Editorial: Jumbo text',
    categoryId: 'storytelling',
    phrases: ['add editorial jumbo', 'add jumbo text'],
    keywords: ['editorial jumbo', 'jumbo text'],
  },
  {
    elementId: 'image-compare',
    name: 'Image compare',
    categoryId: 'storytelling',
    phrases: ['add image compare', 'add before after'],
    keywords: ['image compare', 'before after'],
  },
  {
    elementId: 'image-with-text',
    name: 'Image with text',
    categoryId: 'storytelling',
    phrases: ['add image with text'],
    keywords: ['image with text'],
  },
  {
    elementId: 'logo',
    name: 'Logo',
    categoryId: 'storytelling',
    phrases: ['add logo'],
    keywords: ['logo'],
  },
  {
    elementId: 'video',
    name: 'Video',
    categoryId: 'storytelling',
    phrases: ['add video'],
    keywords: ['video'],
  },

  // Layout
  {
    elementId: 'custom-section',
    name: 'Custom section',
    categoryId: 'layout',
    phrases: ['add custom section'],
    keywords: ['custom section'],
  },
  {
    elementId: 'custom-liquid',
    name: 'Custom Liquid',
    categoryId: 'layout',
    phrases: ['add custom liquid', 'add liquid'],
    keywords: ['custom liquid', 'liquid'],
  },

  // Footer
  {
    elementId: 'footer',
    name: 'Footer',
    categoryId: 'footer',
    phrases: ['add footer', 'add a footer', 'insert footer'],
    keywords: ['footer'],
  },
  {
    elementId: 'policies-links',
    name: 'Policies and links',
    categoryId: 'footer',
    phrases: ['add policies and links', 'add policies', 'add policy links'],
    keywords: ['policies', 'policies and links', 'policy links'],
  },
];

const CATEGORY_ORDER = [
  'header',
  'banners',
  'text',
  'products',
  'collections',
  'forms',
  'storytelling',
  'layout',
  'footer',
] as const;

/** Ground-truth catalog for Codiix Q&A (aligned with covered-elements + registry). */
export const CODIX_ELEMENT_CATEGORIES: CodiixElementCategory[] = CATEGORY_ORDER.map((id) => {
  const meta = CATEGORY_META[id];
  return {
    id,
    label: meta.label,
    where: meta.where,
    items: CODIX_ELEMENTS.filter((e) => e.categoryId === id).map((e) => ({
      name: e.name,
      elementId: e.elementId,
      ready: e.ready !== false,
    })),
  };
});

export function formatCategoryAnswer(categoryId: string): string | null {
  const cat = CODIX_ELEMENT_CATEGORIES.find((c) => c.id === categoryId);
  if (!cat) return null;
  const ready = cat.items.filter((i) => i.ready);
  const pending = cat.items.filter((i) => !i.ready);
  const lines = [
    `**${cat.label}** — ${ready.length} ready${pending.length ? `, ${pending.length} coming soon` : ''}`,
    '',
    ...ready.map((i) => `• ${i.name}`),
  ];
  if (pending.length) {
    lines.push('', 'Coming soon:', ...pending.map((i) => `• ${i.name}`));
  }
  lines.push('', `**Where to find them:** ${cat.where}`);
  return lines.join('\n');
}

function autoPhrases(name: string, elementId: string): string[] {
  const lower = name.toLowerCase();
  const idWords = elementId.replace(/-/g, ' ');
  return [
    `add ${lower}`,
    `add a ${lower}`,
    `insert ${lower}`,
    `create ${lower}`,
    `add ${idWords}`,
    lower,
    idWords,
  ];
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Strip filler so “can you please add a hero section” → “hero”. */
function extractElementCore(query: string): string {
  return normalize(query)
    .replace(
      /\b(please|pls|can you|could you|would you|i want|i need|i'd like|id like|give me|gimme|add|insert|create|put|place|include|drop|make|use|with|a|an|the|my|me|to|for|in|on|of|section|element|block|component|into|onto|theme|page|store|homepage|site)\b/g,
      ' ',
    )
    .replace(/\s+/g, ' ')
    .trim();
}

function wantsToAdd(query: string): boolean {
  return /\b(add|insert|create|put|place|want|need|give me|gimme|include|drop|make me|set up|setup)\b/.test(
    query,
  );
}

function tokenOverlapScore(a: string, b: string): number {
  const at = new Set(a.split(' ').filter((t) => t.length > 1));
  const bt = b.split(' ').filter((t) => t.length > 1);
  if (!at.size || !bt.length) return 0;
  let hits = 0;
  for (const t of bt) {
    if (at.has(t)) hits += 1;
  }
  return hits;
}

/** Phrases that map to one-click add actions in agentic mode. */
export const CODIX_AGENTIC_COMMANDS = CODIX_ELEMENTS.filter((e) => e.ready !== false).map((e) => {
  const phrases = Array.from(
    new Set([...(e.phrases ?? []), ...autoPhrases(e.name, e.elementId)]),
  );
  const keywords = Array.from(
    new Set([
      ...(e.keywords ?? []),
      e.name.toLowerCase(),
      e.elementId.replace(/-/g, ' '),
      ...e.elementId.split('-'),
    ]),
  );

  return {
    id: `add-${e.elementId}`,
    phrases,
    keywords,
    elementId: e.elementId,
    name: e.name,
    categoryId: e.categoryId,
    label: `Add ${e.name}`,
  };
});

export function getCodiixElementCategoryId(elementId: string): string | undefined {
  return CODIX_ELEMENTS.find((e) => e.elementId === elementId)?.categoryId;
}

export function getCodiixCategoryLabel(categoryId: string): string {
  return CATEGORY_META[categoryId]?.label ?? categoryId;
}

export function relatedActionsForElement(
  elementId: string,
  limit = 4,
): { actions: CodiixAgenticAction[]; categoryLabel: string; categoryId: string | null } {
  const categoryId = getCodiixElementCategoryId(elementId);
  if (!categoryId) return { actions: [], categoryLabel: '', categoryId: null };
  const cat = CODIX_ELEMENT_CATEGORIES.find((c) => c.id === categoryId);
  if (!cat) return { actions: [], categoryLabel: '', categoryId: null };
  const actions = cat.items
    .filter((i) => i.ready && i.elementId && i.elementId !== elementId)
    .slice(0, limit)
    .map((i) => ({
      id: `add-${i.elementId}`,
      label: `Add ${i.name}`,
      elementId: i.elementId!,
    }));
  return {
    actions,
    categoryLabel: cat.label,
    categoryId,
  };
}

export function matchAgenticCommand(raw: string): CodiixAgenticMatch | null {
  const query = normalize(raw);
  if (!query) return null;

  const core = extractElementCore(query);
  const softAdd = wantsToAdd(query);
  const bareNameQuery = !softAdd && core.length >= 3 && core.split(' ').length <= 4;

  let best: (typeof CODIX_AGENTIC_COMMANDS)[number] | null = null;
  let bestScore = 0;

  for (const cmd of CODIX_AGENTIC_COMMANDS) {
    let score = 0;
    const name = normalize(cmd.name);
    const idWords = normalize(cmd.elementId.replace(/-/g, ' '));

    for (const phrase of cmd.phrases) {
      const p = normalize(phrase);
      if (!p) continue;
      if (query === p) score += 24;
      else if (query.includes(p)) score += 16;
    }

    if (core) {
      if (core === name || core === idWords) score += 28;
      else if (name.startsWith(core) || idWords.startsWith(core)) score += 18;
      else if (name.includes(core) || core.includes(name) || idWords.includes(core)) score += 14;
      score += tokenOverlapScore(core, name) * 6;
      score += tokenOverlapScore(core, idWords) * 5;
    }

    if (softAdd || bareNameQuery) {
      for (const kw of cmd.keywords) {
        const k = normalize(kw);
        if (!k) continue;
        const escaped = k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        if (k === core || k === query) {
          score += 22;
        } else if (k.includes(' ')) {
          if (query.includes(k) || core.includes(k)) score += 10;
        } else if (
          new RegExp(`\\b${escaped}\\b`).test(query) ||
          new RegExp(`\\b${escaped}\\b`).test(core)
        ) {
          score += 8;
        }
      }
    }

    if (score > 0) score += Math.min(4, name.split(' ').length);

    if (score > bestScore) {
      bestScore = score;
      best = cmd;
    }
  }

  const minScore = softAdd || bareNameQuery ? 8 : 12;
  if (!best || bestScore < minScore) return null;

  const related = relatedActionsForElement(best.elementId, 4);
  const categoryLabel = related.categoryLabel || getCodiixCategoryLabel(best.categoryId);

  let answer =
    `I can add **${best.name}** for you.\n\n` +
    `Here's how this element looks in the catalog preview.\n\n` +
    `Tap **${best.label}** below to insert it.`;

  if (related.actions.length > 0) {
    answer += `\n\nWant more from **${categoryLabel}** as well? I listed a few options under the preview.`;
  }

  return {
    answer,
    action: { id: best.id, label: best.label, elementId: best.elementId },
    relatedActions: related.actions,
    relatedCategoryLabel: categoryLabel,
    previewElementId: best.elementId,
  };
}

export function agenticSuggestionsForCategory(categoryId: string): CodiixAgenticAction[] {
  const cat = CODIX_ELEMENT_CATEGORIES.find((c) => c.id === categoryId);
  if (!cat) return [];
  return cat.items
    .filter((i) => i.ready && i.elementId)
    .slice(0, 6)
    .map((i) => ({
      id: `add-${i.elementId}`,
      label: `Add ${i.name}`,
      elementId: i.elementId!,
    }));
}

/** All registered element ids Codiix can add in agentic mode. */
export function listCodiixAgenticElementIds(): string[] {
  return CODIX_AGENTIC_COMMANDS.map((c) => c.elementId);
}
