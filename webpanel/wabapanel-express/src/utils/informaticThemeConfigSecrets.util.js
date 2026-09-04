const SMTP_PASSWORD_MASK = '********';

function getNested(obj, path) {
  if (!obj || typeof obj !== 'object') return undefined;
  return path.split('.').reduce((cur, key) => {
    if (cur == null || typeof cur !== 'object') return undefined;
    return cur[key];
  }, obj);
}

function setNested(obj, path, value) {
  const parts = path.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    if (cur[key] == null || typeof cur[key] !== 'object') {
      cur[key] = {};
    }
    cur = cur[key];
  }
  cur[parts[parts.length - 1]] = value;
}

/** Mask SMTP password before sending config to the theme editor. */
function redactThemeConfigSecrets(config) {
  if (!config || typeof config !== 'object') return config;
  const next = structuredClone(config);
  const password = getNested(next, 'settings.email.password');
  if (password) {
    setNested(next, 'settings.email.password', SMTP_PASSWORD_MASK);
  }
  return next;
}

/** Remove secrets from public storefront runtime payloads. */
function stripThemeConfigSecrets(config) {
  if (!config || typeof config !== 'object') return config;
  const next = structuredClone(config);
  if (getNested(next, 'settings.email')) {
    delete next.settings.email.password;
  }
  return next;
}

/**
 * Preserve stored SMTP password when editor submits blank or mask placeholder.
 */
function mergeThemeConfigSecrets(incoming, existing) {
  if (!incoming || typeof incoming !== 'object') return incoming;
  const next = structuredClone(incoming);
  const incomingPassword = getNested(next, 'settings.email.password');
  const existingPassword = getNested(existing, 'settings.email.password');

  if (
    !incomingPassword ||
    incomingPassword === SMTP_PASSWORD_MASK ||
    String(incomingPassword).trim() === ''
  ) {
    if (existingPassword) {
      setNested(next, 'settings.email.password', existingPassword);
    } else if (getNested(next, 'settings.email')) {
      setNested(next, 'settings.email.password', '');
    }
  }

  return next;
}

module.exports = {
  SMTP_PASSWORD_MASK,
  redactThemeConfigSecrets,
  stripThemeConfigSecrets,
  mergeThemeConfigSecrets,
};
