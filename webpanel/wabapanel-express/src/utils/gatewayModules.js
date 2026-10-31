const MODULES = [
  { id: 'whatsapp', label: 'WhatsApp API', keys: ['chat', 'whatsappQr'] },
  { id: 'websiteBuilder', label: 'Website Builder', keys: ['onlineStore', 'mediaLibrary'] },
  { id: 'analytics', label: 'Analytics', keys: ['analytics'] },
  { id: 'inbox', label: 'Inbox', keys: ['inboxInstagram', 'inboxFacebook', 'inboxTelegram', 'inboxEmail'] },
  { id: 'campaigns', label: 'Campaigns', keys: ['templates', 'broadcasts', 'drips', 'smartBroadcast'] },
  { id: 'saveMoney', label: 'Save Money', keys: ['presetTemplates', 'presetCampaigns', 'qrCampaigns'] },
  { id: 'contacts', label: 'Contacts', keys: ['contacts', 'segments', 'tags', 'dataFields', 'importLogs', 'badges'] },
  { id: 'leadCrm', label: 'Lead CRM', keys: ['crm'] },
  { id: 'pipeline', label: 'Pipeline Board', keys: ['crm'] },
  { id: 'automation', label: 'Automation', keys: ['automations', 'botFlows', 'followups', 'quickReplies', 'keywords', 'appointments', 'tickets', 'predefinedActions'] },
  // Sector modules — only the one matching the user's industry is offered.
  { id: 'clinic', label: 'Clinic', keys: ['clinic'], sector: true },
  { id: 'edtech', label: 'Education', keys: ['edtech'], sector: true },
  { id: 'realEstate', label: 'Real Estate', keys: ['realEstate'], sector: true },
  { id: 'agency', label: 'Agency / Consulting', keys: ['agency'], sector: true },
  { id: 'legal', label: 'Legal Practice', keys: ['legal'], sector: true },
  { id: 'hospitality', label: 'Hospitality', keys: ['hospitality'], sector: true },
  { id: 'salon', label: 'Salon & Spa', keys: ['salon'], sector: true },
  { id: 'serviceBusiness', label: 'Service Business', keys: ['serviceBusiness'], sector: true },
  { id: 'travel', label: 'Tour & Travel', keys: ['travel'], sector: true },
  { id: 'commerce', label: 'Leads & Commerce', keys: ['leads', 'forms', 'ecommerce', 'shortLinks'] },
  { id: 'channels', label: 'Channels', keys: [] },
  { id: 'settings', label: 'Settings', keys: ['teams', 'integrations', 'chatAppearance', 'aiChatbot', 'aiCalling', 'knowledgeBase', 'auditLog'] },
  { id: 'billing', label: 'Subscription & Plans', keys: [] },
  { id: 'ctwaAds', label: 'CTWA Ads', keys: ['ctwaAds'] },
  { id: 'igAutoDm', label: 'Instagram Auto DM', keys: ['igAutoDm'] },
  { id: 'apiAccess', label: 'API & Developers', keys: ['apiAccess'] },
];

const ALWAYS_ON = ['websiteBuilder'];

// Gateway industry id -> the sector module that industry gets (locked on).
const INDUSTRY_MODULE = {
  healthcare: 'clinic',
  education: 'edtech',
  real_estate: 'realEstate',
  agency: 'agency',
  legal: 'legal',
  hospitality: 'hospitality',
  salon: 'salon',
  other_service: 'serviceBusiness',
  tour_travel: 'travel',
};
const SECTOR_MODULE_IDS = new Set(MODULES.filter((m) => m.sector).map((m) => m.id));

function lockedModuleIds(industry) {
  const ids = [...ALWAYS_ON];
  const extra = INDUSTRY_MODULE[industry];
  if (extra && !ids.includes(extra)) ids.push(extra);
  return ids;
}

function normalizeSelectedModules(industry, modules) {
  const allowed = new Set(MODULES.map((item) => item.id));
  const ownSector = INDUSTRY_MODULE[industry] || '';
  const picked = [];
  for (const id of Array.isArray(modules) ? modules : []) {
    const key = String(id || '').trim();
    if (key === 'onlineStore') {
      if (!picked.includes('websiteBuilder')) picked.push('websiteBuilder');
      continue;
    }
    // Sector modules only belong to their industry — never selectable cross-industry.
    if (SECTOR_MODULE_IDS.has(key) && key !== ownSector) continue;
    if (allowed.has(key) && !picked.includes(key)) picked.push(key);
  }
  for (const locked of lockedModuleIds(industry)) {
    if (!picked.includes(locked)) picked.unshift(locked);
  }
  return picked;
}

function defaultLaunchModules(industry) {
  return lockedModuleIds(industry);
}

function featureOverridesForModules(selectedModules, industry = '') {
  const { FEATURE_KEYS } = require('../middleware/featureGate');
  const selected = new Set(selectedModules);
  const enabled = new Set();
  for (const mod of MODULES) {
    if (!selected.has(mod.id)) continue;
    for (const key of mod.keys) enabled.add(key);
  }
  const overrides = {
    selectedModules: selectedModules.slice(),
    industry: industry || undefined,
  };
  for (const key of FEATURE_KEYS) overrides[key] = enabled.has(key);
  return overrides;
}

function launchPathFor({ industry }) {
  const paths = {
    education: '/client/edtech/overview',
    healthcare: '/client/clinic/queue',
    // other sectors land on the dashboard until their dedicated pages ship
  };
  return paths[industry] || '/client/dashboard';
}

function publicCatalog(industry, selectedModules) {
  const locked = new Set(lockedModuleIds(industry));
  const selected = new Set(selectedModules);
  const ownSector = INDUSTRY_MODULE[industry] || '';
  return {
    locked: [...locked],
    selected: [...selected],
    industry: industry || '',
    modules: MODULES
      .filter((item) => !item.sector || item.id === ownSector)
      .map((item) => ({
        id: item.id,
        label: item.label,
        locked: locked.has(item.id),
        selected: selected.has(item.id),
      })),
  };
}

module.exports = {
  MODULES,
  INDUSTRY_MODULE,
  SECTOR_MODULE_IDS,
  normalizeSelectedModules,
  defaultLaunchModules,
  featureOverridesForModules,
  launchPathFor,
  publicCatalog,
  lockedModuleIds,
};
