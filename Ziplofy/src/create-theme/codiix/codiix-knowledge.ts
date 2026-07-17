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
      '• **Banners** — Hero + slideshow / showcase variants\n' +
      '• **Text** — FAQ, Icons with text, Marquee, Multicolumn, Pull quote, Rich text\n' +
      '• **Products** — Featured collection layouts, Featured product, highlights & hotspots\n' +
      '• **Collections** — Collection links & collection lists\n' +
      '• **Forms** — Contact form, Email signup\n' +
      '• **Storytelling** — Blog posts, Editorial, Image, Video, Logo\n' +
      '• **Layout** — Custom section, Custom Liquid\n' +
      '• **Footer** — Footer, Policies and links\n\n' +
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
      '5. **Save** your work, then **Apply theme** to show it to customers on your storefront.\n\n' +
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
      '• **Header** — Announcement bar, Header, Divider\n' +
      '• **Banners** — Hero, slideshows, split showcase, and more\n' +
      '• **Text** — FAQ, Icons with text, Marquee, Multicolumn, Pull quote, Rich text\n' +
      '• **Products** — Featured collections, Featured product, highlights & hotspots\n' +
      '• **Collections** — Collection links & lists\n' +
      '• **Forms** — Contact form, Email signup\n' +
      '• **Storytelling** — Blog posts, Editorial, Image, Video, Logo\n' +
      '• **Layout** — Custom section, Custom Liquid\n' +
      '• **Footer** — Footer, Policies and links\n\n' +
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
    categoryId: 'banners',
    answer: formatCategoryAnswer('banners')!,
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
    id: 'storytelling-elements',
    suggestion: 'What are storytelling elements?',
    keywords: ['storytelling', 'storytelling elements', 'blog posts', 'editorial'],
    phrases: [
      'what are storytelling elements',
      'storytelling elements',
      'how many storytelling',
    ],
    categoryId: 'storytelling',
    answer: formatCategoryAnswer('storytelling')!,
  },
  {
    id: 'layout-elements',
    suggestion: 'What are layout elements?',
    keywords: ['layout elements', 'custom section', 'custom liquid'],
    phrases: [
      'what are layout elements',
      'layout elements',
      'custom section',
    ],
    categoryId: 'layout',
    answer: formatCategoryAnswer('layout')!,
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
    categoryId: 'banners',
    answer:
      '**Hero** is your main banner section.\n\n' +
      '1. Select Hero in the sidebar under Template.\n' +
      '2. Edit heading, text, media, buttons, and layout.\n' +
      '3. Changes show instantly in the preview.\n\n' +
      '**Where:** Template → Add section → Banners → Hero',
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
      'switch page',
      'change page',
    ],
    phrases: [
      '404 page',
      'search page',
      'switch page',
      'change page',
      'page picker',
      'what pages',
      'which pages',
    ],
    answer:
      'Use the **page selector** in the top bar — or just tell me where to go.\n\n' +
      'Examples:\n' +
      '• “take me to home”\n' +
      '• “switch to cart”\n' +
      '• “open the product page”\n' +
      '• “go back”\n\n' +
      'I’ll switch the preview to that template for you.',
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
      'Turn it on when you want me to help build the page, not just explain it.',
  },
  {
    id: 'save-apply',
    suggestion: 'Save vs Apply theme',
    keywords: ['save vs apply', 'difference save apply'],
    phrases: [
      'save vs apply',
      'difference between save and apply',
      'what does save do',
      'what does apply do',
      'save or apply',
    ],
    answer:
      '• **Save** — saves the work/changes you’re doing on your theme.\n' +
      '• **Apply theme** — applies this theme to your storefront so your customers can see it.\n\n' +
      'If the theme is already applied to your store, applying again does nothing. If it isn’t applied yet, it goes live so customers see it.\n\n' +
      'Tip: tell me **“save my changes”** or **“apply theme”** and I’ll do it for you.',
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

  // ── Wider coverage (feels closer to a real assistant) ──
  {
    id: 'what-can-you-do',
    suggestion: 'What can you do?',
    keywords: ['capabilities', 'limitations', 'skills', 'features', 'help me'],
    phrases: [
      'what can you do',
      'what do you do',
      'how can you help',
      'what are you capable of',
      'what can codiix do',
      'your capabilities',
      'your limitations',
    ],
    answer:
      'Here’s what I can help with:\n\n' +
      '• Explain every section type (header, banners, products, forms, etc.)\n' +
      '• Tell you where to find settings in the editor\n' +
      '• Walk through Save vs Apply, inspector, mobile preview, theme settings\n' +
      '• With **Agentic mode**, offer one-tap buttons to add sections\n\n' +
      'What I don’t do:\n\n' +
      '• Invent features that aren’t in the editor\n' +
      '• Freely redesign your whole store from taste alone\n' +
      '• Browse the live internet or your private customer data\n\n' +
      'Ask something concrete — like “how do I change colors?” or “where do contact form submissions go?”',
  },
  {
    id: 'troubleshooting',
    suggestion: 'Something isn’t working',
    keywords: [
      'broken',
      'not working',
      'doesnt work',
      "doesn't work",
      'issue',
      'problem',
      'bug',
      'error',
      'stuck',
      'failed',
      'wrong',
    ],
    phrases: [
      'not working',
      'doesnt work',
      "doesn't work",
      'something wrong',
      'preview not updating',
      'changes not showing',
      'nothing happens',
      'i am stuck',
      "i'm stuck",
      'help me fix',
      'troubleshoot',
    ],
    answer:
      'Let’s debug it quickly:\n\n' +
      '1. Confirm you selected the right section in the left sidebar.\n' +
      '2. Check you’re on the right page in the top page picker (Home vs Product vs Search, etc.).\n' +
      '3. If preview looks stale, toggle mobile/desktop once, or reselect the section.\n' +
      '4. Make sure the section isn’t hidden (eye / visibility toggle).\n' +
      '5. Hit **Save** — some flows only feel “done” after saving.\n\n' +
      'Tell me what you expected vs what you see (e.g. “Multicolumn borders not showing”) and I’ll narrow it down.',
  },
  {
    id: 'delete-section',
    suggestion: 'How do I delete a section?',
    keywords: ['delete', 'remove', 'trash', 'discard'],
    phrases: [
      'delete section',
      'remove section',
      'how do i delete',
      'how do i remove',
      'delete this',
      'remove this section',
    ],
    answer:
      'To delete a section:\n\n' +
      '1. Select it in the left sidebar.\n' +
      '2. Use the delete / remove control on that row (or in its settings panel).\n' +
      '3. Confirm if prompted.\n\n' +
      'Tip: Header/Footer layout sections are shared across pages — deleting them affects more than just Home.',
  },
  {
    id: 'hide-section',
    suggestion: 'How do I hide a section?',
    keywords: ['hide', 'hidden', 'visibility', 'visible', 'show', 'unhide', 'eye'],
    phrases: [
      'hide section',
      'hide this section',
      'make invisible',
      'show section',
      'unhide section',
      'toggle visibility',
    ],
    answer:
      'You can hide a section without deleting it:\n\n' +
      '1. Find it in the sidebar tree.\n' +
      '2. Use the visibility / eye toggle on that row.\n' +
      '3. Preview updates — hidden sections stay in the theme but don’t show on the storefront.\n\n' +
      'Great for seasonal promos you want to bring back later.',
  },
  {
    id: 'sections-vs-blocks',
    suggestion: 'Sections vs blocks?',
    keywords: ['block', 'blocks', 'nested', 'difference'],
    phrases: [
      'section vs block',
      'sections vs blocks',
      'what is a block',
      'what are blocks',
      'difference between section and block',
      'add block',
    ],
    answer:
      'Think of it like this:\n\n' +
      '• **Section** — a full row of the page (Hero, FAQ, Featured collection, Footer…).\n' +
      '• **Block** — a smaller piece inside a section (FAQ row, button, menu item, column content…).\n\n' +
      'Workflow:\n\n' +
      '1. Add a section from **Add section**.\n' +
      '2. Open it in the tree.\n' +
      '3. Use **Add block** (when available) to build the inner content.\n\n' +
      'Not every section uses the same block types — Hero and FAQ have different block catalogs.',
  },
  {
    id: 'edit-text-content',
    suggestion: 'How do I edit text?',
    keywords: ['edit text', 'change text', 'heading', 'copy', 'wording', 'content'],
    phrases: [
      'edit text',
      'change text',
      'change heading',
      'edit heading',
      'change the copy',
      'update text',
      'how do i edit content',
    ],
    answer:
      'To edit text on the page:\n\n' +
      '1. Select the section (or block) in the sidebar — or use the **inspector** and click it in preview.\n' +
      '2. Find Heading / Text / Description fields in settings.\n' +
      '3. Type your copy — preview updates live.\n\n' +
      'For longer formatted copy, use **Rich text**. For a big statement line, try **Pull quote** or **Editorial: Jumbo text**.',
  },
  {
    id: 'images-media',
    suggestion: 'How do I add images?',
    keywords: ['image', 'images', 'photo', 'media', 'upload', 'picture', 'video'],
    phrases: [
      'add image',
      'upload image',
      'change image',
      'add photo',
      'upload photo',
      'add media',
      'change banner image',
      'add video',
    ],
    answer:
      'Images and media live in each section’s settings:\n\n' +
      '1. Select the section (Hero, Featured product, Image with text, Video, etc.).\n' +
      '2. Open the image / media / video field.\n' +
      '3. Upload or pick a file.\n\n' +
      'Tips:\n\n' +
      '• Use wide images for Hero / slideshows.\n' +
      '• Check **mobile preview** — tall crops can look different on phone.\n' +
      '• For product shots, prefer **Featured product** or **Product hotspots**.',
  },
  {
    id: 'logo-brand',
    suggestion: 'How do I change my logo?',
    keywords: ['logo', 'favicon', 'brand', 'store name'],
    phrases: [
      'change logo',
      'add logo',
      'upload logo',
      'change favicon',
      'brand logo',
      'store logo',
    ],
    answer:
      'Logo / brand usually lives in two places:\n\n' +
      '• **Header** section — logo, store name, and navigation chrome.\n' +
      '• **Theme settings** — global brand assets (logo / favicon style options, depending on pack).\n\n' +
      'Start with the Header in the sidebar. If you want a giant logo moment on the page, add the **Large logo** or **Logo** storytelling section.',
  },
  {
    id: 'navigation-menu',
    suggestion: 'How do I edit the menu?',
    keywords: ['menu', 'navigation', 'nav', 'links', 'navbar'],
    phrases: [
      'edit menu',
      'change menu',
      'navigation menu',
      'header menu',
      'add menu link',
      'edit navigation',
    ],
    answer:
      'Navigation is controlled mainly from the **Header** section:\n\n' +
      '1. Select **Header** in the sidebar.\n' +
      '2. Open menu / navigation settings (and related blocks if present).\n' +
      '3. Point links at pages, collections, or custom URLs from your store menus.\n\n' +
      'Footer policy / utility links are often under **Policies and links** in the Footer group.',
  },
  {
    id: 'colors-fonts',
    suggestion: 'How do I change colors & fonts?',
    keywords: ['color', 'colours', 'font', 'fonts', 'typography', 'palette', 'theme color'],
    phrases: [
      'change color',
      'change colours',
      'change fonts',
      'change typography',
      'theme colors',
      'global colors',
      'brand colors',
    ],
    answer:
      'For whole-theme look & feel:\n\n' +
      '1. Open the **Theme settings** tab in the sidebar.\n' +
      '2. Edit **Colors** / palette and **Typography** / fonts.\n' +
      '3. Buttons, product cards, and other global styles are nearby in the same area.\n\n' +
      'Section-level colors (e.g. one Multicolumn background) still live inside that section’s settings — global theme settings set the baseline.\n\n' +
      'Want help *choosing* colors, not just editing them? Ask “how do I choose a color palette?”',
  },
  {
    id: 'what-is-design',
    suggestion: 'What is design?',
    keywords: [
      'design',
      'designing',
      'visual design',
      'ui design',
      'store design',
      'aesthetic',
      'look',
      'style',
    ],
    phrases: [
      'what is design',
      'what is good design',
      'explain design',
      'design meaning',
      'how does design work',
      'what makes good design',
      'design basics',
    ],
    answer:
      'In a store theme, **design** is how you arrange visuals so shoppers instantly “get” the brand and know what to do next.\n\n' +
      'It usually comes down to 5 decisions:\n\n' +
      '1. **Hierarchy** — what should eyes see first? (usually Hero offer)\n' +
      '2. **Spacing** — give elements room so the page doesn’t feel noisy\n' +
      '3. **Contrast** — text readable, buttons obvious\n' +
      '4. **Consistency** — same fonts, corners, button style everywhere\n' +
      '5. **Focus** — one primary CTA per section beats five competing ones\n\n' +
      'Good theme design isn’t decoration for its own sake — it’s clarity that sells.\n\n' +
      'Next asks that help: “how should I think of a design?” or “how do I choose a color palette?”',
  },
  {
    id: 'design-thinking',
    suggestion: 'How should I think about design?',
    keywords: [
      'think design',
      'design thinking',
      'approach',
      'strategy',
      'plan design',
      'design process',
    ],
    phrases: [
      'how should i think of a design',
      'how should i think about design',
      'how to think about design',
      'design approach',
      'design process',
      'how do i plan my design',
      'where do i start with design',
    ],
    answer:
      'Think in this order — don’t start by picking random pretty colors:\n\n' +
      '1. **Who is shopping?** (age, vibe, price range)\n' +
      '2. **What is the one promise?** (one sentence Hero headline)\n' +
      '3. **What should they do next?** (Shop / Learn / Subscribe)\n' +
      '4. **Build the skeleton** — Header → Hero → Products → Proof → Signup → Footer\n' +
      '5. **Then style** — palette, fonts, spacing, imagery\n\n' +
      'A simple test: remove your logo mentally. If the page still feels like *your* brand (tone + colors + photography), the design is working.\n\n' +
      'In this editor: lock Header/Footer first, then Hero, then one Featured collection. Polish colors last in **Theme settings**.',
  },
  {
    id: 'choose-color-palette',
    suggestion: 'How do I choose a color palette?',
    keywords: [
      'palette',
      'colour palette',
      'color palette',
      'choose colors',
      'pick colors',
      'color scheme',
      'brand colors',
    ],
    phrases: [
      'how can i choose a color palette',
      'how do i choose a color palette',
      'choose a color palette',
      'pick a color palette',
      'what color palette',
      'help me choose colors',
      'suggest a color palette',
      'color scheme tips',
    ],
    answer:
      'Pick a palette like a system, not a moodboard dump:\n\n' +
      '1. **1 dominant color** — backgrounds / large surfaces (usually near-white, cream, or deep dark)\n' +
      '2. **1 brand accent** — buttons, links, key highlights\n' +
      '3. **1 strong text color** — near-black or near-white for readability\n' +
      '4. **1 soft neutral** — borders, dividers, cards\n' +
      '5. Optional **sale / badge** color — used rarely so it stays loud\n\n' +
      'Practical recipes:\n\n' +
      '• Clean retail — white + charcoal + one accent\n' +
      '• Warm lifestyle — soft cream + brown/black + terracotta or olive accent\n' +
      '• Bold streetwear — black base + white type + one neon/electric accent\n\n' +
      'Then apply it in **Theme settings → Colors**. Keep section-specific colors rare, or the page will feel inconsistent.',
  },
  {
    id: 'be-more-creative',
    suggestion: 'How can I be more creative?',
    keywords: [
      'creative',
      'creativity',
      'inspire',
      'inspiration',
      'ideas',
      'unique',
      'original',
      'stand out',
    ],
    phrases: [
      'how can i be more creative',
      'how to be more creative',
      'be more creative',
      'need inspiration',
      'give me creative ideas',
      'make my store unique',
      'make it stand out',
      'creative tips',
    ],
    answer:
      'Creativity in themes usually comes from **constraints + contrast**, not chaos.\n\n' +
      'Try these moves:\n\n' +
      '1. **One unexpected section** — Pull quote, Marquee, or Image compare after a normal product grid\n' +
      '2. **One bold type moment** — Editorial Jumbo or Large logo\n' +
      '3. **One storytelling beat** — Image with text or Editorial before you sell again\n' +
      '4. **Photography consistency** — same light / crop style across Hero + products\n' +
      '5. **Negative space** — fewer sections, more breathing room, stronger CTA\n\n' +
      'Creativity checklist:\n\n' +
      '• Can a stranger understand the offer in 3 seconds?\n' +
      '• Is there one memorable visual moment?\n' +
      '• Does every section earn its place?\n\n' +
      'If you want, tell me your niche (fashion, food, gadgets…) and I’ll suggest a homepage section stack.',
  },
  {
    id: 'brand-look-feel',
    suggestion: 'How do I make branding stronger?',
    keywords: [
      'brand',
      'branding',
      'on brand',
      'brand feel',
      'vibe',
      'mood',
      'look and feel',
      'identity',
      'strong brand',
      'stronger',
    ],
    phrases: [
      'make my branding strong',
      'make branding strong',
      'strong branding',
      'stronger branding',
      'how do i make my branding strong',
      'how can i make my branding strong',
      'build a strong brand',
      'strengthen my brand',
      'make it on brand',
      'look and feel',
      'brand vibe',
      'brand identity',
      'make it feel premium',
      'make it feel luxury',
      'make it feel minimal',
      'make my brand stand out',
    ],
    answer:
      'Strong branding in a theme is **repeatable recognition** — shoppers should feel it’s *you* in under 3 seconds.\n\n' +
      'Lock these 5 signals and reuse them everywhere:\n\n' +
      '1. **One clear promise** in the Hero (not five competing messages)\n' +
      '2. **Tight palette** — 1 base + 1 accent + strong text + 1 neutral (see “choose a color palette”)\n' +
      '3. **Two fonts max** — heading personality + readable body\n' +
      '4. **Consistent imagery** — same light, crop, and mood across Hero + products\n' +
      '5. **Same UI habits** — buttons, corners, spacing rhythm, Header/Footer calm and stable\n\n' +
      'In Ziplofy, do it in this order:\n\n' +
      '1. **Theme settings** → colors, typography, buttons\n' +
      '2. **Header** logo + navigation (your everyday brand face)\n' +
      '3. **Hero** as the personality moment\n' +
      '4. One memorable section (Pull quote / Large logo / Editorial)\n' +
      '5. Keep product grids clean so merchandise isn’t fighting the brand\n\n' +
      'Strength test: hide the store name — do colors, type, and photos still feel like the same brand? If yes, you’re strong.',
  },
  {
    id: 'typography-design',
    suggestion: 'How should I choose fonts?',
    keywords: ['choose fonts', 'font pairing', 'typeface', 'typography tips'],
    phrases: [
      'how do i choose fonts',
      'choose typography',
      'font pairing',
      'what fonts should i use',
      'typography tips',
    ],
    answer:
      'Simple typography system that works for most stores:\n\n' +
      '• **Heading font** — character / brand personality\n' +
      '• **Body font** — highly readable for descriptions & policies\n' +
      '• Avoid more than 2 families on the whole site\n\n' +
      'Pairing tips:\n\n' +
      '• Serif heading + clean sans body → editorial / premium\n' +
      '• Sans + sans (different weights) → modern retail\n' +
      '• Display heading only for Hero / Pull quote — not every label\n\n' +
      'Set them in **Theme settings → Typography**, then check mobile — fancy fonts can get hard to read on small screens.',
  },
  {
    id: 'visual-hierarchy',
    suggestion: 'What is visual hierarchy?',
    keywords: ['hierarchy', 'focal point', 'attention', 'first look'],
    phrases: [
      'what is visual hierarchy',
      'visual hierarchy',
      'what should stand out',
      'where should eyes go',
      'focal point',
    ],
    answer:
      '**Visual hierarchy** = controlling what people notice first, second, third.\n\n' +
      'On a homepage, aim for:\n\n' +
      '1. Hero offer / product emotion\n' +
      '2. Primary button\n' +
      '3. Supporting proof or products\n' +
      '4. Secondary details\n\n' +
      'Tools you already have:\n\n' +
      '• Bigger type / Pull quote / Jumbo text for emphasis\n' +
      '• Contrast buttons from **Theme settings**\n' +
      '• Spacing so important blocks aren’t cramped\n' +
      '• Fewer competing banners above the fold\n\n' +
      'If everything is bold, nothing is bold.',
  },
  {
    id: 'spacing-layout-polish',
    suggestion: 'How do I fix spacing?',
    keywords: ['spacing', 'padding', 'margin', 'gap', 'crowded', 'tight', 'whitespace'],
    phrases: [
      'fix spacing',
      'too much space',
      'too little space',
      'change padding',
      'change gap',
      'sections too close',
      'layout looks cramped',
    ],
    answer:
      'Spacing is usually controlled per section:\n\n' +
      '1. Select the section.\n' +
      '2. Look for Layout / Padding / Gap / Spacing fields.\n' +
      '3. For Multicolumn / Icons with text, Gap + Direction matter a lot.\n' +
      '4. Check **mobile preview** — vertical stacking can change perceived space.\n\n' +
      'If the whole page feels narrow/wide, also check **Theme settings → Page** width options.',
  },
  {
    id: 'homepage-best-practices',
    suggestion: 'Homepage structure tips',
    keywords: ['homepage', 'home page', 'structure', 'best practice', 'recommend', 'suggest'],
    phrases: [
      'homepage structure',
      'best homepage',
      'what should i put on homepage',
      'homepage tips',
      'recommend sections',
      'best practice layout',
    ],
    answer:
      'A strong Ziplofy homepage usually flows like this:\n\n' +
      '1. **Announcement bar** + **Header**\n' +
      '2. **Hero** (clear offer + CTA)\n' +
      '3. **Featured collection** (grid or carousel)\n' +
      '4. Trust / features (**Icons with text** or **Multicolumn**)\n' +
      '5. Story moment (**Editorial**, **Image with text**, or **Pull quote**)\n' +
      '6. **Email signup** or **Contact form**\n' +
      '7. **Footer** + **Policies and links**\n\n' +
      'Keep the first screen simple: one promise, one primary button. Turn on **Agentic mode** if you want me to help add those sections.',
  },
  {
    id: 'section-compare-hero-slideshow',
    suggestion: 'Hero vs slideshow?',
    keywords: ['compare', 'vs', 'versus', 'difference', 'which', 'better'],
    phrases: [
      'hero vs slideshow',
      'hero or slideshow',
      'difference between hero and slideshow',
      'which banner should i use',
      'layered slideshow vs hero',
    ],
    answer:
      'Quick pick guide:\n\n' +
      '• **Hero** — one strong message, one campaign, simplest CTA.\n' +
      '• **Layered / Full frame / Inset slideshow** — multiple slides, rotating stories.\n' +
      '• **Split showcase** — two-panel storytelling (image + message side by side).\n' +
      '• **Large logo** — brand-first landing moment.\n\n' +
      'If you’re unsure, start with **Hero**. Add a slideshow later when you have multiple campaigns.',
  },
  {
    id: 'section-compare-collection-layouts',
    suggestion: 'Carousel vs grid products?',
    keywords: ['carousel vs grid', 'which collection', 'product layout'],
    phrases: [
      'carousel vs grid',
      'grid or carousel',
      'featured collection which',
      'which featured collection',
      'editorial vs grid',
    ],
    answer:
      'Featured collection layouts:\n\n' +
      '• **Carousel** — browse many products in a compact strip.\n' +
      '• **Grid** — classic catalog feel, great for “shop the collection”.\n' +
      '• **Editorial** — more story / campaign styling around products.\n\n' +
      'Use **Featured product** when one hero SKU matters more than a whole collection.',
  },
  {
    id: 'contact-form-submissions',
    suggestion: 'Where do form submissions go?',
    keywords: ['submission', 'submissions', 'inbox', 'leads', 'messages'],
    phrases: [
      'where do submissions go',
      'contact form submissions',
      'where do contact messages go',
      'form inbox',
      'see contact messages',
    ],
    answer:
      '**Contact form** submissions are stored for your store (merchant inbox / submissions area in Ziplofy admin).\n\n' +
      '• Add the Contact form section on a page shoppers can reach.\n' +
      '• Test with your own email once.\n' +
      '• **Email signup** is separate — that’s for newsletter / marketing capture, not full contact messages.\n\n' +
      'If you don’t see submissions, confirm the section is saved + applied on the live theme.',
  },
  {
    id: 'email-signup-subscribers',
    suggestion: 'How does email signup work?',
    keywords: ['subscriber', 'subscribers', 'newsletter list', 'mailing'],
    phrases: [
      'email signup how',
      'newsletter how',
      'where do subscribers go',
      'email list',
      'mailing list',
    ],
    answer:
      '**Email signup** captures emails for your newsletter list.\n\n' +
      '1. Add **Email signup** (Template or Footer).\n' +
      '2. Customize heading, button, and success text.\n' +
      '3. Save / Apply so it appears on the live storefront.\n\n' +
      'Use Contact form when you need a message field; use Email signup when you only need the address.',
  },
  {
    id: 'product-page-editing',
    suggestion: 'How do I edit the product page?',
    keywords: ['product page', 'pdp', 'product template', 'product details'],
    phrases: [
      'edit product page',
      'product details page',
      'product template',
      'customize product page',
      'change product page',
    ],
    answer:
      'Use the page picker → open a **product** template.\n\n' +
      '• Header/Footer usually come from the shared layout.\n' +
      '• Template sections are where PDP-specific content lives.\n' +
      '• You can still add Featured product, recommendations-style sections, FAQ, etc.\n\n' +
      'Switch back to Home anytime from the same page picker.',
  },
  {
    id: 'collection-page-editing',
    suggestion: 'How do I edit collection pages?',
    keywords: ['collection page', 'collection template', 'plp'],
    phrases: [
      'edit collection page',
      'collection template',
      'customize collection page',
      'change collection page',
    ],
    answer:
      'Open a **collection** template from the page picker.\n\n' +
      '• Shared Header/Footer still apply by default.\n' +
      '• Add collection list / links / merchandising sections in Template as needed.\n' +
      '• Use Featured collection sections on Home to drive traffic into collections.',
  },
  {
    id: 'search-404-pages',
    suggestion: 'Search & 404 pages',
    keywords: ['search page', '404', 'not found', 'empty results'],
    phrases: [
      'edit search page',
      'edit 404',
      'customize 404',
      'not found page',
      'search template',
    ],
    answer:
      'Both are available from the page picker:\n\n' +
      '• **Search** — results / no-results experience.\n' +
      '• **404** — friendly dead-end page (often with links back to Home / collections).\n\n' +
      'Keep Header/Footer consistent so shoppers never feel “lost” outside your brand.',
  },
  {
    id: 'undo-mistakes',
    suggestion: 'I made a mistake — what now?',
    keywords: ['undo', 'redo', 'mistake', 'revert', 'oops', 'accident'],
    phrases: [
      'i made a mistake',
      'undo change',
      'how to undo',
      'revert changes',
      'oops',
      'accidentally deleted',
    ],
    answer:
      'If something went wrong:\n\n' +
      '1. Don’t Apply yet if you haven’t — Save only saves your theme work; Apply is what customers see.\n' +
      '2. Re-add a deleted section from **Add section** (or Agentic mode).\n' +
      '3. Restore visibility if you only hid something.\n' +
      '4. For big experiments, duplicate your mental checklist: note what you changed before applying live.\n\n' +
      'Tell me what happened (deleted Hero, wrong colors, etc.) and I’ll give the fastest recovery path.',
  },
  {
    id: 'preview-not-matching-live',
    suggestion: 'Preview ≠ live store?',
    keywords: ['live', 'published', 'doesnt match', "doesn't match", 'different'],
    phrases: [
      'preview not matching',
      'not showing on live',
      'live store different',
      'changes not live',
      'saved but not live',
      'apply not working',
    ],
    answer:
      'Preview and live can diverge for one main reason: **Save ≠ Apply**.\n\n' +
      '• **Save** — saves the work/changes you’re doing on your theme.\n' +
      '• **Apply theme** — applies this theme to your storefront so customers can see it.\n\n' +
      'Also check:\n\n' +
      '1. You applied the correct theme.\n' +
      '2. You’re viewing the same page type (Home vs Product).\n' +
      '3. Hard refresh the storefront tab.\n' +
      '4. Section isn’t hidden in the editor.',
  },
  {
    id: 'mobile-looks-wrong',
    suggestion: 'Mobile looks broken',
    keywords: ['mobile broken', 'phone', 'responsive issue', 'stacked'],
    phrases: [
      'mobile looks wrong',
      'mobile broken',
      'looks bad on mobile',
      'phone layout wrong',
      'responsive broken',
    ],
    answer:
      'Fix mobile issues like this:\n\n' +
      '1. Tap the phone icon to enter mobile preview.\n' +
      '2. Select the offending section.\n' +
      '3. Check Layout options (stacking, alignment, gap, “vertical on mobile” style controls).\n' +
      '4. Revisit image crops — desktop-wide images can feel huge on phone.\n\n' +
      'Multicolumn / Icons with text are the usual suspects when mobile spacing feels off.',
  },
  {
    id: 'buttons-ctas',
    suggestion: 'How do I edit buttons?',
    keywords: ['button', 'buttons', 'cta', 'call to action', 'shop now'],
    phrases: [
      'edit button',
      'change button',
      'add button',
      'change cta',
      'button text',
      'button link',
    ],
    answer:
      'Buttons are usually section or block settings:\n\n' +
      '1. Select Hero / Featured product / Rich text / etc.\n' +
      '2. Edit button label + link URL.\n' +
      '3. For global button look (shape/colors), use **Theme settings → Buttons**.\n\n' +
      'One primary CTA above the fold beats three competing buttons.',
  },
  {
    id: 'checkout-cart',
    suggestion: 'Cart & checkout?',
    keywords: ['cart', 'checkout', 'bag', 'payment'],
    phrases: [
      'edit cart',
      'edit checkout',
      'cart settings',
      'checkout settings',
      'change cart',
    ],
    answer:
      'Shopping cart chrome is largely under **Theme settings** (cart drawer / cart behaviors depending on pack).\n\n' +
      'Checkout itself has a separate checkout editor flow (open checkout from the page picker / checkout entry when available).\n\n' +
      'For storefront merchandising, keep using Template sections; for purchase flow, use checkout settings.',
  },
  {
    id: 'seo-basics',
    suggestion: 'SEO tips for my theme?',
    keywords: ['seo', 'meta', 'google', 'search ranking', 'title tag'],
    phrases: [
      'seo tips',
      'improve seo',
      'meta title',
      'google search',
      'search engine',
    ],
    answer:
      'Theme-side SEO basics that matter here:\n\n' +
      '• Clear Hero heading with your real offer\n' +
      '• Descriptive product/collection names in your catalog data\n' +
      '• Working Header navigation + Footer policies\n' +
      '• Fast, relevant images with sensible section order\n' +
      '• A helpful 404 and Search page so shoppers recover\n\n' +
      'I can help structure the theme; product titles/descriptions still come from your catalog content.',
  },
  {
    id: 'pro-tips',
    suggestion: 'Give me pro tips',
    keywords: ['tips', 'tricks', 'pro tip', 'advice', 'hack'],
    phrases: [
      'pro tips',
      'give me tips',
      'any tips',
      'theme tips',
      'editor tips',
      'best tips',
    ],
    answer:
      'Pro tips for this editor:\n\n' +
      '1. Build Header/Footer first — they frame every page.\n' +
      '2. Use inspector to click → jump to settings faster.\n' +
      '3. Check mobile before you Apply.\n' +
      '4. Hide seasonal sections instead of deleting them.\n' +
      '5. Save often; Apply only when the story looks right.\n' +
      '6. Turn on **Agentic mode** when you want me to drop in sections quickly.\n\n' +
      'Want a homepage recipe? Ask “homepage structure tips”.',
  },
  {
    id: 'thanks',
    suggestion: undefined,
    keywords: ['thanks', 'thank', 'thx', 'ty', 'grateful'],
    phrases: ['thank you', 'thanks a lot', 'thanks mate', 'cool thanks', 'perfect thanks'],
    answer:
      'You’re welcome — happy to help.\n\n' +
      'If you want to keep going, ask about a section, or turn on **Agentic mode** and say “add hero”.',
  },
  {
    id: 'greetings',
    suggestion: undefined,
    keywords: ['hello', 'hi', 'hey', 'yo', 'sup', 'morning', 'evening'],
    phrases: [
      'hello',
      'hi there',
      'hey there',
      'good morning',
      'good afternoon',
      'good evening',
      'yo',
    ],
    answer:
      'Hey — I’m **Codiix**, your theme helper.\n\n' +
      'Ask me things like:\n\n' +
      '• “What are product elements?”\n' +
      '• “How do I change colors?”\n' +
      '• “Homepage structure tips”\n' +
      '• Or turn on **Agentic** and say “add header”',
  },
  {
    id: 'goodbye',
    suggestion: undefined,
    keywords: ['bye', 'goodbye', 'cya', 'later', 'see you'],
    phrases: ['bye', 'goodbye', 'see you', 'catch you later', 'thats all'],
    answer:
      'See you later — I’ll be here in the theme editor whenever you need me.\n\n' +
      'Don’t forget to **Save** your work, and **Apply theme** when you want customers to see it on your storefront.',
  },
  {
    id: 'privacy-data',
    suggestion: undefined,
    keywords: ['privacy', 'data', 'store chats', 'listening', 'history'],
    phrases: [
      'do you store chats',
      'do you save my messages',
      'are you listening',
      'is this private',
      'privacy',
    ],
    answer:
      'This chat runs locally in your theme editor session as a guided helper.\n\n' +
      '• I’m not browsing your personal life or camera.\n' +
      '• I don’t need Agentic mode to answer questions.\n' +
      '• Agentic actions only run when **you** tap an Add button.\n\n' +
      'Your real store data (products, orders, form submissions) stays in Ziplofy — not in this chat playbook.',
  },
  {
    id: 'cant-do-that',
    suggestion: undefined,
    keywords: ['impossible', 'cant', "can't", 'unable', 'not possible', 'support'],
    phrases: [
      'can you code for me',
      'can you write liquid',
      'can you redesign everything',
      'can you talk to customers',
      'can you access my orders',
    ],
    answer:
      'Some things are outside my lane:\n\n' +
      '• I won’t freely invent custom Liquid apps or rewrite your whole brand strategy in one go.\n' +
      '• I can’t access private order data or message your customers from this chat.\n' +
      '• I stay inside what the theme creator supports.\n\n' +
      'If you tell me the outcome you want (e.g. “homepage with hero + product grid + signup”), I’ll map it to real sections — and Agentic mode can help add them.',
  },
  {
    id: 'fun-personality',
    suggestion: undefined,
    keywords: ['joke', 'funny', 'bored', 'sing', 'dance', 'love you'],
    phrases: [
      'tell me a joke',
      'are you funny',
      'i am bored',
      "i'm bored",
      'do you love me',
      'sing a song',
    ],
    answer:
      'Ha — I’ll keep the personality light.\n\n' +
      'Why did the Hero section break up with the Footer?\n' +
      'Because it needed space… and better alignment.\n\n' +
      'Alright, back to shipping: want homepage tips, or should we add a Hero?',
  },

  {
    id: 'codiix-identity',
    suggestion: 'Who are you?',
    keywords: [
      'yourself',
      'real',
      'human',
      'alive',
      'breathe',
      'conscious',
      'sentient',
      'robot',
      'codiix',
    ],
    phrases: [
      'who are you',
      'what are you',
      'are you real',
      'are you human',
      'are you alive',
      'are you an ai',
      'are you ai',
      'are you a bot',
      'are you a robot',
      'can you breathe',
      'can you see me',
      'can you hear me',
      'do you see me',
      'do you exist',
      'are you conscious',
      'tell me about yourself',
      'introduce yourself',
      'what is codiix',
      'who is codiix',
    ],
    answer:
      'I’m **Codiix** — your theme-creator helper inside Ziplofy.\n\n' +
      '• I help you understand sections, layout, forms, products, and settings.\n' +
      '• I stay focused on what this theme editor can actually do.\n' +
      '• I’m not a living person — I can’t breathe, see you, or feel the world.\n' +
      '• What I *can* do is guide you clearly, and (with **Agentic mode**) help you add sections like a Header or Hero.\n\n' +
      'Ask me anything about the theme creator — or say “who built you?” if you’re curious about my makers.',
  },
  {
    id: 'codiix-creator',
    suggestion: 'Who built you?',
    keywords: [
      'built',
      'build',
      'builder',
      'made',
      'maker',
      'created',
      'creator',
      'developed',
      'developer',
      'designed',
      'designer',
      'authored',
      'company',
      'team',
      'codiic',
      'ziplofy',
    ],
    phrases: [
      'who built you',
      'who made you',
      'who created you',
      'who developed you',
      'who designed you',
      'who is your creator',
      'who is your maker',
      'who owns you',
      'which company built you',
      'who wrote you',
      'who coded you',
      'who invented you',
      'are you made by',
      'built by whom',
      'made by whom',
    ],
    answer:
      'I was built by the **Codiic** team for **Codiic**.\n\n' +
      '• **Codiix** = the helper you chat with in the theme creator.\n' +
      '• **Codiic** = the product team that designed and shipped me.\n' +
      '• **Ziplofy** = the store platform where this theme editor lives.\n\n' +
      'My job is simple: help merchants build themes faster — with clear answers, and optional Agentic actions when you want me to add sections for you.',
  },
];

export const CODIX_FALLBACK =
  'I’m not sure on that one yet — but I can help with a lot:\n\n' +
  '• Elements & where to find them\n' +
  '• Editing text, images, menus, colors, buttons\n' +
  '• Troubleshooting preview / mobile / live mismatch\n' +
  '• Homepage structure tips\n' +
  '• Design thinking, color palettes, creativity, brand feel\n' +
  '• Save vs Apply, inspector, Agentic mode\n\n' +
  'Try “what is design?”, “how do I choose a color palette?”, or “how can I be more creative?”. ' +
  'Or turn on **Agentic mode** and say “add header”.';

export const CODIX_SUGGESTIONS = CODIX_INTENTS.filter((i) => i.suggestion).map((i) => ({
  id: i.id,
  label: i.suggestion!,
}));
