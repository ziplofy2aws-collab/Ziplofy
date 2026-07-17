import { formatCategoryAnswer } from './codiix-elements-catalog';

export type CodiixIntent = {
  id: string;
  suggestion?: string;
  keywords: string[];
  phrases?: string[];
  answer: string;
  /** When set, agentic mode can offer add buttons for this category */
  categoryId?: string;
};

/** Curated theme-creator help — grounded in what Ziplofy can actually do. */
export const CODIX_INTENTS: CodiixIntent[] = [
  {
    id: 'whats-new',
    suggestion: "What's new?",
    keywords: ['new', 'whats new', "what's new", 'update', 'features', 'latest'],
    phrases: ['whats new', "what's new", 'what is new'],
    answer:
      'Here’s what’s ready in the theme creator right now:\n\n' +
      '• **Header** — Announcement bar, Header, Divider\n' +
      '• **Banner** — Hero\n' +
      '• **Text** — FAQ, Icons with text, Marquee, Multicolumn, Pull quote, Rich text\n' +
      '• **Products** — Featured collection (carousel / editorial / grid), Featured product, Product highlight, Product hotspot\n' +
      '• **Collections** — Collection links spotlight & text\n' +
      '• **Forms** — Contact form, Email signup\n' +
      '• **Footer** — Footer, Email signup, Policies / links\n\n' +
      'Ask “what are product elements?” or turn on **Agentic mode** and say “add header”.',
  },
  {
    id: 'getting-started',
    suggestion: 'How do I get started?',
    keywords: ['start', 'begin', 'help', 'how', 'guide', 'tutorial', 'basics', 'intro'],
    phrases: ['get started', 'getting started', 'how do i start', 'how does this work'],
    answer:
      'Quick start:\n\n' +
      '1. Use the left sidebar to browse **Header**, **Template**, and **Footer**.\n' +
      '2. Click a section to open its settings.\n' +
      '3. Watch the live preview update as you edit.\n' +
      '4. Use the page picker in the top bar to switch templates.\n' +
      '5. Hit **Save**, then **Apply theme** when you want it live.\n\n' +
      'Tip: use the inspector (dashed square) to click preview elements, or turn on **Agentic mode** in Codiix to add sections with one tap.',
  },
  {
    id: 'elements-overview',
    suggestion: 'What elements exist?',
    keywords: ['elements', 'sections', 'all elements', 'list', 'catalog', 'how many'],
    phrases: [
      'what elements',
      'all elements',
      'list of elements',
      'how many elements',
      'what sections',
    ],
    answer:
      'Theme creator elements by group:\n\n' +
      '• **Header** — 3 (Announcement bar, Header, Divider)\n' +
      '• **Banner** — 1 (Hero)\n' +
      '• **Text** — 6 (FAQ, Icons with text, Marquee, Multicolumn, Pull quote, Rich text)\n' +
      '• **Products** — 6 ready (+ Recommended products coming soon)\n' +
      '• **Collections** — 2 (spotlight & text links)\n' +
      '• **Forms** — 2 (Contact form, Email signup)\n' +
      '• **Footer** — Footer, Email signup, Policies / links\n\n' +
      'Ask about a group by name — e.g. “what are product elements?”',
  },
  {
    id: 'header-elements',
    suggestion: 'What are header elements?',
    keywords: ['header elements', 'header element', 'header sections'],
    phrases: [
      'what are header elements',
      'header elements',
      'how many header',
      'names of header',
    ],
    categoryId: 'header',
    answer: formatCategoryAnswer('header')!,
  },
  {
    id: 'banner-elements',
    suggestion: 'What are banner elements?',
    keywords: ['banner elements', 'banner element', 'banners'],
    phrases: [
      'what are banner elements',
      'banner elements',
      'how many banner',
      'names of banner',
    ],
    categoryId: 'banner',
    answer: formatCategoryAnswer('banner')!,
  },
  {
    id: 'text-elements',
    suggestion: 'What are text elements?',
    keywords: ['text elements', 'text element', 'text sections'],
    phrases: [
      'what are text elements',
      'text elements',
      'how many text',
      'names of text',
    ],
    categoryId: 'text',
    answer: formatCategoryAnswer('text')!,
  },
  {
    id: 'product-elements',
    suggestion: 'What are product elements?',
    keywords: [
      'product elements',
      'product element',
      'products elements',
      'product sections',
    ],
    phrases: [
      'what are product elements',
      'product elements',
      'how many product',
      'names of product',
      'what products',
    ],
    categoryId: 'products',
    answer: formatCategoryAnswer('products')!,
  },
  {
    id: 'collection-elements',
    suggestion: 'What are collection elements?',
    keywords: ['collection elements', 'collection element'],
    phrases: [
      'what are collection elements',
      'collection elements',
      'how many collection',
    ],
    categoryId: 'collections',
    answer: formatCategoryAnswer('collections')!,
  },
  {
    id: 'form-elements',
    suggestion: 'What are the forms?',
    keywords: ['forms', 'form names', 'form elements'],
    phrases: [
      'what are forms',
      'names of forms',
      'what forms',
      'how many forms',
      'form elements',
    ],
    categoryId: 'forms',
    answer: formatCategoryAnswer('forms')!,
  },
  {
    id: 'footer-elements',
    suggestion: 'What are footer elements?',
    keywords: ['footer elements', 'footer element', 'footer sections'],
    phrases: [
      'what are footer elements',
      'footer elements',
      'how many footer',
      'names of footer',
    ],
    categoryId: 'footer',
    answer: formatCategoryAnswer('footer')!,
  },
  {
    id: 'where-to-find',
    suggestion: 'Where do I find sections?',
    keywords: ['where', 'find', 'locate', 'catalog'],
    phrases: ['where can i find', 'where do i find', 'where are'],
    answer:
      'Every section lives in the left sidebar:\n\n' +
      '1. Open **Header**, **Template**, or **Footer**.\n' +
      '2. Click **Add section**.\n' +
      '3. Pick from the catalog (grouped by type).\n\n' +
      'Or turn on **Agentic mode** in Codiix and say “add hero” / “add header” — I’ll offer a one-tap button.',
  },
  {
    id: 'add-section',
    suggestion: 'How do I add a section?',
    keywords: ['add', 'section', 'insert', 'new section', 'create section', 'catalog'],
    phrases: ['add a section', 'add section', 'new section', 'insert section'],
    answer:
      'To add a section manually:\n\n' +
      '1. In the sidebar, find **Add section** under Header, Template, or Footer.\n' +
      '2. Pick from the catalog.\n' +
      '3. Select it in the tree to edit settings.\n\n' +
      'With **Agentic mode** on, you can also ask me to add Header, Footer, Hero, FAQ, and more — I’ll show an action button.',
  },
  {
    id: 'header-footer-layout',
    suggestion: 'Header & footer on every page?',
    keywords: [
      'header',
      'footer',
      'layout',
      'every page',
      'all pages',
      'announcement',
      'shared',
      'global',
    ],
    phrases: [
      'every page',
      'all pages',
      'header on every',
      'footer on every',
      'shared header',
      'layout header',
    ],
    answer:
      'Yes — Header and Footer act like a shared layout.\n\n' +
      'By default, other pages (product, collection, search, 404, etc.) use the homepage header and footer. ' +
      'Edit them once on the home template and they carry across.\n\n' +
      'Announcement bar and header sit in the **Header** group; footer sections sit in **Footer**.',
  },
  {
    id: 'hero',
    suggestion: 'How do I edit the Hero?',
    keywords: ['hero', 'banner', 'slideshow', 'slide'],
    phrases: ['edit hero', 'hero banner'],
    categoryId: 'banner',
    answer:
      '**Hero** is your main banner section.\n\n' +
      '1. Select Hero in the sidebar under Template.\n' +
      '2. Edit heading, text, media, buttons, and layout.\n' +
      '3. Changes show instantly in the preview.\n\n' +
      '**Where:** Template → Add section → Hero',
  },
  {
    id: 'multicolumn',
    suggestion: 'Multicolumn tips',
    keywords: [
      'multicolumn',
      'multi column',
      'columns',
      'column',
      'border',
      'borders',
      'gap',
      'direction',
      'alignment',
      'position',
    ],
    phrases: [
      'multicolumn',
      'multi-column',
      'column borders',
      'layout gap',
      'column direction',
    ],
    answer:
      '**Multicolumn** is great for feature grids and service rows.\n\n' +
      '• Open Multicolumn → Layout for Direction, Gap, Alignment, and Position.\n' +
      '• Use Borders for solid outlines (style + width + color).\n' +
      '• Edit each column from the column nodes in the tree.\n\n' +
      '**Where:** Template → Add section → Text → Multicolumn',
  },
  {
    id: 'faq',
    suggestion: 'How does FAQ work?',
    keywords: ['faq', 'accordion', 'questions', 'answers'],
    phrases: ['faq section', 'frequently asked'],
    answer:
      '**FAQ** is an accordion for Q&A content.\n\n' +
      '1. Add or select the FAQ section.\n' +
      '2. Add question rows in the sidebar.\n' +
      '3. Edit each question and answer in settings.\n\n' +
      '**Where:** Template → Add section → Text → FAQ',
  },
  {
    id: 'rich-text-pull-quote-marquee',
    suggestion: 'Text sections overview',
    keywords: ['rich text', 'pull quote', 'marquee', 'quote', 'scrolling text'],
    phrases: ['rich text', 'pull quote', 'marquee'],
    categoryId: 'text',
    answer: formatCategoryAnswer('text')!,
  },
  {
    id: 'icons-with-text',
    suggestion: 'Icons with text',
    keywords: ['icons with text', 'icon', 'icons', 'features'],
    phrases: ['icons with text', 'icon row'],
    answer:
      '**Icons with text** is for feature lists (icon + heading + description).\n\n' +
      'Select the section, then edit each item. Layout and Borders work like Multicolumn.\n\n' +
      '**Where:** Template → Add section → Text → Icons with text',
  },
  {
    id: 'featured-collections',
    suggestion: 'Featured collections',
    keywords: [
      'featured collection',
      'carousel',
      'editorial',
      'grid',
      'products',
      'collection',
      'product grid',
    ],
    phrases: [
      'featured collection',
      'collection carousel',
      'collection grid',
      'collection editorial',
    ],
    categoryId: 'products',
    answer: formatCategoryAnswer('products')!,
  },
  {
    id: 'collection-links',
    suggestion: 'Collection links',
    keywords: ['collection links', 'spotlight', 'collection link'],
    phrases: ['collection links', 'collection spotlight'],
    categoryId: 'collections',
    answer: formatCategoryAnswer('collections')!,
  },
  {
    id: 'forms',
    suggestion: 'Contact & email signup',
    keywords: ['form', 'contact', 'email', 'signup', 'newsletter', 'subscribe'],
    phrases: ['contact form', 'email signup', 'newsletter'],
    categoryId: 'forms',
    answer: formatCategoryAnswer('forms')!,
  },
  {
    id: 'pages-templates',
    suggestion: 'Pages & templates',
    keywords: [
      'page',
      'pages',
      'template',
      '404',
      'search',
      'product page',
      'collection page',
      'blog',
    ],
    phrases: ['404 page', 'search page', 'switch page', 'page picker'],
    answer:
      'Use the page picker in the top bar to switch templates.\n\n' +
      'Ready today: Home, product/collection templates, Search, and 404.\n' +
      'More page types (password, blog, article, etc.) are on the roadmap.\n\n' +
      'Remember: header/footer from home are shared by default.',
  },
  {
    id: 'theme-settings',
    suggestion: 'Theme settings (colors & fonts)',
    keywords: [
      'theme settings',
      'colors',
      'fonts',
      'typography',
      'palette',
      'buttons',
      'global',
      'brand',
    ],
    phrases: ['theme settings', 'change colors', 'change fonts', 'typography'],
    answer:
      'Open the **Theme settings** tab in the sidebar.\n\n' +
      'Tune global colors, typography, buttons, product cards, cart, search, and more. ' +
      'These apply across the whole theme — not just one section.',
  },
  {
    id: 'preview-devices',
    suggestion: 'Desktop vs mobile preview',
    keywords: ['mobile', 'desktop', 'preview', 'responsive', 'device'],
    phrases: ['mobile preview', 'desktop preview', 'switch device'],
    answer:
      'Use the phone icon in the top-right header to toggle mobile preview.\n\n' +
      'The canvas animates to a centered phone width — click again to return to desktop.',
  },
  {
    id: 'inspector',
    suggestion: 'What is the inspector?',
    keywords: ['inspector', 'click', 'select', 'dashed', 'pointer'],
    phrases: ['turn on inspector', 'what is inspector', 'click to edit'],
    answer:
      'The inspector (dashed square + cursor icon) lets you click elements in the live preview to select them in the sidebar.\n\n' +
      'Turn it on when you want to hunt settings visually; turn it off if clicks should pass through to the storefront preview.',
  },
  {
    id: 'agentic-mode',
    suggestion: 'What is Agentic mode?',
    keywords: ['agentic', 'agent', 'auto', 'do it for me', 'action'],
    phrases: ['agentic mode', 'what is agentic', 'agent mode'],
    answer:
      '**Agentic mode** lets Codiix offer one-tap actions — like **Add Header**, **Add Footer**, or **Add Hero**.\n\n' +
      '1. Toggle **Agentic** on in the Codiix panel header.\n' +
      '2. Ask something like “add a header” or “add contact form”.\n' +
      '3. Tap the action button — I’ll insert the section into the right group for you.\n\n' +
      'It feels like AI doing the work; under the hood it’s a guided action button wired to the real editor.',
  },
  {
    id: 'save-apply',
    suggestion: 'Save vs Apply theme',
    keywords: ['save', 'apply', 'publish', 'live', 'deploy'],
    phrases: ['apply theme', 'save theme', 'make it live', 'publish'],
    answer:
      '• **Save** — stores your theme editor work.\n' +
      '• **Apply theme** (⋮ menu) — pushes this theme to the live storefront.\n\n' +
      'Save often while editing. Apply when you’re ready for customers to see the changes.',
  },
  {
    id: 'reorder',
    suggestion: 'How do I reorder sections?',
    keywords: ['reorder', 'drag', 'move', 'order', 'arrange'],
    phrases: ['reorder sections', 'move section', 'drag section'],
    answer:
      'Drag sections up or down in the left sidebar tree.\n\n' +
      'Header / Template / Footer groups stay separate — you’re reordering within each group. ' +
      'The preview updates to match the new order.',
  },
  {
    id: 'codiix-about',
    suggestion: 'Who is Codiix?',
    keywords: ['codiix', 'who are you', 'are you ai', 'artificial', 'bot', 'assistant'],
    phrases: ['who are you', 'what are you', 'are you ai'],
    answer:
      'I’m **Codiix** — your theme creator helper by Codiic.\n\n' +
      'I answer from a curated playbook of what this editor can actually do. ' +
      'Ask about sections, layout, forms, products — or turn on **Agentic mode** and I’ll help add them.',
  },
];

export const CODIX_FALLBACK =
  'I’m not sure on that one yet — but I can help with theme sections, layout, products, forms, pages, and settings.\n\n' +
  'Try asking “what are product elements?”, “what are the forms?”, or “where can I find banner elements?”. ' +
  'Or turn on **Agentic mode** and say “add header”.';

export const CODIX_SUGGESTIONS = CODIX_INTENTS.filter((i) => i.suggestion).map((i) => ({
  id: i.id,
  label: i.suggestion!,
}));
