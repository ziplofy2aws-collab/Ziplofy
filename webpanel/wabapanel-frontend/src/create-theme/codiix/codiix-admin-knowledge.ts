import type { CodiixIntent } from './codiix-knowledge';

/** Curated store-admin help — grounded in Codiic ecommerce navigation. */
export const CODIX_ADMIN_INTENTS: CodiixIntent[] = [
  {
    id: 'admin-overview',
    suggestion: 'What can I do here?',
    keywords: ['overview', 'admin', 'dashboard', 'help', 'menu', 'sidebar', 'where'],
    phrases: [
      'what can i do',
      'what can i do here',
      'how does admin work',
      'where do i start',
      'show me around',
    ],
    answer:
      'You’re in the **Codiic store admin** — manage your shop from the left sidebar:\n\n' +
      '• **Home** — store overview\n' +
      '• **Orders** — orders, drafts, abandoned carts\n' +
      '• **Products** — catalog, collections, inventory, purchase orders, transfers\n' +
      '• **Customers** — customer list & segments\n' +
      '• **Marketing / Discounts** — campaigns and promo codes\n' +
      '• **Content** — files, menus, blogs, form submissions\n' +
      '• **Online Store** — themes, pages, preferences\n' +
      '• **Analytics / Markets / Settings** — reports, catalogs, store setup\n\n' +
      'Say **“take me to products”** (or orders, customers, themes…) and I’ll open that page.',
  },
  {
    id: 'admin-orders',
    suggestion: 'How do I manage orders?',
    keywords: ['order', 'orders', 'draft', 'abandoned', 'fulfill', 'shipping', 'refund'],
    phrases: [
      'manage orders',
      'how do i manage orders',
      'where are orders',
      'create order',
      'abandoned carts',
      'draft orders',
    ],
    answer:
      '**Orders** live under **Orders** in the sidebar:\n\n' +
      '• **Orders** (`/orders`) — all store orders\n' +
      '• **Drafts** (`/orders/drafts`) — draft orders you create for customers\n' +
      '• **Abandoned carts** (`/orders/abandoned-carts`) — checkouts that weren’t completed\n\n' +
      'Open an order from the list to fulfill, refund, or update details.\n\n' +
      'Tip: say **“take me to orders”** or **“open abandoned carts”**.',
  },
  {
    id: 'admin-products',
    suggestion: 'How do I add a product?',
    keywords: [
      'product',
      'products',
      'catalog',
      'inventory',
      'collection',
      'collections',
      'sku',
      'variant',
      'stock',
    ],
    phrases: [
      'add a product',
      'add product',
      'create product',
      'how do i add a product',
      'manage inventory',
      'where are products',
      'product collections',
    ],
    answer:
      '**Products** are under **Products** in the sidebar:\n\n' +
      '1. Go to **Products** → **Add product** (or `/products/new`)\n' +
      '2. Add title, media, variants, pricing, and inventory\n' +
      '3. Save — then manage stock under **Inventory**\n' +
      '4. Group items with **Collections** — or say **“create a collection”** here in chat\n' +
      '5. Restock with **Purchase orders** or move stock with **Transfers**\n\n' +
      'Say **“take me to products”**, **“create a collection”**, or **“open inventory”**.',
  },
  {
    id: 'admin-create-collection',
    suggestion: 'Create a collection',
    keywords: [
      'create collection',
      'add collection',
      'new collection',
      'make collection',
    ],
    phrases: [
      'create a collection',
      'create collection',
      'add a collection',
      'add collection',
      'new collection',
      'make a collection',
    ],
    answer:
      'Sure — fill in the collection details below and I’ll create it for you.\n\n' +
      'After it’s saved, I can take you straight to the collection details page.',
  },
  {
    id: 'admin-customers',
    suggestion: 'Where are customers?',
    keywords: ['customer', 'customers', 'segment', 'segments', 'buyer', 'shopper'],
    phrases: [
      'where are customers',
      'manage customers',
      'customer segments',
      'find a customer',
    ],
    answer:
      '**Customers** are in the sidebar under **Customers**:\n\n' +
      '• **Customers** (`/customers`) — profiles, orders, and contact info\n' +
      '• **Segments** (`/customers/segments`) — groups for marketing and targeting\n\n' +
      'Say **“take me to customers”** to open the list.',
  },
  {
    id: 'admin-discounts',
    suggestion: 'How do discounts work?',
    keywords: ['discount', 'discounts', 'coupon', 'promo', 'code', 'offer', 'sale'],
    phrases: [
      'how do discounts work',
      'create a discount',
      'promo code',
      'where are discounts',
    ],
    answer:
      'Open **Discounts** in the sidebar (`/discounts`) to create and manage promo codes and offers (amount off, free shipping, Buy X Get Y, and more).\n\n' +
      'Say **“take me to discounts”** and I’ll open that page.',
  },
  {
    id: 'admin-content',
    suggestion: 'Where is store content?',
    keywords: [
      'content',
      'files',
      'menus',
      'blog',
      'blogs',
      'articles',
      'newsletter',
      'contact submissions',
      'form submissions',
    ],
    phrases: [
      'store content',
      'where is content',
      'contact form submissions',
      'newsletter subscriptions',
      'manage menus',
    ],
    answer:
      '**Content** covers store materials outside the product catalog:\n\n' +
      '• **Files** — media uploads\n' +
      '• **Menus** — navigation links\n' +
      '• **Blog posts** — articles\n' +
      '• **Blogs** — blog containers under Content → Manage blogs\n' +
      '• **Contact submissions** — messages from your contact form\n' +
      '• **Newsletter subscriptions** — email signups\n\n' +
      'Say **“create a blog”** or **“create a blog post”** and I’ll collect the details in this chat, or **“take me to blogs”** / **“take me to blog posts”** to open those pages.',
  },
  {
    id: 'admin-create-blog',
    suggestion: 'Create a blog',
    keywords: ['create blog', 'add blog', 'new blog', 'make blog'],
    phrases: [
      'create a blog',
      'create blog',
      'add a blog',
      'add blog',
      'new blog',
      'make a blog',
    ],
    answer:
      'Sure — fill in the blog details below and I’ll create it for you.\n\n' +
      'After it’s saved, I can take you straight to the blog details page.',
  },
  {
    id: 'admin-create-blog-post',
    suggestion: 'Create a blog post',
    keywords: [
      'create blog post',
      'add blog post',
      'new blog post',
      'create article',
      'add article',
      'write post',
    ],
    phrases: [
      'create a blog post',
      'create blog post',
      'add a blog post',
      'add blog post',
      'new blog post',
      'create an article',
      'create article',
      'add an article',
      'write a blog post',
    ],
    answer:
      'Sure — pick a blog and fill in the post details below, then I’ll create it for you.\n\n' +
      'After it’s saved, I can take you straight to the blog post details page.',
  },
  {
    id: 'admin-themes',
    suggestion: 'How do themes work?',
    keywords: ['theme', 'themes', 'storefront', 'online store'],
    phrases: [
      'how do i edit my theme',
      'how do themes work',
      'where are themes',
      'where is the theme editor',
    ],
    answer:
      'Themes live under **Online Store → Themes** (`/online-store/themes`).\n\n' +
      '• Ask **“edit my current theme”** — I’ll open the editor for your live theme in a **new tab**\n' +
      '• Ask **“which theme is applied?”** — see name + custom vs catalog\n' +
      '• Ask **“change theme”** — quick list to apply another theme\n\n' +
      'Also nearby: **Pages** and **Preference** under Online Store.\n\n' +
      'Say **“take me to themes”** to jump to the Themes page.',
  },
  {
    id: 'admin-edit-current-theme',
    suggestion: 'Edit my current theme',
    keywords: [
      'edit theme',
      'edit current theme',
      'edit applied theme',
      'theme editor',
      'customize theme',
      'customise theme',
    ],
    phrases: [
      'edit my current theme',
      'edit current theme',
      'edit my theme',
      'edit applied theme',
      'edit live theme',
      'open theme editor',
      'open my theme editor',
      'customize my theme',
      'customise my theme',
    ],
    answer:
      'I can open the theme editor for your **live** theme in a new tab — custom or catalog.',
  },
  {
    id: 'admin-applied-theme',
    suggestion: 'Which theme is applied?',
    keywords: [
      'applied theme',
      'current theme',
      'live theme',
      'active theme',
      'which theme',
      'what theme',
    ],
    phrases: [
      'which theme is applied',
      'what theme is applied',
      'which theme is on my store',
      'what theme is on my store',
      'current theme',
      'live theme',
      'active theme',
      'my applied theme',
    ],
    answer:
      'I can check which theme is live on your store, and whether it’s a **custom** or **catalog** theme.\n\n' +
      'Ask me again (or tap this chip) and I’ll look it up — then you can **Edit this theme** or **Change theme?**',
  },
  {
    id: 'admin-change-theme',
    suggestion: 'Change theme',
    keywords: ['change theme', 'switch theme', 'swap theme', 'apply theme'],
    phrases: [
      'change theme',
      'change my theme',
      'switch theme',
      'switch my theme',
      'apply another theme',
    ],
    answer:
      'I can show a quick list of your installed catalog themes and custom themes so you can apply one right from this chat.',
  },
  {
    id: 'admin-analytics',
    suggestion: 'Where are analytics?',
    keywords: ['analytics', 'reports', 'report', 'live view', 'stats', 'metrics'],
    phrases: ['where are analytics', 'open reports', 'live view'],
    answer:
      '**Analytics** is in the sidebar (`/analytics`):\n\n' +
      '• **Products** (`/analytics/products`) — SKUs, vendors, catalog mix\n' +
      '• **Inventory** (`/analytics/inventory`) — on-hand, committed, cover\n' +
      '• **Customer** (`/analytics/customers`) — customer analytics\n' +
      '• **Content / CRM** (`/analytics/content`) — newsletter, forms, blog, pages\n' +
      '• **Live View** (`/analytics/live-view`)\n\n' +
      'Say **“take me to analytics”**.',
  },
  {
    id: 'admin-settings',
    suggestion: 'Where are settings?',
    keywords: ['settings', 'setting', 'store settings', 'preferences', 'configuration'],
    phrases: ['where are settings', 'open settings', 'store settings'],
    answer:
      'Open **Settings** from the admin (gear / settings area) for store configuration — general info, payments, shipping, checkout, notifications, and more.\n\n' +
      'Say **“take me to settings”** to open `/settings`.',
  },
  {
    id: 'admin-codiix',
    suggestion: 'What is Codiix?',
    keywords: ['codiix', 'who are you', 'assistant', 'ai', 'helper', 'bot'],
    phrases: ['what is codiix', 'who are you', 'what can you do'],
    answer:
      'I’m **Codiix** — an AI helper built by **Codiic**.\n\n' +
      '• In **store admin**, I help you find pages, create a **collection**, **blog**, or **blog post** in chat, and explain Orders, Products, Customers, and more.\n' +
      '• In the **theme editor**, I also help with sections, Agentic insert, Save, and Apply theme.\n\n' +
      'Try “create a collection” or “take me to orders”.',
  },
];

export const CODIX_ADMIN_FALLBACK =
  'I’m not sure on that one yet — in store admin I can help with:\n\n' +
  '• Finding **Orders**, **Products**, **Customers**, **Discounts**, **Content**, **Themes**, **Analytics**, and **Settings**\n' +
  '• Creating a **collection**, **blog**, or **blog post** right here in chat\n' +
  '• How to add products, manage inventory, and open the theme editor\n\n' +
  'Try “edit my current theme”, “create a collection”, or “take me to themes”.';

export const CODIX_ADMIN_SUGGESTIONS = CODIX_ADMIN_INTENTS.filter((i) => i.suggestion).map(
  (i) => ({
    id: i.id,
    label: i.suggestion!,
  }),
);

export type CodiixAdminNavTarget = {
  id: string;
  label: string;
  path: string;
  keywords: string[];
  phrases?: string[];
};

/** Quick jumps that mirror the admin sidebar. */
export const CODIX_ADMIN_NAV: CodiixAdminNavTarget[] = [
  {
    id: 'home',
    label: 'Home',
    path: '/',
    keywords: ['home', 'dashboard', 'overview'],
    phrases: ['take me home', 'go home', 'open home'],
  },
  {
    id: 'orders',
    label: 'Orders',
    path: '/orders',
    keywords: ['orders', 'order'],
    phrases: ['take me to orders', 'open orders', 'go to orders'],
  },
  {
    id: 'drafts',
    label: 'Draft orders',
    path: '/orders/drafts',
    keywords: ['drafts', 'draft orders', 'draft order'],
    phrases: ['open drafts', 'take me to drafts', 'draft orders'],
  },
  {
    id: 'abandoned-carts',
    label: 'Abandoned carts',
    path: '/orders/abandoned-carts',
    keywords: ['abandoned', 'abandoned carts', 'carts'],
    phrases: ['open abandoned carts', 'take me to abandoned carts'],
  },
  {
    id: 'products',
    label: 'Products',
    path: '/products',
    keywords: ['products', 'product', 'catalog'],
    phrases: ['take me to products', 'open products', 'go to products'],
  },
  {
    id: 'new-product',
    label: 'Add product',
    path: '/products/new',
    keywords: ['new product', 'add product', 'create product'],
    phrases: ['add a product', 'create a product', 'new product page'],
  },
  {
    id: 'collections',
    label: 'Collections',
    path: '/products/collections',
    keywords: ['collections', 'collection'],
    phrases: ['open collections', 'take me to collections'],
  },
  {
    id: 'inventory',
    label: 'Inventory',
    path: '/products/inventory',
    keywords: ['inventory', 'stock'],
    phrases: ['open inventory', 'take me to inventory'],
  },
  {
    id: 'purchase-orders',
    label: 'Purchase orders',
    path: '/products/purchase-orders',
    keywords: ['purchase orders', 'purchase order', 'po'],
    phrases: ['open purchase orders', 'take me to purchase orders'],
  },
  {
    id: 'transfers',
    label: 'Transfers',
    path: '/products/transfers',
    keywords: ['transfers', 'transfer'],
    phrases: ['open transfers', 'take me to transfers'],
  },
  {
    id: 'customers',
    label: 'Customers',
    path: '/customers',
    keywords: ['customers', 'customer'],
    phrases: ['take me to customers', 'open customers'],
  },
  {
    id: 'segments',
    label: 'Customer segments',
    path: '/customers/segments',
    keywords: ['segments', 'customer segments'],
    phrases: ['open segments', 'take me to segments'],
  },
  {
    id: 'discounts',
    label: 'Discounts',
    path: '/discounts',
    keywords: ['discounts', 'discount', 'coupons', 'promo'],
    phrases: ['take me to discounts', 'open discounts'],
  },
  {
    id: 'content',
    label: 'Content',
    path: '/content',
    keywords: ['content'],
    phrases: ['take me to content', 'open content'],
  },
  {
    id: 'blogs',
    label: 'Blogs',
    path: '/content/blogs',
    keywords: ['blogs', 'manage blogs'],
    phrases: ['take me to blogs', 'open blogs', 'manage blogs', 'open manage blogs'],
  },
  {
    id: 'blog-posts',
    label: 'Blog posts',
    path: '/content/articles',
    keywords: ['blog posts', 'articles'],
    phrases: ['take me to blog posts', 'open blog posts', 'open articles', 'take me to articles'],
  },
  {
    id: 'contact-submissions',
    label: 'Contact submissions',
    path: '/content/contact-submissions',
    keywords: ['contact submissions', 'form submissions', 'submissions'],
    phrases: ['open contact submissions', 'take me to contact submissions'],
  },
  {
    id: 'themes',
    label: 'Themes',
    path: '/online-store/themes',
    keywords: ['themes', 'theme', 'storefront theme'],
    phrases: ['take me to themes', 'open themes', 'go to themes'],
  },
  {
    id: 'online-store-pages',
    label: 'Online Store pages',
    path: '/online-store/pages',
    keywords: ['store pages', 'online store pages'],
    phrases: ['open store pages', 'take me to pages'],
  },
  {
    id: 'analytics',
    label: 'Analytics',
    path: '/analytics',
    keywords: ['analytics', 'reports', 'report'],
    phrases: ['take me to analytics', 'open analytics', 'open reports'],
  },
  {
    id: 'product-catalog-analytics',
    label: 'Products & catalog analytics',
    path: '/analytics/products',
    keywords: ['product analytics', 'catalog analytics', 'sku analytics'],
    phrases: ['open product analytics', 'take me to product analytics'],
  },
  {
    id: 'inventory-analytics',
    label: 'Inventory analytics',
    path: '/analytics/inventory',
    keywords: ['inventory analytics', 'stock analytics', 'on hand', 'days of cover'],
    phrases: ['open inventory analytics', 'take me to inventory analytics'],
  },
  {
    id: 'customer-analytics',
    label: 'Customer analytics',
    path: '/analytics/customers',
    keywords: ['customer analytics', 'customers analytics'],
    phrases: ['open customer analytics', 'take me to customer analytics'],
  },
  {
    id: 'content-crm-analytics',
    label: 'Content / CRM analytics',
    path: '/analytics/content',
    keywords: ['content analytics', 'crm analytics', 'newsletter analytics'],
    phrases: ['open content analytics', 'take me to content analytics'],
  },
  {
    id: 'live-view',
    label: 'Live view',
    path: '/analytics/live-view',
    keywords: ['live view', 'live analytics'],
    phrases: ['open live view', 'take me to live view'],
  },
  {
    id: 'settings',
    label: 'Settings',
    path: '/settings',
    keywords: ['settings', 'setting'],
    phrases: ['take me to settings', 'open settings'],
  },
];
