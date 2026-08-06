import { config } from '../config';
import { normalizeHostname, isActiveCustomDomainHostname } from '../services/domain/domain.service';

type OriginCallback = (err: Error | null, allow?: boolean) => void;

function matchesStaticOrigin(origin: string): boolean {
  for (const allowed of config.allowedOrigins) {
    if (typeof allowed === 'string') {
      if (allowed === origin) return true;
    } else if (allowed instanceof RegExp) {
      if (allowed.test(origin)) return true;
    }
  }
  return false;
}

/**
 * CORS origin checker: static platform origins + active merchant custom domains.
 */
export async function resolveCorsOrigin(
  origin: string | undefined,
  callback: OriginCallback
): Promise<void> {
  try {
    if (!origin) {
      callback(null, true);
      return;
    }

    if (matchesStaticOrigin(origin)) {
      callback(null, true);
      return;
    }

    let hostname = '';
    try {
      hostname = normalizeHostname(new URL(origin).hostname);
    } catch {
      callback(null, false);
      return;
    }

    if (await isActiveCustomDomainHostname(hostname)) {
      callback(null, true);
      return;
    }

    callback(null, false);
  } catch {
    callback(null, false);
  }
}
