const PlatformUser = require('../models/PlatformUser');
const { verifyCanonical } = require('../utils/hmac');
const config = require('../config');

function assertInternalSignature(req) {
  const timestamp = String(req.headers['x-gateway-timestamp'] || '');
  const signature = String(req.headers['x-gateway-signature'] || '');
  const value = Number(timestamp);
  if (!Number.isFinite(value) || Math.abs(Date.now() - value) > 5 * 60 * 1000) {
    const err = new Error('Invalid gateway timestamp');
    err.status = 401;
    throw err;
  }
  if (!verifyCanonical(config.ssoSecret, timestamp, req.body || {}, signature)) {
    const err = new Error('Invalid gateway signature');
    err.status = 401;
    throw err;
  }
}

/**
 * CRM → Gateway profile sync after manage-profile / workspace create.
 * Body may include platformUserId or email to locate the PlatformUser.
 */
async function syncProfile(req, res) {
  try {
    assertInternalSignature(req);
    const email = String(req.body.email || '').trim().toLowerCase();
    const platformUserId = String(req.body.platformUserId || '').trim();
    let user = null;
    if (platformUserId) user = await PlatformUser.findById(platformUserId);
    if (!user && email) user = await PlatformUser.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Platform user not found' });
    }

    if (req.body.name != null) user.name = String(req.body.name).trim() || user.name;
    if (req.body.phone != null) user.phone = String(req.body.phone).trim();
    if (req.body.businessName != null) user.businessName = String(req.body.businessName).trim();
    if (req.body.billingTaxId != null) user.billingTaxId = String(req.body.billingTaxId).trim();
    if (req.body.billingAddress != null) user.billingAddress = String(req.body.billingAddress).trim();
    if (req.body.preferredTimezone != null) user.preferredTimezone = String(req.body.preferredTimezone).trim();
    if (req.body.preferredLanguage != null) user.preferredLanguage = String(req.body.preferredLanguage).trim();
    if (req.body.profileComplete != null) user.profileComplete = Boolean(req.body.profileComplete);
    if (req.body.productWorkspaceId != null) {
      user.productWorkspaceId = String(req.body.productWorkspaceId).trim();
    }
    if (req.body.productStoreId != null) {
      user.productStoreId = String(req.body.productStoreId).trim();
    }
    if (req.body.launchPath != null) {
      user.launchPath = String(req.body.launchPath).trim();
    }
    await user.save();

    return res.json({
      success: true,
      data: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        phone: user.phone,
        businessName: user.businessName,
        profileComplete: user.profileComplete,
        productWorkspaceId: user.productWorkspaceId,
        launchPath: user.launchPath,
      },
    });
  } catch (err) {
    const status = err.status || 500;
    console.error('[gateway sync-profile]', err);
    return res.status(status).json({ success: false, message: err.message || 'Sync failed' });
  }
}

module.exports = { syncProfile };
