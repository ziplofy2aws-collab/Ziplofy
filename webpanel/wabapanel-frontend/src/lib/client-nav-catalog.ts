/** Plain client navigation catalog for sidebar + global search. */

export type ClientNavLeaf = {
  label: string;
  href: string;
  keywords?: string[];
};

export type ClientNavSection = {
  label: string;
  href?: string;
  keywords?: string[];
  children?: ClientNavLeaf[];
};

export const ADMIN_FEATURE_MAP: Record<string, string> = {
  '/client/chat?channel=whatsapp': 'chat',
  '/client/chat?channel=whatsapp_qr': 'whatsappQr',
  '/client/chat?channel=instagram': 'inboxInstagram',
  '/client/chat?channel=facebook': 'inboxFacebook',
  '/client/chat?channel=telegram': 'inboxTelegram',
  '/client/chat?channel=telegram_personal': 'inboxTelegram',
  '/client/chat?channel=email': 'inboxEmail',
  '/client/contacts': 'contacts',
  '/client/segments': 'segments',
  '/client/tags': 'tags',
  '/client/data-fields': 'dataFields',
  '/client/import-logs': 'importLogs',
  '/client/badges': 'badges',
  '/client/save-money/templates': 'presetTemplates',
  '/client/save-money/campaigns': 'presetCampaigns',
  '/client/save-money/qr-campaigns': 'qrCampaigns',
  '/client/tickets': 'tickets',
  '/client/predefined-actions': 'predefinedActions',
  '/client/response-resources': 'responseResources',
  '/client/online-store/media-library': 'mediaLibrary',
  '/client/media-library': 'mediaLibrary',
  '/client/instagram-auto-dm': 'igAutoDm',
  '/client/chat-appearance': 'chatAppearance',
  '/client/audit-log': 'auditLog',
  '/client/templates': 'templates',
  '/client/broadcasts': 'broadcasts',
  '/client/smart-broadcast': 'smartBroadcast',
  '/client/save-money/drip': 'drips',
  '/client/followups': 'followups',
  '/client/bot-flows': 'botFlows',
  '/client/automations': 'automations',
  '/client/automations/flows': 'automations',
  '/client/quick-replies': 'quickReplies',
  '/client/keywords': 'keywords',
  '/client/appointments': 'appointments',
  '/client/events': 'events',
  '/client/leads': 'leads',
  '/client/forms': 'forms',
  '/client/facebook-leads': 'leads',
  '/client/catalogs': 'ecommerce',
  '/client/orders': 'ecommerce',
  '/client/short-links': 'shortLinks',
  '/client/pipelines': 'crm',
  '/client/crm': 'crm',
  '/client/call-center': 'crm',
  '/client/lead-dashboard': 'crm',
  '/client/analytics': 'analytics',
  '/client/teams': 'teams',
  '/client/agents': 'teams',
  '/client/integrations': 'integrations',
  '/client/ai-settings': 'aiChatbot',
  '/client/ai-calling': 'aiCalling',
  '/client/bulk-calls': 'aiCalling',
  '/client/knowledge-base': 'knowledgeBase',
  '/client/ctwa-ads': 'ctwaAds',
  '/client/api-docs': 'apiAccess',
};

export const MODULE_KEY_MAP: Record<string, string> = {
  Dashboard: 'dashboard',
  Analytics: 'analytics',
  Inbox: 'inbox',
  Contacts: 'contacts',
  'Lead CRM': 'pipelines',
  'CRM 360': 'pipelines',
  'Calling Center': 'pipelines',
  'Pipeline Board': 'pipelines',
  Campaigns: 'campaigns',
  'Save Money': 'campaigns',
  Automation: 'automation',
  'Leads & Commerce': 'commerce',
  Channels: 'channels',
  Settings: 'settings',
  'Subscription & Plans': 'billing',
  'Media Library': 'media',
  'CTWA Ads': 'campaigns',
  'API & Developers': 'developer',
};

export const CLIENT_NAV_SECTIONS: ClientNavSection[] = [
  { label: 'Dashboard', href: '/client/dashboard', keywords: ['home', 'overview'] },
  { label: 'Analytics', href: '/client/analytics', keywords: ['reports', 'stats', 'metrics'] },
  {
    label: 'Inbox',
    keywords: ['chat', 'messages', 'conversations'],
    children: [
      { label: 'WhatsApp Inbox', href: '/client/chat?channel=whatsapp', keywords: ['wa', 'whatsapp'] },
      { label: 'WhatsApp QR Inbox', href: '/client/chat?channel=whatsapp_qr', keywords: ['qr', 'web whatsapp'] },
      { label: 'Instagram Inbox', href: '/client/chat?channel=instagram', keywords: ['ig', 'dm'] },
      { label: 'Facebook Inbox', href: '/client/chat?channel=facebook', keywords: ['fb', 'messenger'] },
      { label: 'Telegram Bot Inbox', href: '/client/chat?channel=telegram', keywords: ['tg', 'bot'] },
      { label: 'Personal Telegram Inbox', href: '/client/chat?channel=telegram_personal', keywords: ['personal tg'] },
      { label: 'Email Inbox', href: '/client/chat?channel=email', keywords: ['mail', 'gmail'] },
    ],
  },
  {
    label: 'Campaigns',
    keywords: ['broadcast', 'marketing', 'bulk'],
    children: [
      { label: 'Message Templates', href: '/client/templates', keywords: ['template', 'hsm'] },
      { label: 'Broadcast', href: '/client/broadcasts', keywords: ['bulk send', 'campaign'] },
      { label: 'Smart Broadcast', href: '/client/smart-broadcast', keywords: ['smart', 'ai broadcast'] },
      { label: 'Drip Campaigns', href: '/client/save-money/drip', keywords: ['drip', 'sequence', 'automation'] },
    ],
  },
  {
    label: 'Save Money',
    keywords: ['preset', 'cheap', 'qr campaign'],
    children: [
      { label: 'Preset Templates', href: '/client/save-money/templates', keywords: ['saved templates'] },
      { label: 'Preset Campaigns', href: '/client/save-money/campaigns', keywords: ['saved campaigns'] },
      { label: 'Web WhatsApp Campaigns', href: '/client/save-money/qr-campaigns', keywords: ['qr', 'web wa'] },
    ],
  },
  {
    label: 'Contacts',
    keywords: ['customers', 'directory', 'people'],
    children: [
      { label: 'Contact Directory', href: '/client/contacts', keywords: ['list', 'phone book'] },
      { label: 'Segments', href: '/client/segments', keywords: ['groups', 'audience'] },
      { label: 'Labels', href: '/client/tags', keywords: ['tags', 'labels'] },
      { label: 'Stage/Pipeline', href: '/client/stages', keywords: ['stages', 'pipeline stage'] },
      { label: 'Data Fields', href: '/client/data-fields', keywords: ['custom fields', 'attributes'] },
      { label: 'Import Logs', href: '/client/import-logs', keywords: ['csv import', 'upload'] },
    ],
  },
  {
    label: 'Lead CRM',
    keywords: ['crm', 'leads', 'sales'],
    children: [
      { label: 'Lead Dashboard', href: '/client/lead-dashboard', keywords: ['lead overview'] },
      { label: 'Lead Report', href: '/client/call-center', keywords: ['calling', 'call center'] },
      { label: 'CRM 360', href: '/client/crm', keywords: ['360', 'customer view'] },
    ],
  },
  { label: 'Pipeline Board', href: '/client/pipelines', keywords: ['kanban', 'deals', 'board'] },
  {
    label: 'Automation',
    keywords: ['bots', 'flows', 'auto reply'],
    children: [
      { label: 'Automation Flows', href: '/client/automations', keywords: ['workflow'] },
      { label: 'Bulk AI Calls', href: '/client/bulk-calls', keywords: ['voice', 'ai call'] },
      { label: 'Bot Flow Builder', href: '/client/bot-flows', keywords: ['chatbot', 'builder'] },
      { label: 'AI Follow-ups', href: '/client/followups', keywords: ['follow up', 'nudge'] },
      { label: 'Flow Builder', href: '/client/automations/flows', keywords: ['visual flow'] },
      { label: 'Quick Replies', href: '/client/quick-replies', keywords: ['canned', 'shortcuts'] },
      { label: 'Keyword Triggers', href: '/client/keywords', keywords: ['auto reply', 'trigger'] },
      { label: 'Appointments', href: '/client/appointments', keywords: ['booking', 'calendar'] },
      { label: 'Tickets', href: '/client/tickets', keywords: ['support ticket', 'helpdesk'] },
    ],
  },
  {
    label: 'Leads & Commerce',
    keywords: ['ecommerce', 'shop', 'orders'],
    children: [
      { label: 'All Leads', href: '/client/leads', keywords: ['lead list'] },
      { label: 'Lead Gen Forms', href: '/client/forms', keywords: ['form builder', 'capture'] },
      { label: 'Facebook Leads', href: '/client/facebook-leads', keywords: ['fb leads', 'meta'] },
      { label: 'Product Catalogs', href: '/client/catalogs', keywords: ['products', 'catalog'] },
      { label: 'Order Management', href: '/client/orders', keywords: ['orders', 'sales'] },
      { label: 'Short Links', href: '/client/short-links', keywords: ['url', 'link shortener'] },
    ],
  },
  {
    label: 'Channels',
    keywords: ['integrations', 'connect'],
    children: [
      { label: 'Channel Config', href: '/client/channels', keywords: ['setup channels'] },
      { label: 'WhatsApp Settings', href: '/client/whatsapp', keywords: ['wa connect', 'api'] },
    ],
  },
  {
    label: 'Settings',
    keywords: ['config', 'preferences', 'profile'],
    children: [
      { label: 'Organization Teams', href: '/client/teams', keywords: ['team', 'org'] },
      { label: 'Agents', href: '/client/agents', keywords: ['staff', 'users'] },
      { label: 'Integrations', href: '/client/integrations', keywords: ['connect', 'apps'] },
      { label: 'Chat Appearance', href: '/client/chat-appearance', keywords: ['theme', 'branding'] },
      { label: 'AI Settings', href: '/client/ai-settings', keywords: ['chatbot ai', 'gpt'] },
      { label: 'AI Calling Settings', href: '/client/ai-calling', keywords: ['voice ai'] },
      { label: 'Knowledge Base', href: '/client/knowledge-base', keywords: ['kb', 'docs', 'faq'] },
      { label: 'Audit Log', href: '/client/audit-log', keywords: ['activity', 'history'] },
      { label: 'Business Settings', href: '/client/settings', keywords: ['workspace', 'business profile'] },
    ],
  },
  {
    label: 'Subscription & Plans',
    keywords: ['billing', 'payment', 'plan'],
    children: [
      { label: 'Subscription Plans', href: '/client/subscriptions', keywords: ['upgrade', 'pricing'] },
      { label: 'Billing & Wallet', href: '/client/billing', keywords: ['wallet', 'balance', 'recharge'] },
      { label: 'Transactions', href: '/client/transactions', keywords: ['payments', 'history'] },
      { label: 'Invoices', href: '/client/invoices', keywords: ['invoice', 'receipt'] },
    ],
  },
  { label: 'Media Library', href: '/client/online-store/media-library', keywords: ['files', 'images', 'uploads', 'online store'] },
  { label: 'Blogs', href: '/client/online-store/blogs', keywords: ['blog', 'blog posts', 'articles', 'content', 'online store'] },
  { label: 'Pages', href: '/client/online-store/pages', keywords: ['custom page', 'about', 'faq', 'content', 'online store'] },
  { label: 'Menus', href: '/client/online-store/menus', keywords: ['navigation', 'header', 'footer', 'nav', 'online store'] },
  { label: 'Policies', href: '/client/online-store/policies', keywords: ['privacy', 'terms', 'refund', 'legal', 'online store'] },
  { label: 'CTWA Ads', href: '/client/ctwa-ads', keywords: ['click to whatsapp', 'meta ads'] },
  { label: 'Instagram Auto DM', href: '/client/instagram-auto-dm', keywords: ['ig dm', 'auto dm'] },
  { label: 'API & Developers', href: '/client/api-docs', keywords: ['api', 'webhook', 'developer'] },
  { label: 'Support', href: '/client/support', keywords: ['help', 'ticket', 'contact us'] },
  { label: 'User Guide', href: '/client/user-guide', keywords: ['docs', 'tutorial', 'how to'] },
  // Extra pages reachable in app but not top-level sidebar links
  { label: 'Badges', href: '/client/badges', keywords: ['gamification', 'rewards'] },
  { label: 'Events', href: '/client/events', keywords: ['calendar events'] },
  { label: 'Drip Campaigns', href: '/client/drips', keywords: ['drip', 'nurture'] },
  { label: 'Predefined Actions', href: '/client/predefined-actions', keywords: ['actions', 'macros'] },
  { label: 'Response Resources', href: '/client/response-resources', keywords: ['resources', 'assets'] },
  { label: 'Wallet', href: '/client/wallet', keywords: ['balance', 'credits'] },
  { label: 'Toolset', href: '/client/toolset', keywords: ['tools', 'utilities'] },
];

export type ClientNavSearchItem = {
  id: string;
  title: string;
  href: string;
  section: string;
  navPath: string[];
  keywords: string[];
};

export function buildClientNavSearchCatalog(): ClientNavSearchItem[] {
  const items: ClientNavSearchItem[] = [];
  const seen = new Set<string>();

  const add = (item: ClientNavSearchItem) => {
    const key = item.href;
    if (seen.has(key)) return;
    seen.add(key);
    items.push(item);
  };

  for (const section of CLIENT_NAV_SECTIONS) {
    const sectionKeywords = section.keywords ?? [];
    if (section.href) {
      add({
        id: section.href,
        title: section.label,
        href: section.href,
        section: section.label,
        navPath: [section.label],
        keywords: [section.label.toLowerCase(), ...sectionKeywords],
      });
    }
    for (const child of section.children ?? []) {
      add({
        id: child.href,
        title: child.label,
        href: child.href,
        section: section.label,
        navPath: section.href ? [section.label, child.label] : [section.label, child.label],
        keywords: [
          child.label.toLowerCase(),
          section.label.toLowerCase(),
          ...(child.keywords ?? []),
          ...sectionKeywords,
        ],
      });
    }
  }

  return items;
}

export function formatNavBreadcrumb(item: ClientNavSearchItem): string {
  if (item.navPath.length <= 1) return item.title;
  return item.navPath.join(' › ');
}
