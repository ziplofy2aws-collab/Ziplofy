/**
 * Cloudflare for SaaS — Custom Hostnames API.
 * Issues HTTPS certificates programmatically for merchant domains.
 *
 * Required env:
 *   CLOUDFLARE_API_TOKEN   — token with Zone → SSL and Certificates → Edit (Custom Hostnames)
 *   CLOUDFLARE_ZONE_ID     — zone that has SSL for SaaS / Custom Hostnames enabled
 *
 * Recommended env:
 *   DOMAIN_PLATFORM_TARGET — CNAME target merchants point at (e.g. shops.codiic.com)
 *   CLOUDFLARE_CUSTOM_HOSTNAME_SSL_METHOD — http | txt (default http)
 */

export type CloudflareSslStatus =
  | 'not_configured'
  | 'pending'
  | 'active'
  | 'error'
  | 'deleted';

export type CloudflareOwnershipRecord = {
  type: 'TXT' | 'CNAME' | 'http';
  host: string;
  value: string;
  purpose: string;
};

export type CloudflareCustomHostnameResult = {
  id: string;
  hostname: string;
  status: string;
  sslStatus: CloudflareSslStatus;
  sslError: string | null;
  ownershipRecords: CloudflareOwnershipRecord[];
  rawSslStatus?: string | null;
};

type CloudflareApiResponse<T> = {
  success: boolean;
  errors?: Array<{ code?: number; message?: string }>;
  result?: T;
};

type CloudflareCustomHostnamePayload = {
  id: string;
  hostname: string;
  status?: string;
  ownership_verification?: {
    type?: string;
    name?: string;
    value?: string;
  };
  ownership_verification_http?: {
    http_url?: string;
    http_body?: string;
  };
  ssl?: {
    status?: string;
    validation_errors?: Array<{ message?: string }>;
    validation_records?: Array<{
      status?: string;
      txt_name?: string;
      txt_value?: string;
      http_url?: string;
      http_body?: string;
      cname?: string;
      cname_target?: string;
    }>;
  };
};

function cloudflareConfig() {
  const apiToken = (process.env.CLOUDFLARE_API_TOKEN || '').trim();
  const zoneId = (process.env.CLOUDFLARE_ZONE_ID || '').trim();
  const sslMethod = (
    process.env.CLOUDFLARE_CUSTOM_HOSTNAME_SSL_METHOD || 'http'
  )
    .trim()
    .toLowerCase();

  return {
    apiToken,
    zoneId,
    sslMethod: sslMethod === 'txt' ? 'txt' : 'http',
  };
}

export function isCloudflareCustomHostnameConfigured(): boolean {
  const { apiToken, zoneId } = cloudflareConfig();
  return Boolean(apiToken && zoneId);
}

function mapSslStatus(raw?: string | null): CloudflareSslStatus {
  const status = (raw || '').toLowerCase();
  if (!status) return 'pending';
  if (status === 'active') return 'active';
  if (
    status === 'pending_validation' ||
    status === 'pending_issuance' ||
    status === 'pending_deployment' ||
    status === 'initializing' ||
    status === 'pending'
  ) {
    return 'pending';
  }
  if (
    status === 'validation_timed_out' ||
    status === 'issuance_timed_out' ||
    status === 'deployment_timed_out' ||
    status === 'deleted' ||
    status === 'error'
  ) {
    return status === 'deleted' ? 'deleted' : 'error';
  }
  return 'pending';
}

function ownershipFromPayload(
  result: CloudflareCustomHostnamePayload,
): CloudflareOwnershipRecord[] {
  const rows: CloudflareOwnershipRecord[] = [];

  const ownership = result.ownership_verification;
  if (ownership?.name && ownership?.value) {
    rows.push({
      type: (ownership.type || 'txt').toUpperCase() === 'CNAME' ? 'CNAME' : 'TXT',
      host: ownership.name,
      value: ownership.value,
      purpose: 'Cloudflare domain ownership verification',
    });
  }

  for (const record of result.ssl?.validation_records || []) {
    if (record.txt_name && record.txt_value) {
      rows.push({
        type: 'TXT',
        host: record.txt_name,
        value: record.txt_value,
        purpose: 'Cloudflare SSL certificate validation',
      });
    } else if (record.cname && record.cname_target) {
      rows.push({
        type: 'CNAME',
        host: record.cname,
        value: record.cname_target,
        purpose: 'Cloudflare SSL certificate validation',
      });
    } else if (record.http_url && record.http_body) {
      rows.push({
        type: 'http',
        host: record.http_url,
        value: record.http_body,
        purpose: 'Cloudflare SSL HTTP validation (served by Cloudflare once CNAME is set)',
      });
    }
  }

  return rows;
}

function toResult(result: CloudflareCustomHostnamePayload): CloudflareCustomHostnameResult {
  const rawSslStatus = result.ssl?.status || null;
  const sslStatus = mapSslStatus(rawSslStatus);
  const sslError =
    result.ssl?.validation_errors?.map((e) => e.message).filter(Boolean).join('; ') ||
    null;

  return {
    id: result.id,
    hostname: result.hostname,
    status: result.status || 'pending',
    sslStatus,
    sslError,
    ownershipRecords: ownershipFromPayload(result),
    rawSslStatus,
  };
}

async function cloudflareRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const { apiToken, zoneId } = cloudflareConfig();
  if (!apiToken || !zoneId) {
    throw new Error('Cloudflare Custom Hostnames is not configured');
  }

  const response = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });

  const body = (await response.json()) as CloudflareApiResponse<T>;
  if (!response.ok || !body.success) {
    const message =
      body.errors?.map((e) => e.message).filter(Boolean).join('; ') ||
      `Cloudflare API error (${response.status})`;
    throw new Error(message);
  }
  if (body.result === undefined) {
    throw new Error('Cloudflare API returned no result');
  }
  return body.result;
}

export async function createCloudflareCustomHostname(
  hostname: string,
): Promise<CloudflareCustomHostnameResult> {
  const { zoneId, sslMethod } = cloudflareConfig();
  const result = await cloudflareRequest<CloudflareCustomHostnamePayload>(
    `/zones/${zoneId}/custom_hostnames`,
    {
      method: 'POST',
      body: JSON.stringify({
        hostname,
        ssl: {
          method: sslMethod,
          type: 'dv',
          settings: {
            min_tls_version: '1.2',
            http2: 'on',
            tls_1_3: 'on',
          },
        },
      }),
    },
  );
  return toResult(result);
}

export async function getCloudflareCustomHostnameById(
  id: string,
): Promise<CloudflareCustomHostnameResult> {
  const { zoneId } = cloudflareConfig();
  const result = await cloudflareRequest<CloudflareCustomHostnamePayload>(
    `/zones/${zoneId}/custom_hostnames/${id}`,
  );
  return toResult(result);
}

export async function findCloudflareCustomHostnameByHostname(
  hostname: string,
): Promise<CloudflareCustomHostnameResult | null> {
  const { zoneId } = cloudflareConfig();
  const encoded = encodeURIComponent(hostname);
  const result = await cloudflareRequest<CloudflareCustomHostnamePayload[]>(
    `/zones/${zoneId}/custom_hostnames?hostname=${encoded}`,
  );
  const first = Array.isArray(result) ? result[0] : null;
  return first ? toResult(first) : null;
}

export async function ensureCloudflareCustomHostname(
  hostname: string,
  existingId?: string | null,
): Promise<CloudflareCustomHostnameResult> {
  if (existingId) {
    try {
      return await getCloudflareCustomHostnameById(existingId);
    } catch {
      /* recreate below */
    }
  }

  const found = await findCloudflareCustomHostnameByHostname(hostname);
  if (found) return found;

  return createCloudflareCustomHostname(hostname);
}

export async function deleteCloudflareCustomHostname(
  id: string,
): Promise<void> {
  const { zoneId } = cloudflareConfig();
  await cloudflareRequest<unknown>(`/zones/${zoneId}/custom_hostnames/${id}`, {
    method: 'DELETE',
  });
}

export async function refreshCloudflareSslStatus(params: {
  hostname: string;
  cloudflareCustomHostnameId?: string | null;
}): Promise<CloudflareCustomHostnameResult | null> {
  if (!isCloudflareCustomHostnameConfigured()) return null;

  if (params.cloudflareCustomHostnameId) {
    return getCloudflareCustomHostnameById(params.cloudflareCustomHostnameId);
  }
  return findCloudflareCustomHostnameByHostname(params.hostname);
}
