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
  { id: 'clinic', label: 'Clinic', keys: ['clinic'] },
  { id: 'edtech', label: 'Education', keys: ['edtech'] },
  { id: 'commerce', label: 'Leads & Commerce', keys: ['leads', 'forms', 'ecommerce', 'shortLinks'] },
  { id: 'channels', label: 'Channels', keys: [] },
  { id: 'settings', label: 'Settings', keys: ['teams', 'integrations', 'chatAppearance', 'aiChatbot', 'aiCalling', 'knowledgeBase', 'auditLog'] },
  { id: 'billing', label: 'Subscription & Plans', keys: [] },
  { id: 'ctwaAds', label: 'CTWA Ads', keys: ['ctwaAds'] },
  { id: 'igAutoDm', label: 'Instagram Auto DM', keys: ['igAutoDm'] },
  { id: 'apiAccess', label: 'API & Developers', keys: ['apiAccess'] },
];

const ALWAYS_ON = ['websiteBuilder'];

const INDUSTRY_MODULE = {
  education: 'edtech',
  healthcare: 'clinic',
};

function lockedModuleIds(industry) {
  const ids = [...ALWAYS_ON];
  const extra = INDUSTRY_MODULE[industry];
  if (extra && !ids.includes(extra)) ids.push(extra);
  return ids;
}

function normalizeSelectedModules(industry, modules) {
  const allowed = new Set(MODULES.map((item) => item.id));
  const picked = [];
  for (const id of Array.isArray(modules) ? modules : []) {
    const key = String(id || '').trim();
    if (key === 'onlineStore') {
      if (!picked.includes('websiteBuilder')) picked.push('websiteBuilder');
      continue;
    }
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
  if (industry === 'education') return '/client/edtech/overview';
  if (industry === 'healthcare') return '/client/clinic/queue';
  return '/client/dashboard';
}

function publicCatalog(industry, selectedModules) {
  const locked = new Set(lockedModuleIds(industry));
  const selected = new Set(selectedModules);
  return {
    locked: [...locked],
    selected: [...selected],
    modules: MODULES.map((item) => ({
      id: item.id,
      label: item.label,
      locked: locked.has(item.id),
      selected: selected.has(item.id),
    })),
  };
}

module.exports = {
  MODULES,
  normalizeSelectedModules,
  defaultLaunchModules,
  featureOverridesForModules,
  launchPathFor,
  publicCatalog,
  lockedModuleIds,
};
