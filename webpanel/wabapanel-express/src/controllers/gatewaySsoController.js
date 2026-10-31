const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Workspace = require('../models/Workspace');
const Plan = require('../models/Plan');
const WebpanelStore = require('../models/WebpanelStore');
const GatewayConsumedTicket = require('../models/GatewayConsumedTicket');
const generateToken = require('../utils/generateToken');
const { assertGatewaySignature, gatewaySecret } = require('../utils/gatewayHmac');
const { normalizeSelectedModules, defaultLaunchModules, featureOverridesForModules, launchPathFor, INDUSTRY_MODULE, MODULES } = require('../utils/gatewayModules');
const { createWebpanelStoreWithSubdomain } = require('../utils/webpanelStoreBootstrap');

function padDescription(name) {
  const text = `Website for ${name}. Customize themes and content anytime.`;
  return text.length >= 10 ? text.slice(0, 500) : `${name} website.`.slice(0, 500);
}

async function ensureWorkspace(user, businessName) {
  if (user.currentWorkspace) {
    const existing = await Workspace.findById(user.currentWorkspace);
    if (existing) return existing;
  }
  const workspace = await Workspace.create({
    name: businessName || user.name,
    owner: user._id,
    members: [{ user: user._id, role: 'owner' }],
  });
  user.currentWorkspace = workspace._id;
  await user.save();
  return workspace;
}

async function provisionVendor(req, res) {
  try {
    assertGatewaySignature(req);
    const email = String(req.body.email || '').trim().toLowerCase();
    const name = String(req.body.name || '').trim() || email.split('@')[0] || 'User';
    const businessName = String(req.body.businessName || '').trim();
    const selectedService = String(req.body.selectedService || '');
    const industry = String(req.body.industry || '');
    const industryKind = String(req.body.industryKind || '');
    if (!email || !businessName) {
      return res.status(400).json({ success: false, message: 'email and businessName are required' });
    }

    const sectorMod = MODULES.find((m) => m.id === INDUSTRY_MODULE[industry]);
    const enableClinic = industry === 'healthcare';
    const selectedModules = normalizeSelectedModules(
      industry,
      Array.isArray(req.body.selectedModules) && req.body.selectedModules.length
        ? req.body.selectedModules
        : defaultLaunchModules(industry)
    );
    const wantsWebsite = true;
    let freePlan = await Plan.findOne({ price: 0, status: 'active' });
    let user = await User.findOne({ email });

    const baseOverrides = featureOverridesForModules(selectedModules, industry);
    if (sectorMod) for (const key of sectorMod.keys) baseOverrides[key] = true;

    if (!user) {
      user = await User.create({
        name,
        email,
        authProvider: 'gateway',
        role: 'vendor',
        plan: freePlan?._id,
        walletBillingExempt: true,
        emailVerified: true,
        companyName: businessName,
        featureOverrides: baseOverrides,
      });
    } else {
      if (!user.companyName) user.companyName = businessName;
      user.featureOverrides = baseOverrides;
      user.markModified('featureOverrides');
      await user.save();
    }

    const workspace = await ensureWorkspace(user, businessName);
    let store = await WebpanelStore.findOne({ userId: user._id });
    if (wantsWebsite && !store) {
      const created = await createWebpanelStoreWithSubdomain({
        userId: user._id,
        workspaceId: workspace._id,
        storeName: businessName.slice(0, 100),
        storeDescription: padDescription(businessName),
        industry,
        industryKind: industryKind === 'service' || industryKind === 'ecommerce' ? industryKind : '',
      });
      store = created.store;
    } else if (wantsWebsite && store && industry && !store.industry) {
      store.industry = industry;
      store.industryKind = industryKind === 'service' || industryKind === 'ecommerce' ? industryKind : '';
      await store.save();
    }

    if (enableClinic && workspace?._id) {
      try {
        const bookingService = require('../services/bookingService');
        const s = await bookingService.getSettings(workspace._id);
        s.enabled = true;
        if (!s.title || s.title === 'Book an Appointment') s.title = 'Book a consultation';
        await s.save();
      } catch { /* public booking page is optional */ }
    }

    return res.json({
      success: true,
      productUserId: user._id.toString(),
      productWorkspaceId: workspace?._id?.toString() || '',
      productStoreId: store?._id?.toString() || '',
      launchPath: launchPathFor({ industry, selectedModules }),
    });
  } catch (err) {
    const status = err.status || 500;
    console.error('[gateway provision-vendor]', err);
    return res.status(status).json({ success: false, message: err.message || 'Provision failed' });
  }
}

async function buildWebpanelSsoPayload(productUserId, launchPath) {
  const user = await User.findById(productUserId);
  if (!user) return null;

  user.lastLogin = new Date();
  await user.save();

  const token = generateToken(user._id);
  await user.populate('currentWorkspace');
  await user.populate('plan');
  const workspaces = await Workspace.find({
    $or: [{ owner: user._id }, { 'members.user': user._id }],
  });

  let features = {};
  try {
    const { getOwnerFeatures } = require('../middleware/featureGate');
    const ownerId = user.currentWorkspace?.owner || user._id;
    features = await getOwnerFeatures(ownerId);
  } catch { /* noop */ }

  return {
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      role: user.role,
      staffType: user.staffType || '',
      permissions: user.permissions || [],
      currentWorkspace: user.currentWorkspace,
      plan: user.plan,
      walletBalance: user.walletBalance,
      featureOverrides: {
        selectedModules: Array.isArray(user.featureOverrides?.selectedModules)
          ? user.featureOverrides.selectedModules
          : undefined,
        industry: user.featureOverrides?.industry,
      },
    },
    workspaces,
    features,
    launchPath: launchPath || '/client/dashboard',
  };
}

async function exchangeGatewaySso(req, res) {
  try {
    const ticket = String(req.body.ticket || '');
    if (!ticket) return res.status(400).json({ success: false, message: 'ticket is required' });
    const secret = gatewaySecret();
    if (!secret) return res.status(500).json({ success: false, message: 'GATEWAY_SSO_SECRET is not configured' });

    let decoded;
    try {
      decoded = jwt.verify(ticket, secret);
    } catch {
      return res.status(401).json({ success: false, message: 'Invalid or expired ticket' });
    }

    if (decoded.typ !== 'gateway-sso' || decoded.dest !== 'webpanel' || !decoded.jti || !decoded.productUserId) {
      return res.status(401).json({ success: false, message: 'Invalid ticket' });
    }

    try {
      await GatewayConsumedTicket.create({
        jti: decoded.jti,
        productUserId: decoded.productUserId,
      });
    } catch (err) {
      if (!(err && err.code === 11000)) throw err;
      // React Strict Mode / double navigation can redeem the same fresh ticket twice.
      // While the JWT is still valid, sign the same user in again instead of failing.
    }

    const payload = await buildWebpanelSsoPayload(decoded.productUserId, decoded.launchPath);
    if (!payload) return res.status(404).json({ success: false, message: 'User not found' });
    return res.json({ success: true, data: payload });
  } catch (err) {
    console.error('[gateway sso exchange]', err);
    return res.status(500).json({ success: false, message: err.message || 'SSO failed' });
  }
}

module.exports = { provisionVendor, exchangeGatewaySso };
