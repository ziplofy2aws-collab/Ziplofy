function sanitizeWhatsappPhone(raw) {
  if (raw == null) return '';
  return String(raw).replace(/\D/g, '');
}

function readNested(obj, path) {
  if (!obj || typeof obj !== 'object') return undefined;
  return path.split('.').reduce((cur, key) => {
    if (cur == null || typeof cur !== 'object') return undefined;
    return cur[key];
  }, obj);
}

/**
 * Resolve WhatsApp widget phone from theme config with optional workspace fallback.
 */
function resolveWhatsappWidgetPhone(config, workspace) {
  const widgetPhone = sanitizeWhatsappPhone(readNested(config, 'settings.whatsappWidget.phone'));
  if (widgetPhone) return widgetPhone;

  const contactPhone = sanitizeWhatsappPhone(readNested(config, 'settings.contact.phone'));
  if (contactPhone) return contactPhone;

  const ws = workspace?.whatsapp;
  if (ws) {
    const wsPhone = sanitizeWhatsappPhone(ws.phoneNumber || ws.displayPhoneNumber);
    if (wsPhone) return wsPhone;
  }

  return '';
}

/**
 * When widget is enabled but phone is blank, fill from contact phone or workspace WhatsApp.
 * Mutates and returns config.
 */
function enrichInformaticWhatsappWidgetConfig(config, workspace) {
  if (!config || typeof config !== 'object') return config;
  const next = config;
  if (!next.settings || typeof next.settings !== 'object') {
    next.settings = {};
  }
  if (!next.settings.whatsappWidget || typeof next.settings.whatsappWidget !== 'object') {
    next.settings.whatsappWidget = {
      enabled: false,
      phone: '',
      message: 'Hi! I have a question about your website.',
      greeting: 'Need help? Chat with us',
    };
  }

  const widget = next.settings.whatsappWidget;
  if (!widget.enabled) return next;

  const current = sanitizeWhatsappPhone(widget.phone);
  if (current) {
    widget.phone = current;
    return next;
  }

  const resolved = resolveWhatsappWidgetPhone(next, workspace);
  if (resolved) {
    widget.phone = resolved;
  }

  return next;
}

module.exports = {
  sanitizeWhatsappPhone,
  resolveWhatsappWidgetPhone,
  enrichInformaticWhatsappWidgetConfig,
};
