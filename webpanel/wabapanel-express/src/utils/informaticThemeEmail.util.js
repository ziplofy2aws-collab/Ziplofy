const nodemailer = require('nodemailer');

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function readEmailSettings(themeConfig) {
  const email = themeConfig?.settings?.email;
  if (!email || typeof email !== 'object') return null;

  const host = String(email.host || '').trim();
  const user = String(email.user || '').trim();
  const password = String(email.password || '');
  const from = String(email.from || '').trim() || user;
  const fromName = String(email.fromName || '').trim();
  const port = Number.parseInt(String(email.port || '587'), 10) || 587;
  const encryption = String(email.encryption || 'tls').trim().toLowerCase();

  if (!host || !user || !password) return null;

  return { host, user, password, from, fromName, port, encryption };
}

function buildTransport(smtp) {
  const secure = smtp.encryption === 'ssl' || smtp.port === 465;
  return nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure,
    requireTLS: smtp.encryption === 'tls' && smtp.port !== 465,
    family: 4,
    auth: { user: smtp.user, pass: smtp.password },
  });
}

/**
 * Send a contact-form notification using per-store Informatic theme SMTP settings.
 * Returns { sent: boolean, reason?: string }.
 */
async function sendInformaticThemeContactEmail(themeConfig, { to, submission, storeName }) {
  const smtp = readEmailSettings(themeConfig);
  if (!smtp) {
    return { sent: false, reason: 'SMTP not configured in theme settings' };
  }

  const recipient = String(to || themeConfig?.settings?.contact?.email || '').trim();
  if (!recipient) {
    return { sent: false, reason: 'Contact email not configured' };
  }

  const subject = `New contact message — ${storeName || 'Your store'}`;
  const html = `
    <h2>New contact form submission</h2>
    <p><strong>Name:</strong> ${escapeHtml(submission.name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(submission.email)}</p>
    ${
      submission.phone
        ? `<p><strong>Phone:</strong> ${escapeHtml(submission.phone)}</p>`
        : ''
    }
    <p><strong>Message:</strong></p>
    <p style="white-space:pre-wrap">${escapeHtml(submission.message)}</p>
  `;

  const transporter = buildTransport(smtp);
  const fromHeader = smtp.fromName
    ? `"${smtp.fromName}" <${smtp.from || smtp.user}>`
    : smtp.from || smtp.user;

  await transporter.sendMail({
    from: fromHeader,
    to: recipient,
    replyTo: submission.email,
    subject,
    html,
  });

  return { sent: true };
}

module.exports = {
  readEmailSettings,
  sendInformaticThemeContactEmail,
};
