const MODULES = [
  { id: 'whatsapp', label: 'WhatsApp API', keys: ['chat', 'whatsappQr'], kind: 'core' },
  { id: 'websiteBuilder', label: 'Website Builder', keys: ['onlineStore', 'mediaLibrary'], kind: 'core' },
  { id: 'analytics', label: 'Analytics', keys: ['analytics'], kind: 'panel' },
  { id: 'inbox', label: 'Inbox', keys: ['inboxInstagram', 'inboxFacebook', 'inboxTelegram', 'inboxEmail'], kind: 'panel' },
  { id: 'campaigns', label: 'Campaigns', keys: ['templates', 'broadcasts', 'drips', 'smartBroadcast'], kind: 'panel' },
  { id: 'saveMoney', label: 'Save Money', keys: ['presetTemplates', 'presetCampaigns', 'qrCampaigns'], kind: 'panel' },
  { id: 'contacts', label: 'Contacts', keys: ['contacts', 'segments', 'tags', 'dataFields', 'importLogs', 'badges'], kind: 'panel' },
  { id: 'leadCrm', label: 'Lead CRM', keys: ['crm'], kind: 'panel' },
  { id: 'pipeline', label: 'Pipeline Board', keys: ['crm'], kind: 'panel' },
  { id: 'automation', label: 'Automation', keys: ['automations', 'botFlows', 'followups', 'quickReplies', 'keywords', 'appointments', 'tickets', 'predefinedActions'], kind: 'panel' },
  { id: 'clinic', label: 'Clinic', keys: ['clinic'], kind: 'panel' },
  { id: 'edtech', label: 'Education', keys: ['edtech'], kind: 'panel' },
  { id: 'commerce', label: 'Leads & Commerce', keys: ['leads', 'forms', 'ecommerce', 'shortLinks'], kind: 'panel' },
  { id: 'channels', label: 'Channels', keys: [], kind: 'panel' },
  { id: 'settings', label: 'Settings', keys: ['teams', 'integrations', 'chatAppearance', 'aiChatbot', 'aiCalling', 'knowledgeBase', 'auditLog'], kind: 'panel' },
  { id: 'billing', label: 'Subscription & Plans', keys: [], kind: 'panel' },
  { id: 'ctwaAds', label: 'CTWA Ads', keys: ['ctwaAds'], kind: 'panel' },
  { id: 'igAutoDm', label: 'Instagram Auto DM', keys: ['igAutoDm'], kind: 'panel' },
  { id: 'apiAccess', label: 'API & Developers', keys: ['apiAccess'], kind: 'panel' },
];

const DEFAULT_CORE_SERVICES = ['whatsapp', 'websiteBuilder'];

const INDUSTRY_MODULE = {
  education: 'edtech',
  healthcare: 'clinic',
};

function lockedModuleId(industry) {
  return INDUSTRY_MODULE[industry] || '';
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
  const locked = lockedModuleId(industry);
  if (locked && !picked.includes(locked)) picked.unshift(locked);
  return picked;
}

function deriveSelectedService(selectedModules) {
  const modules = Array.isArray(selectedModules) ? selectedModules : [];
  if (modules.includes('websiteBuilder') || modules.includes('onlineStore')) return 'website_builder';
  if (modules.includes('whatsapp')) return 'whatsapp_api';
  return '';
}

function hasCoreService(selectedModules) {
  const modules = Array.isArray(selectedModules) ? selectedModules : [];
  return modules.includes('whatsapp') || modules.includes('websiteBuilder') || modules.includes('onlineStore');
}

module.exports = {
  MODULES,
  DEFAULT_CORE_SERVICES,
  INDUSTRY_MODULE,
  lockedModuleId,
  normalizeSelectedModules,
  deriveSelectedService,
  hasCoreService,
};
