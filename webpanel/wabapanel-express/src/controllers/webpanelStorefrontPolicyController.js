const mongoose = require('mongoose');
const WebpanelStorePolicy = require('../models/WebpanelStorePolicy');
const { POLICY_TYPES } = require('../models/WebpanelStorePolicy');

function assertValidStoreId(storeId) {
  if (!storeId || !mongoose.Types.ObjectId.isValid(storeId)) {
    const err = new Error('Valid storeId is required');
    err.statusCode = 400;
    throw err;
  }
}

function normalizePolicyType(raw) {
  const type = String(raw || '').trim().toLowerCase();
  if (!POLICY_TYPES.includes(type)) {
    const err = new Error('Invalid policy type');
    err.statusCode = 400;
    throw err;
  }
  return type;
}

function toContent(raw, updatedAt) {
  const content = typeof raw === 'string' ? raw.trim() : '';
  if (!content) return null;
  return {
    content,
    updatedAt: updatedAt ? new Date(updatedAt).toISOString() : new Date().toISOString(),
  };
}

function mapToWrittenPolicies(rows) {
  const byType = new Map(rows.map((row) => [row.policyType, row]));
  return {
    returnRefund: toContent(byType.get('return-refund')?.content, byType.get('return-refund')?.updatedAt),
    privacy: toContent(byType.get('privacy')?.content, byType.get('privacy')?.updatedAt),
    terms: toContent(byType.get('terms')?.content, byType.get('terms')?.updatedAt),
    contact: toContent(byType.get('contact')?.content, byType.get('contact')?.updatedAt),
  };
}

function policyByType(all, type) {
  switch (type) {
    case 'return-refund':
      return all.returnRefund;
    case 'privacy':
      return all.privacy;
    case 'terms':
      return all.terms;
    case 'contact':
      return all.contact;
    default:
      return null;
  }
}

/** GET /api/storefront/:storeId/policies */
const getStorefrontPolicies = async (req, res) => {
  try {
    const { storeId } = req.params;
    assertValidStoreId(storeId);
    const rows = await WebpanelStorePolicy.find({ store: storeId }).lean();
    res.json({
      success: true,
      data: mapToWrittenPolicies(rows),
      message: 'Store policies fetched',
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Failed to load policies' });
  }
};

/** GET /api/storefront/:storeId/policies/:policyType */
const getStorefrontPolicyByType = async (req, res) => {
  try {
    const { storeId, policyType: rawType } = req.params;
    assertValidStoreId(storeId);
    const policyType = normalizePolicyType(rawType);
    const rows = await WebpanelStorePolicy.find({ store: storeId }).lean();
    const all = mapToWrittenPolicies(rows);
    const data = policyByType(all, policyType);
    res.json({
      success: true,
      data,
      message: data ? 'Store policy fetched' : 'No policy found',
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Failed to load policy' });
  }
};

module.exports = {
  getStorefrontPolicies,
  getStorefrontPolicyByType,
};
