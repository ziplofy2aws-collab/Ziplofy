const User = require('../models/User');
const Workspace = require('../models/Workspace');
const Plan = require('../models/Plan');
const generateToken = require('../utils/generateToken');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { sendTemplateEmail, sendRawEmail, isTemplateEnabled } = require('../services/systemMailer');

const getAppUrl = async (req) => {
  const SystemSettings = require('../models/SystemSettings');
  const settings = await SystemSettings.findOne().lean();
  if (settings?.appUrl) return settings.appUrl.replace(/\/$/, '');
  // White-label: build links to the panel's OWN domain (from the request) instead
  // of a hardcoded wabapanel default, so reset/verify links open the right install.
  try {
    if (req && req.get) {
      const origin = req.get('origin');
      if (origin) return origin.replace(/\/$/, '');
      const host = req.get('host');
      if (host) {
        const proto = req.get('x-forwarded-proto') || req.protocol || 'https';
        return `${proto}://${host}`.replace(/\/$/, '');
      }
    }
  } catch { /* fall through to env default */ }
  return (process.env.FRONTEND_URL || 'https://app.wabapanel.com').replace(/\/$/, '');
};

const JWT_SECRET = () => process.env.JWT_SECRET || 'default_jwt_secret';

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

async function resolveGoogleClientId() {
  const SystemSettings = require('../models/SystemSettings');
  const settings = await SystemSettings.findOne().lean();
  const fromSettings = settings?.google?.clientId?.trim() || '';
  const fromEnv = String(process.env.GOOGLE_CLIENT_ID || '').trim();
  const enabled = settings?.google?.enabled === true || (!!fromEnv && settings?.google?.enabled !== false);
  const clientId = fromSettings || fromEnv;
  return { enabled: !!(enabled && clientId), clientId };
}

async function verifyGoogleCredential(credential, clientId) {
  const client = new OAuth2Client(clientId);
  const ticket = await client.verifyIdToken({ idToken: credential, audience: clientId });
  const payload = ticket.getPayload();
  if (!payload?.email) {
    const err = new Error('Google account email is required');
    err.status = 400;
    throw err;
  }
  if (payload.email_verified === false) {
    const err = new Error('Google email is not verified');
    err.status = 400;
    throw err;
  }
  return payload;
}

async function issueSessionForUser(user, req) {
  if (user.twoFactorEnabled) {
    if (user.twoFactorMethod === 'email') await issueEmailOTP(user);
    return {
      success: true,
      requires2FA: true,
      method: user.twoFactorMethod || 'app',
      challengeToken: generateChallengeToken(user._id),
      message: user.twoFactorMethod === 'email'
        ? 'Verification code sent to your email'
        : 'Enter the code from your authenticator app',
    };
  }

  user.lastLogin = new Date();
  await user.save();

  try {
    const memberWs = await Workspace.find({ 'members.user': user._id, owner: { $ne: user._id } }).select('_id').limit(3);
    const ownerNotify = require('../services/ownerNotify');
    for (const w of memberWs) ownerNotify.agentLogin(w._id, user).catch(() => {});
  } catch (e) { /* noop */ }

  try {
    const ip = req.headers['x-forwarded-for'] || req.connection?.remoteAddress || '';
    const ownerWs = await Workspace.find({ owner: user._id }).select('_id').limit(5);
    const ownerNotify = require('../services/ownerNotify');
    for (const w of ownerWs) ownerNotify.newDeviceLogin(w._id, user, ip).catch(() => {});
  } catch (_e) { /* noop */ }

  const data = await buildLoginResponse(user);
  data.user.permissions = user.permissions || [];
  data.user.allowedChannels = user.allowedChannels || [];
  data.user.inboxScope = user.inboxScope || 'all';
  return { success: true, data };
}

// Short-lived token that only proves password step passed; used for the 2FA challenge.
const generateChallengeToken = (userId) =>
  jwt.sign({ id: userId, twofa: true }, JWT_SECRET(), { expiresIn: '10m' });

// Generates a 6-digit OTP, stores it hashed on the user, and emails it.
const issueEmailOTP = async (user) => {
  const code = ('' + Math.floor(100000 + Math.random() * 900000));
  user.twoFactorEmailOTP = crypto.createHash('sha256').update(code).digest('hex');
  user.twoFactorEmailExpire = Date.now() + 10 * 60 * 1000;
  await user.save();
  const SystemSettings = require('../models/SystemSettings');
  const settings = await SystemSettings.findOne().lean();
  const appName = settings?.appName || 'Codiic Panel';
  await sendRawEmail(
    user.email,
    `${appName} verification code: ${code}`,
    `<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto">
      <h2>Your verification code</h2>
      <p>Hi ${user.name || ''}, use this code to complete your sign in:</p>
      <p style="font-size:28px;font-weight:bold;letter-spacing:6px;color:#7c3aed">${code}</p>
      <p style="color:#888">This code expires in 10 minutes. If you didn't request it, ignore this email.</p>
    </div>`
  ).catch((e) => console.error('[2FA Email] Send failed:', e.message));
  return code;
};

const verifyEmailOTP = (user, code) => {
  if (!user.twoFactorEmailOTP || !user.twoFactorEmailExpire) return false;
  if (Date.now() > new Date(user.twoFactorEmailExpire).getTime()) return false;
  const hashed = crypto.createHash('sha256').update(String(code || '')).digest('hex');
  return hashed === user.twoFactorEmailOTP;
};

// Builds the full authenticated login payload (token + user + workspaces).
const buildLoginResponse = async (user) => {
  const token = generateToken(user._id);
  await user.populate('currentWorkspace');
  await user.populate('plan');
  const workspaces = await Workspace.find({
    $or: [{ owner: user._id }, { 'members.user': user._id }],
  });
  return {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      role: user.role,
      currentWorkspace: user.currentWorkspace,
      plan: user.plan,
      walletBalance: user.walletBalance,
    },
    workspaces,
    token,
  };
};

// @POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, password, phone } = req.body;
    const email = normalizeEmail(req.body.email);

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email and password' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Get free plan
    let freePlan = await Plan.findOne({ price: 0, status: 'active' });

    const verificationRequired = await isTemplateEnabled('emailVerification');
    const rawVerifyToken = crypto.randomBytes(20).toString('hex');

    const user = await User.create({
      name,
      email,
      password,
      phone: phone || '',
      role: 'vendor',
      plan: freePlan?._id,
      walletBillingExempt: true,
      emailVerified: !verificationRequired,
      ...(verificationRequired ? {
        emailVerifyToken: crypto.createHash('sha256').update(rawVerifyToken).digest('hex'),
        emailVerifyExpire: Date.now() + 24 * 3600000,
      } : {}),
    });

    require('../services/adminNotify').notifyAdmin('New user signup', ['Name: ' + user.name, 'Email: ' + user.email], '/admin/vendors').catch(() => {});

    // Create default workspace
    const workspace = await Workspace.create({
      name: name,
      owner: user._id,
      members: [{ user: user._id, role: 'owner' }],
    });

    user.currentWorkspace = workspace._id;
    await user.save();

    // Default Informatic / webpanel store + subdomain (separate from Codiic stores)
    try {
      const { createDefaultStoreForNewUser } = require('../utils/webpanelStoreBootstrap');
      await createDefaultStoreForNewUser(user, workspace);
    } catch (storeErr) {
      console.error('[register] Failed to create default webpanel store:', storeErr?.message || storeErr);
    }

    if (verificationRequired) {
      const appUrl = await getAppUrl(req);
      sendTemplateEmail('emailVerification', user.email, {
        userName: user.name,
        verifyLink: `${appUrl}/auth/verify-email?token=${rawVerifyToken}`,
      }).catch((e) => console.error('[Email Verification] Send failed:', e.message));
      return res.status(201).json({
        success: true,
        requiresVerification: true,
        message: 'Account created. Please check your email to verify your account before logging in.',
      });
    }

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          currentWorkspace: workspace,
          plan: freePlan,
        },
        workspace,
        workspaces: [workspace],
        token,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @POST /api/auth/login
const login = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const { password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email })
      .populate('currentWorkspace')
      .populate('plan');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ success: false, message: 'Account is suspended' });
    }

    if (user.emailVerified === false && (await isTemplateEnabled('emailVerification'))) {
      return res.status(403).json({ success: false, code: 'EMAIL_NOT_VERIFIED', message: 'Please verify your email address before logging in. Check your inbox for the verification link.' });
    }

    // Two-factor challenge: password OK but require a second step.
    if (user.twoFactorEnabled) {
      if (user.twoFactorMethod === 'email') await issueEmailOTP(user);
      return res.json({
        success: true,
        requires2FA: true,
        method: user.twoFactorMethod || 'app',
        challengeToken: generateChallengeToken(user._id),
        message: user.twoFactorMethod === 'email'
          ? 'Verification code sent to your email'
          : 'Enter the code from your authenticator app',
      });
    }

    user.lastLogin = new Date();
    await user.save();

    try {
      const memberWs = await Workspace.find({ 'members.user': user._id, owner: { $ne: user._id } }).select('_id').limit(3);
      const ownerNotify = require('../services/ownerNotify');
      for (const w of memberWs) ownerNotify.agentLogin(w._id, user).catch(() => {});
    } catch (e) { /* noop */ }

    const token = generateToken(user._id);

    // New device login alert for workspace owners
    try {
      const ip = req.headers['x-forwarded-for'] || req.connection?.remoteAddress || '';
      const ownerWs = await Workspace.find({ owner: user._id }).select('_id').limit(5);
      const ownerNotify = require('../services/ownerNotify');
      for (const w of ownerWs) ownerNotify.newDeviceLogin(w._id, user, ip).catch(() => {});
    } catch (_e) { /* noop */ }

    // Get user workspaces
    const workspaces = await Workspace.find({
      $or: [
        { owner: user._id },
        { 'members.user': user._id },
      ],
    });

    res.json({
      success: true,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar,
          role: user.role,
          currentWorkspace: user.currentWorkspace,
          plan: user.plan,
          walletBalance: user.walletBalance,
          permissions: user.permissions || [],
          allowedChannels: user.allowedChannels || [],
          inboxScope: user.inboxScope || 'all',
        },
        workspaces,
        token,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @POST /api/auth/google
const googleLogin = async (req, res) => {
  try {
    const credential = String(req.body?.credential || '').trim();
    if (!credential) {
      return res.status(400).json({ success: false, message: 'Google credential is required' });
    }

    const { enabled, clientId } = await resolveGoogleClientId();
    if (!enabled || !clientId) {
      return res.status(503).json({ success: false, message: 'Google sign-in is not configured' });
    }

    let payload;
    try {
      payload = await verifyGoogleCredential(credential, clientId);
    } catch (verifyErr) {
      const status = verifyErr.status || 401;
      return res.status(status).json({
        success: false,
        message: verifyErr.message || 'Invalid Google token',
      });
    }

    const email = normalizeEmail(payload.email);
    const googleId = String(payload.sub || '');
    const name = String(payload.name || email.split('@')[0] || 'User').trim();
    const avatar = String(payload.picture || '');

    let user = null;
    if (googleId) user = await User.findOne({ googleId });
    if (!user) user = await User.findOne({ email });

    let isNewUser = false;

    if (!user) {
      let freePlan = await Plan.findOne({ price: 0, status: 'active' });
      user = await User.create({
        name,
        email,
        password: crypto.randomBytes(32).toString('hex'),
        avatar,
        role: 'vendor',
        plan: freePlan?._id,
        walletBillingExempt: true,
        emailVerified: true,
        authProvider: 'google',
        googleId,
      });

      require('../services/adminNotify')
        .notifyAdmin('New user signup (Google)', ['Name: ' + user.name, 'Email: ' + user.email], '/admin/vendors')
        .catch(() => {});

      const workspace = await Workspace.create({
        name,
        owner: user._id,
        members: [{ user: user._id, role: 'owner' }],
      });
      user.currentWorkspace = workspace._id;
      await user.save();

      try {
        const { createDefaultStoreForNewUser } = require('../utils/webpanelStoreBootstrap');
        await createDefaultStoreForNewUser(user, workspace);
      } catch (storeErr) {
        console.error('[googleLogin] Failed to create default webpanel store:', storeErr?.message || storeErr);
      }

      isNewUser = true;
    } else {
      if (user.status !== 'active') {
        return res.status(403).json({ success: false, message: 'Account is suspended' });
      }
      let dirty = false;
      if (googleId && user.googleId !== googleId) {
        user.googleId = googleId;
        dirty = true;
      }
      if (user.authProvider !== 'google' && !user.password) {
        user.authProvider = 'google';
        dirty = true;
      } else if (!user.authProvider) {
        user.authProvider = user.googleId ? 'google' : 'local';
        dirty = true;
      }
      if (avatar && !user.avatar) {
        user.avatar = avatar;
        dirty = true;
      }
      if (user.emailVerified === false) {
        user.emailVerified = true;
        dirty = true;
      }
      if (dirty) await user.save();
    }

    const result = await issueSessionForUser(user, req);
    if (result.requires2FA) return res.json(result);
    return res.json({ ...result, isNewUser });
  } catch (error) {
    console.error('[googleLogin]', error);
    res.status(500).json({ success: false, message: error.message || 'Google sign-in failed' });
  }
};

// @GET /api/auth/google/config — public client id for GIS button
const googleAuthConfig = async (req, res) => {
  try {
    const { enabled, clientId } = await resolveGoogleClientId();
    res.json({
      success: true,
      data: {
        enabled: !!(enabled && clientId),
        clientId: enabled && clientId ? clientId : '',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @POST /api/auth/admin/login
const adminLogin = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const { password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email, role: { $in: ['admin', 'super_admin', 'vendor'] } });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ success: false, message: 'Account is suspended' });
    }

    if (user.twoFactorEnabled) {
      if (user.twoFactorMethod === 'email') await issueEmailOTP(user);
      return res.json({
        success: true,
        requires2FA: true,
        method: user.twoFactorMethod || 'app',
        challengeToken: generateChallengeToken(user._id),
        message: user.twoFactorMethod === 'email'
          ? 'Verification code sent to your email'
          : 'Enter the code from your authenticator app',
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    res.json({
      success: true,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @POST /api/auth/2fa/login-verify  (public — completes login after password step)
const loginVerify2FA = async (req, res) => {
  try {
    const { challengeToken, code } = req.body;
    if (!challengeToken || !code) {
      return res.status(400).json({ success: false, message: 'Code is required' });
    }
    let decoded;
    try {
      decoded = jwt.verify(challengeToken, JWT_SECRET());
    } catch {
      return res.status(401).json({ success: false, message: 'Session expired, please login again' });
    }
    if (!decoded.twofa) {
      return res.status(401).json({ success: false, message: 'Invalid verification session' });
    }
    const user = await User.findById(decoded.id);
    if (!user || !user.twoFactorEnabled) {
      return res.status(401).json({ success: false, message: 'Invalid verification session' });
    }

    let ok = false;
    if (user.twoFactorMethod === 'email') {
      ok = verifyEmailOTP(user, code);
    } else {
      const speakeasy = require('speakeasy');
      ok = speakeasy.totp.verify({ secret: user.twoFactorSecret, encoding: 'base32', token: String(code), window: 1 });
    }
    if (!ok) {
      return res.status(400).json({ success: false, message: 'Invalid or expired code' });
    }

    user.twoFactorEmailOTP = '';
    user.twoFactorEmailExpire = undefined;
    user.lastLogin = new Date();
    await user.save();

    const data = await buildLoginResponse(user);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @POST /api/auth/2fa/login-resend  (public — resend email OTP during login)
const resendLoginOTP = async (req, res) => {
  try {
    const { challengeToken } = req.body;
    let decoded;
    try {
      decoded = jwt.verify(challengeToken, JWT_SECRET());
    } catch {
      return res.status(401).json({ success: false, message: 'Session expired, please login again' });
    }
    const user = await User.findById(decoded.id);
    if (!user || !user.twoFactorEnabled || user.twoFactorMethod !== 'email') {
      return res.status(400).json({ success: false, message: 'Cannot resend code' });
    }
    await issueEmailOTP(user);
    res.json({ success: true, message: 'Verification code sent to your email' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('currentWorkspace')
      .populate('plan');

    const workspaces = await Workspace.find({
      $or: [
        { owner: user._id },
        { 'members.user': user._id },
      ],
    });

    // Effective feature map (agents inherit the workspace owner's overrides)
    let features = {};
    try {
      const { getOwnerFeatures } = require('../middleware/featureGate');
      const ownerId = user.currentWorkspace?.owner || user._id;
      features = await getOwnerFeatures(ownerId);
    } catch (e) { /* noop */ }

    // Agents bill against the workspace owner's wallet, so the balance shown in
    // the header should be the owner's, not the agent's own (always 0).
    const userObj = user.toObject();
    try {
      const ownerId = user.currentWorkspace?.owner;
      if (user.role === 'agent' && ownerId && String(ownerId) !== String(user._id)) {
        const owner = await User.findById(ownerId).select('walletBalance').lean();
        if (owner) userObj.walletBalance = owner.walletBalance || 0;
      }
    } catch (e) { /* fall back to own balance */ }

    res.json({
      success: true,
      data: { user: userObj, workspaces, features },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const { name, phone, avatar, email } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (avatar !== undefined) user.avatar = avatar;

    if (email && email.toLowerCase() !== user.email) {
      const normalized = email.toLowerCase().trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
        return res.status(400).json({ success: false, message: 'Please enter a valid email' });
      }
      const exists = await User.findOne({ email: normalized, _id: { $ne: user._id } });
      if (exists) {
        return res.status(400).json({ success: false, message: 'This email is already in use' });
      }
      user.email = normalized;
    }

    await user.save();

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @PUT /api/auth/change-password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!(await user.matchPassword(currentPassword))) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'No user with that email' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 3600000; // 1 hour
    await user.save();

    const appUrl = await getAppUrl(req);
    const sent = await sendTemplateEmail('passwordReset', user.email, {
      userName: user.name,
      resetLink: `${appUrl}/auth/reset-password?token=${resetToken}`,
    }).catch((e) => { console.error('[Password Reset] Send failed:', e.message); return false; });
    if (!sent) {
      return res.status(500).json({ success: false, message: 'Could not send reset email. Please contact support.' });
    }
    res.json({ success: true, message: 'Password reset email sent' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @PUT /api/auth/reset-password/:token
const resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @POST /api/auth/reset-password (token in body)
const resetPasswordFromBody = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ success: false, message: 'Token and password are required' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @POST /api/auth/verify-email
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ success: false, message: 'Token is required' });
    const hashed = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({ emailVerifyToken: hashed });
    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired verification link' });
    if (!user.emailVerified) {
      if (user.emailVerifyExpire && user.emailVerifyExpire < Date.now()) {
        return res.status(400).json({ success: false, message: 'Invalid or expired verification link' });
      }
      user.emailVerified = true;
      await user.save();
    }
    res.json({ success: true, message: 'Email verified successfully. You can now log in.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @POST /api/auth/resend-verification
const resendVerification = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const user = await User.findOne({ email });
    if (!user || user.emailVerified !== false) {
      return res.json({ success: true, message: 'If the account needs verification, a new email has been sent.' });
    }
    const rawToken = crypto.randomBytes(20).toString('hex');
    user.emailVerifyToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    user.emailVerifyExpire = Date.now() + 24 * 3600000;
    await user.save();
    const appUrl = await getAppUrl(req);
    await sendTemplateEmail('emailVerification', user.email, {
      userName: user.name,
      verifyLink: `${appUrl}/auth/verify-email?token=${rawToken}`,
    });
    res.json({ success: true, message: 'Verification email sent. Please check your inbox.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @GET /api/auth/2fa/status
const get2FAStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('twoFactorEnabled twoFactorMethod email');
    res.json({ success: true, data: { enabled: !!user.twoFactorEnabled, method: user.twoFactorMethod || 'app', email: user.email } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @POST /api/auth/2fa/setup  { method: 'app' | 'email' }
const setup2FA = async (req, res) => {
  try {
    const method = req.body.method === 'email' ? 'email' : 'app';
    const user = await User.findById(req.user._id);
    user.twoFactorMethod = method;

    if (method === 'email') {
      await issueEmailOTP(user);
      return res.json({ success: true, data: { method: 'email', email: user.email } });
    }

    const speakeasy = require('speakeasy');
    const QRCode = require('qrcode');
    const secret = speakeasy.generateSecret({ name: 'Codiic Panel (' + user.email + ')', length: 20 });
    user.twoFactorSecret = secret.base32;
    await user.save();
    const qr = await QRCode.toDataURL(secret.otpauth_url);
    res.json({ success: true, data: { method: 'app', secret: secret.base32, qrCode: qr } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @POST /api/auth/2fa/verify  { code }  — confirms setup and enables 2FA
const verify2FA = async (req, res) => {
  try {
    const code = req.body.code || req.body.token;
    const user = await User.findById(req.user._id);

    let ok = false;
    if (user.twoFactorMethod === 'email') {
      ok = verifyEmailOTP(user, code);
    } else {
      const speakeasy = require('speakeasy');
      ok = speakeasy.totp.verify({ secret: user.twoFactorSecret, encoding: 'base32', token: String(code || ''), window: 1 });
    }
    if (!ok) return res.status(400).json({ success: false, message: 'Invalid or expired code' });

    user.twoFactorEnabled = true;
    user.twoFactorEmailOTP = '';
    user.twoFactorEmailExpire = undefined;
    await user.save();
    res.json({ success: true, message: '2FA enabled', data: { method: user.twoFactorMethod } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @POST /api/auth/2fa/resend  — resend email OTP while setting up (logged in)
const resendSetupOTP = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.twoFactorMethod !== 'email') return res.status(400).json({ success: false, message: 'Not an email 2FA setup' });
    await issueEmailOTP(user);
    res.json({ success: true, message: 'Code sent to your email' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @POST /api/auth/2fa/disable  { password }
const disable2FA = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (req.body.password && !(await user.matchPassword(req.body.password))) {
      return res.status(400).json({ success: false, message: 'Password is incorrect' });
    }
    user.twoFactorEnabled = false;
    user.twoFactorSecret = '';
    user.twoFactorEmailOTP = '';
    user.twoFactorEmailExpire = undefined;
    await user.save();
    res.json({ success: true, message: '2FA disabled' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @PUT /api/auth/switch-workspace/:workspaceId
const switchWorkspace = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.workspaceId);

    if (!workspace) {
      return res.status(404).json({ success: false, message: 'Workspace not found' });
    }

    const isOwner = workspace.owner.toString() === req.user._id.toString();
    const isMember = workspace.members.some(m => m.user.toString() === req.user._id.toString());

    if (!isOwner && !isMember) {
      return res.status(403).json({ success: false, message: 'Not a member of this workspace' });
    }

    await User.findByIdAndUpdate(req.user._id, { currentWorkspace: workspace._id });

    res.json({ success: true, data: workspace });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  register, login, googleLogin, googleAuthConfig, adminLogin, getMe, updateProfile,
  changePassword, forgotPassword, resetPassword, resetPasswordFromBody, switchWorkspace,
  verifyEmail, resendVerification,
  loginVerify2FA, resendLoginOTP,
  get2FAStatus, setup2FA, verify2FA, resendSetupOTP, disable2FA,
};
