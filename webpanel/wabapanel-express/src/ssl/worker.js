/**
 * webpanel SSL provisioning worker — runs ON the storefront gateway
 * (the host that owns nginx + certbot), alongside the static storefront.
 *
 * Flow: poll Mongo for verified domains due for SSL → atomic claim →
 * certbot webroot issuance → per-domain nginx conf → safe reload.
 * Job state lives entirely in `webpanel_store_domains`, so the worker
 * recovers cleanly from restarts and multiple workers can't race on
 * the same hostname (atomic findOneAndUpdate + lock TTL).
 *
 * Run:  node src/ssl/worker.js        (env: NODE_ENV, .env.production, SSL_*)
 * PM2:  deploy/ssl-agent/ecosystem.config.js
 */
require('../config/loadEnv');
const cron = require('node-cron');
const connectDB = require('../config/db');
const WebpanelStoreDomain = require('../models/WebpanelStoreDomain');
const cfg = require('./ssl-config');
const svc = require('./ssl-provisioning.service');
const nginx = require('./nginx-config.manager');

const DAY_MS = 24 * 60 * 60 * 1000;
let stopping = false;
let inFlight = Promise.resolve();

const log = (...a) => console.log('[ssl-worker]', ...a);
const warn = (...a) => console.warn('[ssl-worker]', ...a);

/** Atomically claim the next due SSL job. Returns the doc or null. */
async function claimNextJob() {
  const now = new Date();
  return WebpanelStoreDomain.findOneAndUpdate(
    {
      status: 'active',
      sslStatus: { $in: ['pending', 'failed'] },
      $and: [
        { $or: [{ sslNextRetryAt: { $lte: now } }, { sslNextRetryAt: null }] },
        { $or: [{ sslLockedUntil: { $lte: now } }, { sslLockedUntil: null }] },
      ],
    },
    {
      $set: {
        sslStatus: 'issuing',
        sslLockedUntil: new Date(now.getTime() + cfg.lockTtlMs),
        sslLockedBy: cfg.workerId,
        lastSslCheckAt: now,
      },
    },
    { new: true, sort: { sslNextRetryAt: 1 } }
  );
}

async function processJob(doc) {
  const hostname = doc.hostname;
  log(`provisioning ${hostname} (attempt ${doc.sslAttemptCount + 1})`);
  try {
    const patch = await svc.provisionDomainDoc(doc);
    patch.sslAttemptCount = 0;
    await WebpanelStoreDomain.updateOne({ _id: doc._id }, { $set: patch });
    log(`${hostname}: SSL active`);
  } catch (e) {
    const attempts = (doc.sslAttemptCount || 0) + 1;
    const backoff = svc.isRateLimitError(e?.stderr || e?.message)
      ? Math.max(svc.computeBackoffMs(attempts), DAY_MS)
      : svc.computeBackoffMs(attempts);
    const exhausted = attempts >= cfg.maxAttempts;
    await WebpanelStoreDomain.updateOne(
      { _id: doc._id },
      {
        $set: {
          sslStatus: exhausted ? 'failed' : 'pending',
          sslError: e.userMessage || svc.sanitizeSslError(e),
          sslAttemptCount: attempts,
          sslNextRetryAt: new Date(Date.now() + backoff),
          sslLockedUntil: null,
          sslLockedBy: null,
          lastSslCheckAt: new Date(),
        },
      }
    );
    warn(`${hostname}: attempt ${attempts} failed (${e.code || 'ERR'}) — ${e.userMessage || svc.sanitizeSslError(e)}; next retry in ${Math.round(backoff / 60000)}m`);
  }
}

/** Claim-and-process loop — drains the queue serially. */
async function pollTick() {
  for (;;) {
    if (stopping) return;
    const doc = await claimNextJob().catch((e) => (warn('claim failed:', e.message), null));
    if (!doc) return;
    await processJob(doc);
  }
}

/** Remove nginx confs for hostnames no longer active+ssl-active in Mongo. */
async function reconcileTick() {
  const hostnames = await nginx.listManagedDomainConfs(cfg.nginxDomainConfDir);
  for (const hostname of hostnames) {
    try {
      const live = await WebpanelStoreDomain.exists({
        hostname,
        status: 'active',
        sslStatus: 'active',
      });
      if (live) continue;
      log(`reconcile: removing stale conf for ${hostname}`);
      await svc.deprovisionHostname(hostname);
    } catch (e) {
      warn(`reconcile: ${hostname}:`, e.message);
    }
  }
}

/** Track real cert expiry; requeue anything already expired. */
async function expiryScanTick() {
  const docs = await WebpanelStoreDomain.find({ sslStatus: 'active' })
    .select('hostname certificatePath sslExpiresAt')
    .lean();
  for (const doc of docs) {
    try {
      const { sslExpiresAt, missing } = await svc.refreshCertExpiry(doc);
      const expired = sslExpiresAt && sslExpiresAt.getTime() <= Date.now();
      await WebpanelStoreDomain.updateOne(
        { _id: doc._id },
        {
          $set: {
            sslExpiresAt,
            lastSslCheckAt: new Date(),
            ...(missing || expired
              ? { sslStatus: 'pending', sslNextRetryAt: new Date(), sslError: null }
              : {}),
          },
        }
      );
      if (missing) warn(`${doc.hostname}: cert files missing — requeued`);
      else if (expired) warn(`${doc.hostname}: certificate expired — requeued`);
      else if (sslExpiresAt && sslExpiresAt.getTime() - Date.now() < 14 * DAY_MS) {
        warn(`${doc.hostname}: certificate expires ${sslExpiresAt.toISOString()} (<14d)`);
      }
    } catch (e) {
      warn(`expiry scan: ${doc.hostname}:`, e.message);
    }
  }
}

const wrap = (name, fn) =>
  (inFlight = inFlight.then(async () => {
    if (stopping) return;
    try {
      await fn();
    } catch (e) {
      warn(`${name} tick error:`, e.message);
    }
  }));

async function main() {
  if (!cfg.mongodbUri) {
    console.error('[ssl-worker] MONGODB_URI is not set — refusing to start.');
    process.exit(1);
  }
  if (!cfg.gatewayPublicIp) {
    console.error('[ssl-worker] SSL_GATEWAY_PUBLIC_IP is not set — refusing to start.');
    process.exit(1);
  }

  await connectDB();
  log(`started as ${cfg.workerId} — poll "${cfg.pollCron}", reconcile "${cfg.reconcileCron}", expiry "${cfg.expiryScanCron}"${cfg.certbotStaging ? ' [STAGING CA]' : ''}`);

  cron.schedule(cfg.pollCron, () => wrap('poll', pollTick));
  cron.schedule(cfg.reconcileCron, () => wrap('reconcile', reconcileTick));
  cron.schedule(cfg.expiryScanCron, () => wrap('expiry-scan', expiryScanTick));

  // First pass immediately on boot — catches jobs queued while we were down.
  wrap('boot', async () => {
    await pollTick();
    await reconcileTick();
  });
}

async function shutdown(signal) {
  if (stopping) return;
  stopping = true;
  log(`${signal} — finishing in-flight work`);
  try {
    await inFlight;
  } finally {
    process.exit(0);
  }
}
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('unhandledRejection', (reason) => {
  console.error('[ssl-worker][unhandledRejection]', reason && reason.stack ? reason.stack : reason);
});

if (require.main === module) {
  main().catch((e) => {
    console.error('[ssl-worker] fatal:', e);
    process.exit(1);
  });
}

module.exports = { claimNextJob, processJob, pollTick, reconcileTick, expiryScanTick };
