// Unit tests for the four onboarding/client-business handlers that were
// missing from the production build (Manage Profile 404s). Runs without
// MongoDB or network — model and gateway-sync modules are stubbed through
// the require cache before the controller is loaded.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

function stubModule(relPath, exports) {
  const resolved = require.resolve(relPath);
  require.cache[resolved] = {
    id: resolved,
    filename: resolved,
    loaded: true,
    exports,
  };
}

// ---- stubs ---------------------------------------------------------------

const state = {
  user: null,          // returned by User.findById()
  workspaceCount: 0,   // returned by Workspace.countDocuments()
  store: null,         // returned by WebpanelStore.findOne()
  synced: [],          // payloads passed to syncProfileToGateway
  ownerFeatures: {},   // returned by getOwnerFeatures
};

stubModule('../models/User', {
  findById: () => {
    const q = Promise.resolve(state.user);
    q.select = () => Promise.resolve(state.user);
    return q;
  },
});
stubModule('../models/Workspace', {
  countDocuments: async () => state.workspaceCount,
});
stubModule('../models/Plan', { findOne: async () => null });
stubModule('../models/WebpanelStore', {
  findOne: async () => state.store,
});
stubModule('../models/SystemSettings', { findOne: () => ({ lean: async () => null }) });
stubModule('../utils/generateToken', () => 'token');
stubModule('../services/systemMailer', {
  sendTemplateEmail: async () => {},
  sendRawEmail: async () => {},
  isTemplateEnabled: () => false,
});
stubModule('../utils/gatewaySync', {
  syncProfileToGateway: async (payload) => {
    state.synced.push(payload);
    return true;
  },
  resolveLaunchPath: (user, workspaceCount) => {
    if (!user.featureOverrides?.profileComplete) return '/client/manage-profile';
    if (!workspaceCount) return '/client/workspace';
    return '/client/dashboard';
  },
});
// Keep the real FEATURE_* catalogs (gatewayModules iterates FEATURE_KEYS);
// stub only the DB-backed getOwnerFeatures.
const realFeatureGate = require('../middleware/featureGate');
stubModule('../middleware/featureGate', {
  ...realFeatureGate,
  getOwnerFeatures: async () => state.ownerFeatures,
});

// gatewayModules is kept REAL — it is pure module/feature-flag logic.
const {
  getOnboardingStatus,
  saveOnboardingProfile,
  getClientBusinessOptions,
  updateClientIndustry,
} = require('./authController.js');

// ---- helpers -------------------------------------------------------------

function fakeUser(overrides = {}) {
  return {
    _id: '507f1f77bcf86cd799439011',
    role: 'vendor',
    name: 'Old Name',
    email: 'user@example.com',
    phone: '9000000000',
    avatar: '',
    companyName: '',
    gstNumber: '',
    address: '',
    preferredTimezone: '',
    preferredLanguage: 'en',
    platformUserId: 'plat-1',
    featureOverrides: {},
    markModified() {},
    async save() { return this; },
    ...overrides,
  };
}

function fakeRes() {
  const res = {
    statusCode: 200,
    body: undefined,
    status(code) { res.statusCode = code; return res; },
    json(payload) { res.body = payload; return res; },
  };
  return res;
}

const req = (userId, body = {}) => ({ user: { _id: userId }, body });

// ---- getOnboardingStatus -------------------------------------------------

test('getOnboardingStatus returns 404 when user missing', async () => {
  state.user = null;
  const res = fakeRes();
  await getOnboardingStatus(req('id'), res);
  assert.equal(res.statusCode, 404);
  assert.equal(res.body.success, false);
});

test('getOnboardingStatus returns profile + nextPath for incomplete user', async () => {
  state.user = fakeUser();
  state.workspaceCount = 0;
  const res = fakeRes();
  await getOnboardingStatus(req('id'), res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.profileComplete, false);
  assert.equal(res.body.data.workspaceCount, 0);
  assert.equal(res.body.data.nextPath, '/client/manage-profile');
  assert.equal(res.body.data.profile.email, 'user@example.com');
  assert.equal(res.body.data.profile.preferredLanguage, 'en');
});

test('getOnboardingStatus heals profileComplete when workspace+company+timezone exist', async () => {
  const u = fakeUser({
    companyName: 'Acme',
    preferredTimezone: 'Asia/Kolkata',
    featureOverrides: {},
  });
  state.user = u;
  state.workspaceCount = 2;
  const res = fakeRes();
  await getOnboardingStatus(req('id'), res);
  assert.equal(res.body.data.profileComplete, true);
  assert.equal(u.featureOverrides.profileComplete, true);
});

// ---- saveOnboardingProfile ------------------------------------------------

test('saveOnboardingProfile rejects agent role', async () => {
  state.user = fakeUser({ role: 'agent' });
  const res = fakeRes();
  await saveOnboardingProfile(req('id', { step: 'personal', name: 'A', phone: '1' }), res);
  assert.equal(res.statusCode, 403);
});

test('saveOnboardingProfile rejects invalid step', async () => {
  state.user = fakeUser();
  const res = fakeRes();
  await saveOnboardingProfile(req('id', { step: 'bogus' }), res);
  assert.equal(res.statusCode, 400);
  assert.match(res.body.message, /Invalid step/);
});

test('saveOnboardingProfile personal step requires name and phone', async () => {
  state.user = fakeUser();
  let res = fakeRes();
  await saveOnboardingProfile(req('id', { step: 'personal' }), res);
  assert.equal(res.statusCode, 400);
  assert.match(res.body.message, /Full name/);
  res = fakeRes();
  await saveOnboardingProfile(req('id', { step: 'personal', name: 'A' }), res);
  assert.match(res.body.message, /Phone/);
});

test('saveOnboardingProfile personal step saves fields and syncs to gateway', async () => {
  const u = fakeUser();
  state.user = u;
  state.workspaceCount = 1;
  state.synced = [];
  const res = fakeRes();
  await saveOnboardingProfile(
    req('id', { step: 'personal', name: 'New Name', phone: '8888', avatar: 'https://x/a.png' }),
    res
  );
  assert.equal(res.statusCode, 200);
  assert.equal(u.name, 'New Name');
  assert.equal(u.phone, '8888');
  assert.equal(u.avatar, 'https://x/a.png');
  assert.equal(state.synced.length, 1);
  assert.equal(state.synced[0].platformUserId, 'plat-1');
  assert.equal(res.body.data.profile.name, 'New Name');
});

test('saveOnboardingProfile billing step requires companyName and address', async () => {
  state.user = fakeUser();
  let res = fakeRes();
  await saveOnboardingProfile(req('id', { step: 'billing' }), res);
  assert.match(res.body.message, /Business name/);
  res = fakeRes();
  await saveOnboardingProfile(req('id', { step: 'billing', companyName: 'Acme' }), res);
  assert.match(res.body.message, /address/i);
});

test('saveOnboardingProfile regional step requires timezone and sets profileComplete', async () => {
  const u = fakeUser();
  state.user = u;
  state.workspaceCount = 0;
  let res = fakeRes();
  await saveOnboardingProfile(req('id', { step: 'regional' }), res);
  assert.equal(res.statusCode, 400);
  assert.match(res.body.message, /Timezone/);

  res = fakeRes();
  await saveOnboardingProfile(
    req('id', { step: 'regional', preferredTimezone: 'Asia/Kolkata', preferredLanguage: 'hi' }),
    res
  );
  assert.equal(res.statusCode, 200);
  assert.equal(u.preferredTimezone, 'Asia/Kolkata');
  assert.equal(u.preferredLanguage, 'hi');
  assert.equal(u.featureOverrides.profileComplete, true);
  assert.equal(res.body.data.profileComplete, true);
});

// ---- getClientBusinessOptions / updateClientIndustry ----------------------

test('getClientBusinessOptions returns option list and current industry', async () => {
  state.user = fakeUser({ featureOverrides: { industry: 'salon' } });
  const res = fakeRes();
  await getClientBusinessOptions(req('id'), res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.data.industry, 'salon');
  assert.ok(Array.isArray(res.body.data.options));
  assert.ok(res.body.data.options.length > 0);
  assert.ok(res.body.data.options.every((o) => o.id && o.label));
});

test('getClientBusinessOptions rejects agent role', async () => {
  state.user = fakeUser({ role: 'agent' });
  const res = fakeRes();
  await getClientBusinessOptions(req('id'), res);
  assert.equal(res.statusCode, 403);
});

test('updateClientIndustry rejects unknown industry', async () => {
  state.user = fakeUser();
  const res = fakeRes();
  await updateClientIndustry(req('id', { industry: 'not-a-real-sector' }), res);
  assert.equal(res.statusCode, 400);
});

test('updateClientIndustry swaps sector and preserves profileComplete', async () => {
  const u = fakeUser({
    featureOverrides: { selectedModules: ['x'], industry: 'salon', profileComplete: true },
  });
  state.user = u;
  state.store = null;
  state.ownerFeatures = { a: true };
  const res = fakeRes();
  await updateClientIndustry(req('id', { industry: 'healthcare' }), res);
  assert.equal(res.statusCode, 200, JSON.stringify(res.body));
  assert.equal(res.body.data.featureOverrides.industry, 'healthcare');
  assert.equal(res.body.data.featureOverrides.profileComplete, true);
  assert.equal(u.featureOverrides.industry, 'healthcare');
});
