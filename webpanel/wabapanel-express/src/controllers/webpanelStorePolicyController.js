const mongoose = require('mongoose');
const WebpanelStorePolicy = require('../models/WebpanelStorePolicy');
const { POLICY_TYPES } = require('../models/WebpanelStorePolicy');
const { assertStoreForUser } = require('../utils/webpanelStoreAccess.util');

function normalizePolicyType(raw) {
  const type = String(raw || '').trim().toLowerCase();
  if (!POLICY_TYPES.includes(type)) {
    const err = new Error('Invalid policy type');
    err.statusCode = 400;
    throw err;
  }
  return type;
}

function serializePolicy(row) {
  return {
    _id: String(row._id),
    storeId: String(row.store),
    policyType: row.policyType,
    content: row.content || '',
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function emptyPolicyMap() {
  return POLICY_TYPES.reduce((acc, type) => {
    acc[type] = null;
    return acc;
  }, {});
}

/** GET /api/stores/:storeId/policies */
const listStorePolicies = async (req, res) => {
  try {
    const { storeId } = req.params;
    await assertStoreForUser(req, storeId);
    const rows = await WebpanelStorePolicy.find({ store: storeId }).lean();
    const data = emptyPolicyMap();
    for (const row of rows) {
      data[row.policyType] = serializePolicy(row);
    }
    res.json({ success: true, data, count: rows.length });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Failed to list policies' });
  }
};

/** GET /api/stores/:storeId/policies/:policyType */
const getStorePolicy = async (req, res) => {
  try {
    const { storeId, policyType: rawType } = req.params;
    await assertStoreForUser(req, storeId);
    const policyType = normalizePolicyType(rawType);
    const row = await WebpanelStorePolicy.findOne({ store: storeId, policyType }).lean();
    res.json({
      success: true,
      data: row ? serializePolicy(row) : null,
      message: row ? 'Policy fetched' : 'No policy found',
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Failed to load policy' });
  }
};

/** PUT /api/stores/:storeId/policies/:policyType — create or update */
const upsertStorePolicy = async (req, res) => {
  try {
    const { storeId, policyType: rawType } = req.params;
    const store = await assertStoreForUser(req, storeId);
    const policyType = normalizePolicyType(rawType);
    const content = typeof req.body?.content === 'string' ? req.body.content : '';

    if (!content.trim()) {
      const err = new Error('Policy content is required');
      err.statusCode = 400;
      throw err;
    }

    const existing = await WebpanelStorePolicy.findOne({ store: storeId, policyType });
    if (existing) {
      existing.content = content;
      await existing.save();
      return res.json({
        success: true,
        data: serializePolicy(existing),
        message: 'Policy updated',
      });
    }

    const created = await WebpanelStorePolicy.create({
      store: storeId,
      userId: store.userId,
      policyType,
      content,
    });
    res.status(201).json({
      success: true,
      data: serializePolicy(created),
      message: 'Policy published',
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Failed to save policy' });
  }
};

module.exports = {
  listStorePolicies,
  getStorePolicy,
  upsertStorePolicy,
};
