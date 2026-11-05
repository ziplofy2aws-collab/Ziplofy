const crypto = require('crypto');
const { sendRawEmail } = require('./mailer');

function hashOtp(code) {
  return crypto.createHash('sha256').update(String(code || '')).digest('hex');
}

async function issueEmailOtp(user) {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  user.emailOtpHash = hashOtp(code);
  user.emailOtpExpire = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  const sent = await sendRawEmail(
    user.email,
    `Codiic verification code: ${code}`,
    `<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto">
      <h2>Verify your account</h2>
      <p>Hi ${user.name || ''}, use this code to verify your Codiic account:</p>
      <p style="font-size:28px;font-weight:bold;letter-spacing:6px;color:#111">${code}</p>
      <p style="color:#888">This code expires in 10 minutes.</p>
    </div>`
  ).catch((err) => {
    console.error('[gateway-otp] send failed:', err.message);
    return false;
  });

  if (sent) {
    console.log(`[gateway-otp] email sent to ${user.email}`);
  } else {
    // Always log the code when delivery fails so local/dev can still verify.
    console.log(`[gateway-otp] delivery failed — ${user.email} => ${code}`);
  }
  // Also log in non-production for easier local testing.
  if (process.env.NODE_ENV !== 'production' && sent) {
    console.log(`[gateway-otp] ${user.email} => ${code}`);
  }
  return { code, sent: Boolean(sent) };
}

function verifyEmailOtp(user, code) {
  if (!user.emailOtpHash || !user.emailOtpExpire) return false;
  if (Date.now() > new Date(user.emailOtpExpire).getTime()) return false;
  return hashOtp(code) === user.emailOtpHash;
}

module.exports = { issueEmailOtp, verifyEmailOtp, hashOtp };
