import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { config } from '../config';
import { StoreDomain } from '../models/store-domain.model';
import { Subdomain } from '../models/subdomain.model';
import {
  deleteCloudflareCustomHostname,
  ensureCloudflareCustomHostname,
  isCloudflareCustomHostnameConfigured,
  refreshCloudflareSslStatus,
} from '../services/domain/cloudflare-custom-hostname.service';
import {
  assertValidCustomHostname,
  buildDnsInstructions,
  generateVerificationToken,
  mergeDnsInstructions,
  normalizeHostname,
  verifyDomainDns,
} from '../services/domain/domain.service';
import { asyncErrorHandler, CustomError } from '../utils/error.utils';

function platformHostname(subdomain: string): string {
  // suffix is ".codiic.com" or ".localhost:5180"
  return `${subdomain}${config.storeRenderMicroserviceUrlSuffix}`;
}

function publicUrl(hostname: string): string {
  const isProduction = (process.env.NODE_ENV || 'development') === 'production';
  const protocol = isProduction ? 'https' : 'http';
  return `${protocol}://${hostname}`;
}

async function getStoreSubdomainOrThrow(storeId: string) {
  if (!mongoose.isValidObjectId(storeId)) {
    throw new CustomError('Valid storeId is required', 400);
  }
  const mapping = await Subdomain.findOne({ storeId: new mongoose.Types.ObjectId(storeId) });
  if (!mapping) {
    throw new CustomError('Store subdomain not found', 404);
  }
  return mapping;
}

async function provisionCloudflareHostname(doc: InstanceType<typeof StoreDomain>) {
  if (!isCloudflareCustomHostnameConfigured()) {
    doc.sslStatus = 'not_configured';
    doc.sslError = null;
    return;
  }

  try {
    const cf = await ensureCloudflareCustomHostname(
      doc.hostname,
      doc.cloudflareCustomHostnameId,
    );
    doc.cloudflareCustomHostnameId = cf.id;
    doc.sslStatus = cf.sslStatus;
    doc.sslError = cf.sslError;
    doc.dnsInstructions = mergeDnsInstructions(doc.dnsInstructions || [], cf.ownershipRecords);
  } catch (err) {
    doc.sslStatus = 'error';
    doc.sslError = (err as Error)?.message || 'Failed to provision Cloudflare SSL';
  }
}

/** GET /api/domains/store/:storeId */
export const listStoreDomains = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId } = req.params as { storeId: string };
  const mapping = await getStoreSubdomainOrThrow(storeId);

  const connected = await StoreDomain.find({ storeId: mapping.storeId })
    .sort({ createdAt: -1 });

  // Refresh pending Cloudflare SSL statuses so the admin UI can show HTTPS progress.
  if (isCloudflareCustomHostnameConfigured()) {
    await Promise.all(
      connected.map(async (doc) => {
        if (!doc.cloudflareCustomHostnameId) return;
        if (doc.sslStatus === 'active') return;
        try {
          const cf = await refreshCloudflareSslStatus({
            hostname: doc.hostname,
            cloudflareCustomHostnameId: doc.cloudflareCustomHostnameId,
          });
          if (!cf) return;
          doc.sslStatus = cf.sslStatus;
          doc.sslError = cf.sslError;
          await doc.save();
        } catch {
          /* keep last known sslStatus */
        }
      }),
    );
  }

  const lean = connected.map((d) => d.toObject());
  const hasActivePrimary = lean.some((d) => d.isPrimary && d.status === 'active');

  const data = [
    {
      id: String(mapping._id),
      hostname: platformHostname(mapping.subdomain),
      type: 'platform' as const,
      status: 'connected' as const,
      isPrimary: !hasActivePrimary,
      url: publicUrl(platformHostname(mapping.subdomain)),
      dnsInstructions: [] as unknown[],
      verificationToken: null as string | null,
      lastError: null as string | null,
      verifiedAt: null as Date | null,
      sslStatus: 'active' as const,
      sslError: null as string | null,
      cloudflareCustomHostnameId: null as string | null,
    },
    ...lean.map((d) => ({
      id: String(d._id),
      hostname: d.hostname,
      type: d.type,
      status: d.status,
      isPrimary: Boolean(d.isPrimary),
      url: publicUrl(d.hostname),
      dnsInstructions: d.dnsInstructions,
      verificationToken: d.verificationToken,
      lastError: d.lastError ?? null,
      verifiedAt: d.verifiedAt ?? null,
      sslStatus: d.sslStatus ?? 'not_configured',
      sslError: d.sslError ?? null,
      cloudflareCustomHostnameId: d.cloudflareCustomHostnameId ?? null,
    })),
  ];

  return res.status(200).json({
    success: true,
    data,
    message: 'Domains fetched successfully',
  });
});

/** POST /api/domains/connect — { storeId, hostname } */
export const connectDomain = asyncErrorHandler(async (req: Request, res: Response) => {
  const storeId = String(req.body?.storeId || '');
  const hostname = normalizeHostname(String(req.body?.hostname || ''));

  assertValidCustomHostname(hostname);
  const mapping = await getStoreSubdomainOrThrow(storeId);

  const existing = await StoreDomain.findOne({ hostname });
  if (existing) {
    if (String(existing.storeId) !== String(mapping.storeId)) {
      throw new CustomError('This domain is already connected to another store', 409);
    }
    if (existing.status === 'active') {
      throw new CustomError('This domain is already connected', 409);
    }

    const token = existing.verificationToken || generateVerificationToken();
    existing.verificationToken = token;
    existing.dnsInstructions = buildDnsInstructions(hostname, token, mapping.subdomain);
    existing.status = 'pending';
    existing.lastError = null;
    await provisionCloudflareHostname(existing);
    await existing.save();

    return res.status(200).json({
      success: true,
      data: existing,
      message: 'Update your DNS records, then verify',
    });
  }

  const alsoOnSubdomain = await Subdomain.findOne({
    customDomain: hostname,
    storeId: { $ne: mapping.storeId },
  }).lean();
  if (alsoOnSubdomain) {
    throw new CustomError('This domain is already connected to another store', 409);
  }

  const verificationToken = generateVerificationToken();
  const dnsInstructions = buildDnsInstructions(hostname, verificationToken, mapping.subdomain);

  const doc = new StoreDomain({
    storeId: mapping.storeId,
    hostname,
    type: 'connected',
    status: 'pending',
    isPrimary: false,
    verificationToken,
    dnsInstructions,
    sslStatus: 'not_configured',
  });

  await provisionCloudflareHostname(doc);
  await doc.save();

  return res.status(201).json({
    success: true,
    data: doc,
    message: isCloudflareCustomHostnameConfigured()
      ? 'Domain saved. Add the DNS records below (including Cloudflare SSL records), then verify.'
      : 'Domain saved. Add the DNS records below, then verify.',
  });
});

/** POST /api/domains/verify — { storeId, domainId? , hostname? } */
export const verifyDomain = asyncErrorHandler(async (req: Request, res: Response) => {
  const storeId = String(req.body?.storeId || '');
  const domainId = req.body?.domainId ? String(req.body.domainId) : '';
  const hostnameInput = req.body?.hostname ? normalizeHostname(String(req.body.hostname)) : '';

  const mapping = await getStoreSubdomainOrThrow(storeId);

  const query: Record<string, unknown> = { storeId: mapping.storeId };
  if (domainId) {
    if (!mongoose.isValidObjectId(domainId)) {
      throw new CustomError('Valid domainId is required', 400);
    }
    query._id = domainId;
  } else if (hostnameInput) {
    query.hostname = hostnameInput;
  } else {
    throw new CustomError('domainId or hostname is required', 400);
  }

  const doc = await StoreDomain.findOne(query);
  if (!doc) throw new CustomError('Domain connection not found', 404);

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
    throw new CustomError(result.message || 'DNS verification failed', 400);
  }

  await StoreDomain.updateMany(
    { storeId: mapping.storeId, _id: { $ne: doc._id } },
    { $set: { isPrimary: false } }
  );

  // DNS ownership OK → ensure Cloudflare Custom Hostname / SSL is provisioned via API.
  await provisionCloudflareHostname(doc);

  doc.status = 'active';
  doc.isPrimary = true;
  doc.verifiedAt = new Date();
  doc.lastError = null;
  await doc.save();

  mapping.customDomain = doc.hostname;
  await mapping.save();

  const httpsReady = doc.sslStatus === 'active' || doc.sslStatus === 'not_configured';

  return res.status(200).json({
    success: true,
    data: {
      domain: doc,
      dns: result.observed,
      ssl: {
        status: doc.sslStatus,
        error: doc.sslError,
        httpsReady,
        provider: isCloudflareCustomHostnameConfigured() ? 'cloudflare' : 'none',
      },
    },
    message:
      doc.sslStatus === 'active'
        ? 'Domain verified. HTTPS is active via Cloudflare.'
        : doc.sslStatus === 'pending'
          ? 'Domain verified. Cloudflare is still issuing the SSL certificate.'
          : doc.sslStatus === 'error'
            ? 'Domain verified, but Cloudflare SSL provisioning failed. Check sslError.'
            : 'Domain verified and connected',
  });
});

/** DELETE /api/domains/:id?storeId= */
export const disconnectDomain = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const storeId = String(req.query.storeId || req.body?.storeId || '');

  if (!mongoose.isValidObjectId(id)) {
    throw new CustomError('Valid domain id is required', 400);
  }
  const mapping = await getStoreSubdomainOrThrow(storeId);

  const doc = await StoreDomain.findOne({
    _id: id,
    storeId: mapping.storeId,
  });
  if (!doc) throw new CustomError('Domain not found', 404);

  if (doc.cloudflareCustomHostnameId && isCloudflareCustomHostnameConfigured()) {
    try {
      await deleteCloudflareCustomHostname(doc.cloudflareCustomHostnameId);
    } catch {
      /* continue disconnect even if CF delete fails */
    }
  }

  const clearedCustom =
    mapping.customDomain === doc.hostname ||
    (doc.status === 'active' && doc.isPrimary);

  await StoreDomain.deleteOne({ _id: doc._id });

  if (clearedCustom) {
    mapping.customDomain = null;
    await mapping.save();

    const next = await StoreDomain.findOne({
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

  return res.status(200).json({
    success: true,
    data: { id },
    message: 'Domain disconnected',
  });
});
