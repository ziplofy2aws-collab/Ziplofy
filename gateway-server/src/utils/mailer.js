const nodemailer = require('nodemailer');

function cleanEnv(value) {
  return String(value || '')
    .trim()
    .replace(/^["']|["']$/g, '');
}

/** Gmail app passwords are often pasted with spaces; nodemailer wants the raw 16 chars. */
function cleanPass(value) {
  return cleanEnv(value).replace(/\s+/g, '');
}

function resolveSmtp() {
  const emailAddress = cleanEnv(process.env.EMAIL_ADDRESS);
  const emailPassword = cleanPass(process.env.EMAIL_PASSWORD);
  const smtpUser = cleanEnv(process.env.SMTP_USER) || emailAddress;
  const smtpPass = cleanPass(process.env.SMTP_PASS) || emailPassword;
  const smtpHost = cleanEnv(process.env.SMTP_HOST) || (emailAddress && emailPassword ? 'smtp.gmail.com' : '');

  if (!smtpHost || !smtpUser || !smtpPass) return null;

  return {
    host: smtpHost,
    port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
    user: smtpUser,
    pass: smtpPass,
    from: cleanEnv(process.env.SMTP_FROM) || emailAddress || smtpUser,
    fromName: cleanEnv(process.env.SMTP_FROM_NAME) || 'Codiic',
  };
}

async function sendRawEmail(to, subject, html) {
  const smtp = resolveSmtp();
  if (!smtp?.host || !smtp?.user || !smtp?.pass) {
    console.warn('[gateway-mailer] SMTP not configured — email not sent to', to);
    return false;
  }
  const port = smtp.port || 587;
  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port,
    secure: port === 465,
    family: 4,
    auth: { user: smtp.user, pass: smtp.pass },
  });
  await transporter.sendMail({
    from: smtp.fromName ? `"${smtp.fromName}" <${smtp.from || smtp.user}>` : (smtp.from || smtp.user),
    to,
    subject,
    html,
  });
  return true;
}

module.exports = { sendRawEmail, resolveSmtp };
