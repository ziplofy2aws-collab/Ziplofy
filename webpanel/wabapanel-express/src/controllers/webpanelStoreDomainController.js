const mongoose = require('mongoose');
const WebpanelStore = require('../models/WebpanelStore');
const WebpanelStoreSubdomain = require('../models/WebpanelStoreSubdomain');
const WebpanelStoreDomain = require('../models/WebpanelStoreDomain');
const {
  assertValidCustomHostname,
  buildDnsInstructions,
  generateVerificationToken,
  normalizeHostname,
  platformHostname,
  verifyDomainDns,
} = require('../utils/webpanelDomain.util');

function publicUrl(hostname) {
  const isProduction = (process.env.NODE_ENV || 'development') === 'production';
  return `${isProduction ? 'https' : 'http'}://${hostname}`;
}

const bad = (res, code, message) => res.status(code).json({ success: false, message });

/** Resolve the caller's store + its subdomain mapping. */
async function getStoreSubdomainOrThrow(req, storeId) {
  if (!mongoose.Types.ObjectId.isValid(storeId)) {
    const err = new Error('Valid storeId is required');
    err.status = 400;
    throw err;
  }
  const store = await WebpanelStore.findOne({ _id: storeId, userId: req.user._id }).lean();
  if (!store) {
    const err = new Error('Store not found');
    err.status = 404;
    throw err;
  }
  const mapping = await WebpanelStoreSubdomain.findOne({ storeId: store._id });
  if (!mapping) {
    const err = new Error('Store subdomain not found');
    err.status = 404;
    throw err;
  }
  return { store, mapping };
}

function serializeDomain(d) {
  const doc = d.toObject ? d.toObject() : d;
  return {
    id: String(doc._id),
    hostname: doc.hostname,
    type: doc.type,
    status: doc.status,
    isPrimary: Boolean(doc.isPrimary),
    url: publicUrl(doc.hostname),
    dnsInstructions: doc.dnsInstructions || [],
    verificationToken: doc.verificationToken ?? null,
    lastError: doc.lastError ?? null,
    verifiedAt: doc.verifiedAt ?? null,
    sslStatus: doc.sslStatus ?? 'not_configured',
    sslProvider: doc.sslProvider ?? 'none',
    sslError: doc.sslError ?? null,
    sslIssuedAt: doc.sslIssuedAt ?? null,
    sslExpiresAt: doc.sslExpiresAt ?? null,
    httpsReady: doc.sslStatus === 'active',
    cloudflareCustomHostnameId: doc.cloudflareCustomHostnameId ?? null,
  };
}

/** GET /api/domains/store/:storeId */
const listStoreDomains = async (req, res) => {
  try {
    const { mapping } = await getStoreSubdomainOrThrow(req, req.params.storeId);

    const connected = await WebpanelStoreDomain.find({ storeId: mapping.storeId })
      .sort({ createdAt: -1 })
      .lean();
    const hasActivePrimary = connected.some((d) => d.isPrimary && d.status === 'active');
    const platformHost = platformHostname(mapping.subdomain);

    const data = [
      {
        id: String(mapping._id),
        hostname: platformHost,
        type: 'platform',
        status: 'connected',
        isPrimary: !hasActivePrimary,
        url: publicUrl(platformHost),
        dnsInstructions: [],
        verificationToken: null,
        lastError: null,
        verifiedAt: null,
        sslStatus: 'active',
        sslError: null,
        cloudflareCustomHostnameId: null,
      },
      ...connected.map(serializeDomain),
    ];

    res.json({ success: true, data, message: 'Domains fetched successfully' });
  } catch (error) {
    bad(res, error.status || 500, error.message);
  }
};

/** POST /api/domains/connect — { storeId, hostname } */
const connectDomain = async (req, res) => {
  try {
    const storeId = String(req.body?.storeId || '');
    const hostname = normalizeHostname(String(req.body?.hostname || ''));
    assertValidCustomHostname(hostname);
    const { mapping } = await getStoreSubdomainOrThrow(req, storeId);

    const existing = await WebpanelStoreDomain.findOne({ hostname });
    if (existing) {
      if (String(existing.storeId) !== String(mapping.storeId)) {
        return bad(res, 409, 'This domain is already connected to another store');
      }
      if (existing.status === 'active') {
        return bad(res, 409, 'This domain is already connected');
      }
      existing.verificationToken = existing.verificationToken || generateVerificationToken();
      existing.dnsInstructions = buildDnsInstructions(
        hostname,
        existing.verificationToken,
        mapping.subdomain
      );
      existing.status = 'pending';
      existing.lastError = null;
      await existing.save();
      return res.json({
        success: true,
        data: serializeDomain(existing),
        message: 'Update your DNS records, then verify',
      });
    }

    const alsoOnSubdomain = await WebpanelStoreSubdomain.findOne({
      customDomain: hostname,
      storeId: { $ne: mapping.storeId },
    }).lean();
    if (alsoOnSubdomain) {
      return bad(res, 409, 'This domain is already connected to another store');
    }

    const verificationToken = generateVerificationToken();
    const doc = await WebpanelStoreDomain.create({
      storeId: mapping.storeId,
      hostname,
      type: 'connected',
      status: 'pending',
      isPrimary: false,
      verificationToken,
      dnsInstructions: buildDnsInstructions(hostname, verificationToken, mapping.subdomain),
      sslStatus: 'not_configured',
    });

    res.status(201).json({
      success: true,
      data: serializeDomain(doc),
      message: 'Domain saved. Add the DNS records below, then verify.',
    });
  } catch (error) {
    bad(res, error.status || 500, error.message);
  }
};

/** POST /api/domains/verify — { storeId, domainId? , hostname? } */
const verifyDomain = async (req, res) => {
  try {
    const storeId = String(req.body?.storeId || '');
    const domainId = req.body?.domainId ? String(req.body.domainId) : '';
    const hostnameInput = req.body?.hostname ? normalizeHostname(String(req.body.hostname)) : '';
    const { mapping } = await getStoreSubdomainOrThrow(req, storeId);

    const query = { storeId: mapping.storeId };
    if (domainId) {
      if (!mongoose.Types.ObjectId.isValid(domainId)) {
        return bad(res, 400, 'Valid domainId is required');
      }
      query._id = domainId;
    } else if (hostnameInput) {
      query.hostname = hostnameInput;
    } else {
      return bad(res, 400, 'domainId or hostname is required');
    }

    const doc = await WebpanelStoreDomain.findOne(query);
    if (!doc) return bad(res, 404, 'Domain connection not found');

    doc.status = 'verifying';
    doc.lastError = null;
    await doc.save();

    const result = await verifyDomainDns({
      hostname: doc.hostname,
      verificationToken: doc.verificationToken,
      storeSubdomain: mapping.subdomain,
      requireTxt: true,
    });

    if (!result.ok) {
      doc.status = 'failed';
      doc.lastError = result.message;
      await doc.save();
      return bad(res, 400, result.message || 'DNS verification failed');
    }

    await WebpanelStoreDomain.updateMany(
      { storeId: mapping.storeId, _id: { $ne: doc._id } },
      { $set: { isPrimary: false } }
    );

    doc.status = 'active';
    doc.isPrimary = true;
    doc.verifiedAt = new Date();
    doc.lastError = null;
    // Enqueue SSL provisioning — the gateway worker picks this up
    // asynchronously; certificate issuance never blocks the request.
    doc.sslStatus = 'pending';
    doc.sslProvider = 'letsencrypt';
    doc.sslError = null;
    doc.sslAttemptCount = 0;
    doc.sslNextRetryAt = new Date();
    doc.sslLockedUntil = null;
    doc.sslLockedBy = null;
    await doc.save();

    mapping.customDomain = doc.hostname;
    await mapping.save();

    res.json({
      success: true,
      data: {
        domain: serializeDomain(doc),
        dns: result.observed,
        ssl: { status: doc.sslStatus, error: doc.sslError, httpsReady: doc.sslStatus === 'active', provider: doc.sslProvider },
      },
      message: 'Domain verified and connected. SSL certificate is being provisioned.',
    });
  } catch (error) {
    bad(res, error.status || 500, error.message);
  }
};

/** DELETE /api/domains/:id?storeId= */
const disconnectDomain = async (req, res) => {
  try {
    const { id } = req.params;
    const storeId = String(req.query.storeId || req.body?.storeId || '');
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return bad(res, 400, 'Valid domain id is required');
    }
    const { mapping } = await getStoreSubdomainOrThrow(req, storeId);

    const doc = await WebpanelStoreDomain.findOne({ _id: id, storeId: mapping.storeId });
    if (!doc) return bad(res, 404, 'Domain not found');

    const clearedCustom =
      mapping.customDomain === doc.hostname || (doc.status === 'active' && doc.isPrimary);

    await WebpanelStoreDomain.deleteOne({ _id: doc._id });

    if (clearedCustom) {
      mapping.customDomain = null;
      await mapping.save();
      const next = await WebpanelStoreDomain.findOne({
        storeId: mapping.storeId,
        status: 'active',
      }).sort({ verifiedAt: -1 });
      if (next) {
        next.isPrimary = true;
        await next.save();
        mapping.customDomain = next.hostname;
        await mapping.save();
      }
    }

    res.json({ success: true, data: { id }, message: 'Domain disconnected' });
  } catch (error) {
    bad(res, error.status || 500, error.message);
  }
};

/** POST /api/domains/:id/ssl/retry — requeue a failed/stalled SSL job. */
const retryDomainSsl = async (req, res) => {
  try {
    const { id } = req.params;
    const storeId = String(req.body?.storeId || req.query.storeId || '');
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return bad(res, 400, 'Valid domain id is required');
    }
    const { mapping } = await getStoreSubdomainOrThrow(req, storeId);
    const doc = await WebpanelStoreDomain.findOne({ _id: id, storeId: mapping.storeId });
    if (!doc) return bad(res, 404, 'Domain not found');
    if (doc.status !== 'active') {
      return bad(res, 400, 'Domain must be verified before SSL can be provisioned');
    }
    if (doc.sslStatus === 'active' || doc.sslStatus === 'issuing') {
      return bad(res, 409, `SSL is already ${doc.sslStatus}`);
    }

    doc.sslStatus = 'pending';
    doc.sslProvider = 'letsencrypt';
    doc.sslError = null;
    doc.sslAttemptCount = 0;
    doc.sslNextRetryAt = new Date();
    doc.sslLockedUntil = null;
    doc.sslLockedBy = null;
    await doc.save();

    res.json({ success: true, data: serializeDomain(doc), message: 'SSL provisioning requeued' });
  } catch (error) {
    bad(res, error.status || 500, error.message);
  }
};

module.exports = { listStoreDomains, connectDomain, verifyDomain, disconnectDomain, retryDomainSsl };
