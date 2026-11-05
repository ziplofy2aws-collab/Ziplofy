const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
const config = require('../config');
const PlatformUser = require('../models/PlatformUser');
const { signAccessToken } = require('../utils/jwt');
const { publicUser, nextWizardPath } = require('../utils/userView');
const { issueSsoRedirect, provisionProduct } = require('../utils/provision');
const { issueEmailOtp, verifyEmailOtp } = require('../utils/emailOtp');

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function normalizePhone(phone) {
  return String(phone || '').trim();
}

function otpClientFields(issued) {
  const emailSent = Boolean(issued?.sent);
  const fields = { emailSent };
  // Local/dev only: surface the code when SMTP is missing or rejected so signup isn't blocked.
  if (!emailSent && process.env.NODE_ENV !== 'production' && issued?.code) {
    fields.devOtp = String(issued.code);
  }
  return fields;
}

async function ensureProvisionedAndRedirect(user) {
  if (user.provider === 'local' && !user.emailVerified) {
    return { redirect: null, needsVerification: true };
  }
  if (user.onboardingStatus !== 'complete' || !user.productUserId) {
    user.onboardingStatus = 'provisioning';
    await user.save();
    try {
      await provisionProduct(user);
    } catch (err) {
      user.onboardingStatus = 'awaiting_choice';
      await user.save();
      throw err;
    }
  }
  const redirect = await issueSsoRedirect(user);
  return { redirect, needsVerification: false };
}

async function sessionPayload(user) {
  const token = signAccessToken(user);
  let redirect = null;
  if (user.provider === 'local' && !user.emailVerified) {
    return {
      success: true,
      token,
      user: publicUser(user),
      nextPath: '/login',
      redirect: null,
      needsVerification: true,
    };
  }
  try {
    const ensured = await ensureProvisionedAndRedirect(user);
    redirect = ensured.redirect;
  } catch (err) {
    console.error('[gateway session provision]', err);
    return {
      success: false,
      token,
      user: publicUser(user),
      nextPath: null,
      redirect: null,
      message: err.message || 'Could not launch your workspace',
    };
  }
  return {
    success: true,
    token,
    user: publicUser(user),
    nextPath: nextWizardPath(user),
    redirect,
  };
}

async function register(req, res) {
  try {
    const name = String(req.body.name || '').trim();
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || '');
    const phone = normalizePhone(req.body.phone);

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ success: false, message: 'Name, email, phone and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }
    if (phone.replace(/\D/g, '').length < 8) {
      return res.status(400).json({ success: false, message: 'Enter a valid phone number' });
    }

    const existing = await PlatformUser.findOne({ email });
    if (existing) {
      if (existing.emailVerified) {
        return res.status(400).json({ success: false, message: 'User already exists' });
      }
      // Allow re-register of unverified accounts: refresh details + resend OTP.
      existing.name = name;
      existing.phone = phone;
      existing.hashedPassword = await bcrypt.hash(password, 10);
      existing.provider = 'local';
      await existing.save();
      const issued = await issueEmailOtp(existing);
      return res.status(200).json({
        success: true,
        needsVerification: true,
        email: existing.email,
        ...otpClientFields(issued),
        message: issued?.sent
          ? 'Check your email for a verification code'
          : 'Verification code generated, but email could not be sent. Use the on-screen code (dev) or fix SMTP.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await PlatformUser.create({
      name,
      email,
      phone,
      hashedPassword,
      provider: 'local',
      emailVerified: false,
      onboardingStatus: 'awaiting_choice',
    });

    const issued = await issueEmailOtp(user);

    return res.status(201).json({
      success: true,
      needsVerification: true,
      email: user.email,
      ...otpClientFields(issued),
      message: issued?.sent
        ? 'Check your email for a verification code'
        : 'Verification code generated, but email could not be sent. Use the on-screen code (dev) or fix SMTP.',
    });
  } catch (err) {
    console.error('[gateway register]', err);
    return res.status(500).json({ success: false, message: err.message || 'Registration failed' });
  }
}

async function verifyEmailOtpHandler(req, res) {
  try {
    const email = normalizeEmail(req.body.email);
    const code = String(req.body.code || '').trim();
    if (!email || !code) {
      return res.status(400).json({ success: false, message: 'Email and verification code are required' });
    }
    const user = await PlatformUser.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Account not found' });
    }
    if (user.emailVerified) {
      return res.json({ success: true, message: 'Email already verified', email: user.email });
    }
    if (!verifyEmailOtp(user, code)) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification code' });
    }
    user.emailVerified = true;
    user.emailOtpHash = '';
    user.emailOtpExpire = undefined;
    await user.save();
    return res.json({
      success: true,
      message: 'Account verified. Please log in.',
      email: user.email,
    });
  } catch (err) {
    console.error('[gateway verify-email-otp]', err);
    return res.status(500).json({ success: false, message: err.message || 'Verification failed' });
  }
}

async function resendEmailOtp(req, res) {
  try {
    const email = normalizeEmail(req.body.email);
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }
    const user = await PlatformUser.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Account not found' });
    }
    if (user.emailVerified) {
      return res.json({ success: true, message: 'Email already verified' });
    }
    const issued = await issueEmailOtp(user);
    return res.json({
      success: true,
      ...otpClientFields(issued),
      message: issued?.sent
        ? 'Verification code resent'
        : 'Could not send email. Use the on-screen code (dev) or fix SMTP on the gateway server.',
    });
  } catch (err) {
    console.error('[gateway resend-email-otp]', err);
    return res.status(500).json({ success: false, message: err.message || 'Could not resend code' });
  }
}

async function login(req, res) {
  try {
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || '');
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await PlatformUser.findOne({ email });
    if (!user || !user.hashedPassword) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }
    const ok = await bcrypt.compare(password, user.hashedPassword);
    if (!ok) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.emailVerified) {
      const issued = await issueEmailOtp(user);
      return res.status(403).json({
        success: false,
        needsVerification: true,
        email: user.email,
        ...otpClientFields(issued),
        message: issued?.sent
          ? 'Verify your email before logging in. We sent a new code.'
          : 'Verify your email before logging in. Email send failed — use the on-screen code (dev) or fix SMTP.',
      });
    }

    const payload = await sessionPayload(user);
    if (!payload.success) {
      return res.status(502).json(payload);
    }
    return res.status(200).json(payload);
  } catch (err) {
    console.error('[gateway login]', err);
    return res.status(500).json({ success: false, message: err.message || 'Login failed' });
  }
}

async function googleLogin(req, res) {
  try {
    const credential = String(req.body.credential || '');
    if (!credential) {
      return res.status(400).json({ success: false, message: 'Google credential is required' });
    }
    if (!config.googleClientId) {
      return res.status(500).json({ success: false, message: 'GOOGLE_CLIENT_ID is not configured' });
    }

    const client = new OAuth2Client(config.googleClientId);
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: config.googleClientId,
    });
    const payload = ticket.getPayload();
    if (!payload?.email) {
      return res.status(400).json({ success: false, message: 'Google account email is required' });
    }

    const email = normalizeEmail(payload.email);
    let user = await PlatformUser.findOne({ email });
    if (!user) {
      user = await PlatformUser.create({
        name: payload.name || email.split('@')[0] || 'User',
        email,
        provider: 'google',
        googleId: payload.sub || '',
        emailVerified: true,
        onboardingStatus: 'awaiting_choice',
      });
    } else {
      user.provider = 'google';
      user.googleId = payload.sub || user.googleId;
      user.emailVerified = true;
      await user.save();
    }

    const session = await sessionPayload(user);
    if (!session.success) {
      return res.status(502).json(session);
    }
    return res.status(200).json(session);
  } catch (err) {
    console.error('[gateway google]', err);
    return res.status(400).json({ success: false, message: err.message || 'Google sign-in failed' });
  }
}

async function me(req, res) {
  try {
    const user = req.platformUser;
    if (user.provider === 'local' && !user.emailVerified) {
      return res.json({
        success: true,
        user: publicUser(user),
        nextPath: '/login',
        redirect: null,
        needsVerification: true,
      });
    }
    const session = await sessionPayload(user);
    if (!session.success) {
      return res.status(502).json(session);
    }
    return res.json(session);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to load session' });
  }
}

function googleConfig(_req, res) {
  res.json({
    success: true,
    enabled: Boolean(config.googleClientId),
    clientId: config.googleClientId || '',
  });
}

module.exports = {
  register,
  login,
  googleLogin,
  me,
  googleConfig,
  verifyEmailOtpHandler,
  resendEmailOtp,
};
