export type CodiixElementCategory = {
  id: string;
  label: string;
  where: string;
  items: { name: string; elementId?: string; ready: boolean }[];
};

/** Ground-truth catalog for Codiix Q&A (aligned with covered-elements + registry). */
export const CODIX_ELEMENT_CATEGORIES: CodiixElementCategory[] = [
  {
    id: 'header',
    label: 'Header elements',
    where: 'Left sidebar → Header group → Add section',
    items: [
      { name: 'Announcement bar', elementId: 'announcement-bar', ready: true },
      { name: 'Header', elementId: 'header', ready: true },
      { name: 'Divider', elementId: 'divider', ready: true },
    ],
  },
  {
    id: 'banner',
    label: 'Banner elements',
    where: 'Left sidebar → Template → Add section (look for Hero / banner styles)',
    items: [{ name: 'Hero', elementId: 'hero', ready: true }],
  },
  {
    id: 'text',
    label: 'Text elements',
    where: 'Left sidebar → Template → Add section → Text category',
    items: [
      { name: 'FAQ', elementId: 'faq', ready: true },
      { name: 'Icons with text', elementId: 'icons-with-text', ready: true },
      { name: 'Marquee', elementId: 'text-marquee', ready: true },
      { name: 'Multicolumn', elementId: 'multicolumn', ready: true },
      { name: 'Pull quote', elementId: 'pull-quote', ready: true },
      { name: 'Rich text', elementId: 'rich-text', ready: true },
    ],
  },
  {
    id: 'products',
    label: 'Product elements',
    where: 'Left sidebar → Template → Add section → Products category',
    items: [
      { name: 'Featured collection carousel', elementId: 'featured-collection-carousel', ready: true },
      { name: 'Featured collection editorial', elementId: 'featured-collection-editorial', ready: true },
      { name: 'Featured collection grid', elementId: 'featured-collection-grid', ready: true },
      { name: 'Featured product', elementId: 'featured-product', ready: true },
      { name: 'Product highlight', elementId: 'product-highlight', ready: true },
      { name: 'Product hotspot', elementId: 'product-hotspots', ready: true },
      { name: 'Recommended products', elementId: 'recommended-products', ready: false },
    ],
  },
  {
    id: 'collections',
    label: 'Collection elements',
    where: 'Left sidebar → Template → Add section → Collections category',
    items: [
      { name: 'Collection links spotlight', elementId: 'collection-links-spotlight', ready: true },
      { name: 'Collection links text', elementId: 'collection-links-text', ready: true },
    ],
  },
  {
    id: 'forms',
    label: 'Forms',
    where: 'Left sidebar → Template or Footer → Add section → Forms',
    items: [
      { name: 'Contact form', elementId: 'contact-form', ready: true },
      { name: 'Email signup', elementId: 'email-signup', ready: true },
    ],
  },
  {
    id: 'footer',
    label: 'Footer elements',
    where: 'Left sidebar → Footer group → Add section',
    items: [
      { name: 'Footer', elementId: 'footer', ready: true },
      { name: 'Email signup', elementId: 'email-signup', ready: true },
      { name: 'Policies / links', elementId: 'policies-links', ready: true },
    ],
  },
];

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

export type CodiixAgenticAction = {
  id: string;
  label: string;
  elementId: string;
};

/** Phrases that map to one-click add actions in agentic mode. */
export const CODIX_AGENTIC_COMMANDS: Array<{
  id: string;
  phrases: string[];
  keywords: string[];
  elementId: string;
  label: string;
  answer: string;
}> = [
  {
    id: 'add-header',
    phrases: ['add header', 'add a header', 'insert header', 'create header'],
    keywords: ['header'],
    elementId: 'header',
    label: 'Add Header',
    answer:
      'I can add a **Header** to your layout for you.\n\n' +
      'Tap the button below and I’ll place it in the Header group.',
  },
  {
    id: 'add-announcement',
    phrases: ['add announcement', 'add announcement bar', 'add a announcement bar'],
    keywords: ['announcement'],
    elementId: 'announcement-bar',
    label: 'Add Announcement bar',
    answer:
      'I can add an **Announcement bar** at the top of your store.\n\n' +
      'Tap below to drop it into the Header group.',
  },
  {
    id: 'add-footer',
    phrases: ['add footer', 'add a footer', 'insert footer', 'create footer'],
    keywords: ['footer'],
    elementId: 'footer',
    label: 'Add Footer',
    answer:
      'I can add a **Footer** to your layout.\n\n' +
      'Tap the button below and I’ll place it in the Footer group.',
  },
  {
    id: 'add-hero',
    phrases: ['add hero', 'add a hero', 'add banner', 'add a banner'],
    keywords: ['hero', 'banner'],
    elementId: 'hero',
    label: 'Add Hero',
    answer:
      'I can add a **Hero** banner to your template.\n\n' +
      'Tap below to insert it into the Template group.',
  },
  {
    id: 'add-multicolumn',
    phrases: ['add multicolumn', 'add multi column', 'add columns'],
    keywords: ['multicolumn'],
    elementId: 'multicolumn',
    label: 'Add Multicolumn',
    answer: 'Ready to add **Multicolumn**. Tap below and I’ll insert it into the template.',
  },
  {
    id: 'add-faq',
    phrases: ['add faq', 'add a faq'],
    keywords: ['faq'],
    elementId: 'faq',
    label: 'Add FAQ',
    answer: 'I can add an **FAQ** section for you. Tap below to insert it.',
  },
  {
    id: 'add-rich-text',
    phrases: ['add rich text', 'add text section'],
    keywords: ['rich text'],
    elementId: 'rich-text',
    label: 'Add Rich text',
    answer: 'I can add a **Rich text** section. Tap below to insert it.',
  },
  {
    id: 'add-pull-quote',
    phrases: ['add pull quote', 'add quote'],
    keywords: ['pull quote'],
    elementId: 'pull-quote',
    label: 'Add Pull quote',
    answer: 'I can add a **Pull quote**. Tap below to insert it.',
  },
  {
    id: 'add-marquee',
    phrases: ['add marquee'],
    keywords: ['marquee'],
    elementId: 'text-marquee',
    label: 'Add Marquee',
    answer: 'I can add a **Marquee** text strip. Tap below to insert it.',
  },
  {
    id: 'add-icons-with-text',
    phrases: ['add icons with text', 'add icons'],
    keywords: ['icons with text'],
    elementId: 'icons-with-text',
    label: 'Add Icons with text',
    answer: 'I can add **Icons with text**. Tap below to insert it.',
  },
  {
    id: 'add-contact-form',
    phrases: ['add contact form', 'add contact'],
    keywords: ['contact form'],
    elementId: 'contact-form',
    label: 'Add Contact form',
    answer: 'I can add a **Contact form**. Tap below to insert it.',
  },
  {
    id: 'add-email-signup',
    phrases: ['add email signup', 'add newsletter', 'add signup'],
    keywords: ['email signup', 'newsletter'],
    elementId: 'email-signup',
    label: 'Add Email signup',
    answer: 'I can add an **Email signup** form. Tap below to insert it.',
  },
  {
    id: 'add-featured-product',
    phrases: ['add featured product'],
    keywords: ['featured product'],
    elementId: 'featured-product',
    label: 'Add Featured product',
    answer: 'I can add a **Featured product** section. Tap below to insert it.',
  },
  {
    id: 'add-featured-collection-grid',
    phrases: ['add featured collection', 'add collection grid', 'add product grid'],
    keywords: ['featured collection grid'],
    elementId: 'featured-collection-grid',
    label: 'Add Featured collection grid',
    answer: 'I can add a **Featured collection grid**. Tap below to insert it.',
  },
  {
    id: 'add-featured-collection-carousel',
    phrases: ['add collection carousel', 'add featured carousel'],
    keywords: ['featured collection carousel'],
    elementId: 'featured-collection-carousel',
    label: 'Add Featured collection carousel',
    answer: 'I can add a **Featured collection carousel**. Tap below to insert it.',
  },
  {
    id: 'add-divider',
    phrases: ['add divider'],
    keywords: ['divider'],
    elementId: 'divider',
    label: 'Add Divider',
    answer: 'I can add a **Divider**. Tap below to insert it into the Header group.',
  },
];

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function matchAgenticCommand(raw: string): {
  answer: string;
  action: CodiixAgenticAction;
} | null {
  const query = normalize(raw);
  if (!query) return null;

  let best: (typeof CODIX_AGENTIC_COMMANDS)[number] | null = null;
  let bestScore = 0;

  for (const cmd of CODIX_AGENTIC_COMMANDS) {
    let score = 0;
    for (const phrase of cmd.phrases) {
      const p = normalize(phrase);
      if (query === p) score += 20;
      else if (query.includes(p)) score += 14;
    }
    // Prefer explicit "add/insert/create" + keyword
    const wantsAdd = /\b(add|insert|create|put|place)\b/.test(query);
    if (wantsAdd) {
      for (const kw of cmd.keywords) {
        const k = normalize(kw);
        if (query.includes(k)) score += 6;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      best = cmd;
    }
  }

  if (!best || bestScore < 10) return null;
  return {
    answer: best.answer,
    action: { id: best.id, label: best.label, elementId: best.elementId },
  };
}

export function agenticSuggestionsForCategory(categoryId: string): CodiixAgenticAction[] {
  const cat = CODIX_ELEMENT_CATEGORIES.find((c) => c.id === categoryId);
  if (!cat) return [];
  return cat.items
    .filter((i) => i.ready && i.elementId)
    .slice(0, 4)
    .map((i) => ({
      id: `add-${i.elementId}`,
      label: `Add ${i.name}`,
      elementId: i.elementId!,
    }));
}
