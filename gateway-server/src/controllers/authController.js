const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
const config = require('../config');
const PlatformUser = require('../models/PlatformUser');
const { signAccessToken } = require('../utils/jwt');
const { publicUser, nextWizardPath } = require('../utils/userView');
const { issueSsoRedirect } = require('../utils/provision');

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

async function sessionPayload(user) {
  const token = signAccessToken(user);
  let redirect = null;
  if (user.onboardingStatus === 'complete') {
    redirect = await issueSsoRedirect(user);
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

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const existing = await PlatformUser.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await PlatformUser.create({
      name,
      email,
      hashedPassword,
      provider: 'local',
      onboardingStatus: 'awaiting_choice',
    });

    return res.status(201).json(await sessionPayload(user));
  } catch (err) {
    console.error('[gateway register]', err);
    return res.status(500).json({ success: false, message: err.message || 'Registration failed' });
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

    return res.status(200).json(await sessionPayload(user));
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
        onboardingStatus: 'awaiting_choice',
      });
    } else if (user.provider !== 'google') {
      user.provider = 'google';
      user.googleId = payload.sub || user.googleId;
      await user.save();
    }

    return res.status(200).json(await sessionPayload(user));
  } catch (err) {
    console.error('[gateway google]', err);
    return res.status(400).json({ success: false, message: err.message || 'Google sign-in failed' });
  }
}

async function me(req, res) {
  try {
    let redirect = null;
    if (req.platformUser.onboardingStatus === 'complete') {
      redirect = await issueSsoRedirect(req.platformUser);
    }
    return res.json({
      success: true,
      user: publicUser(req.platformUser),
      nextPath: nextWizardPath(req.platformUser),
      redirect,
    });
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

module.exports = { register, login, googleLogin, me, googleConfig };
