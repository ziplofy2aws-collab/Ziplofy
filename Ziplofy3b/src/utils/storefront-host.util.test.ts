import type { Request } from 'express';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { canonicalStorefrontOrigin } from './storefront-host.util';

function mockRequest(headers: Record<string, string | undefined> = {}): Request {
  return {
    get(name: string) {
      return headers[name.toLowerCase()];
    },
    protocol: 'http',
  } as Request;
}

describe('canonicalStorefrontOrigin', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('uses forwarded storefront host in development', () => {
    vi.stubEnv('NODE_ENV', 'development');
    const req = mockRequest({
      'x-forwarded-host': 'developer-pgdp.localhost:5180',
      'x-forwarded-proto': 'http',
    });

    expect(
      canonicalStorefrontOrigin({ subdomain: 'developer-pgdp' }, req)
    ).toBe('http://developer-pgdp.localhost:5180');
  });

  it('falls back to production ziplofy storefront origin when API host does not match store', () => {
    vi.stubEnv('NODE_ENV', 'production');
    const req = mockRequest({ host: 'internal-api:5000' });

    expect(canonicalStorefrontOrigin({ subdomain: 'nike' }, req)).toBe('https://nike.ziplofy.com');
  });

  it('forces https for production ziplofy forwarded hosts', () => {
    vi.stubEnv('NODE_ENV', 'production');
    const req = mockRequest({
      'x-forwarded-host': 'nike.ziplofy.com',
      'x-forwarded-proto': 'http',
    });

    expect(canonicalStorefrontOrigin({ subdomain: 'nike' }, req)).toBe('https://nike.ziplofy.com');
  });

  it('prefers custom domain when configured', () => {
    vi.stubEnv('NODE_ENV', 'production');
    const req = mockRequest({
      'x-forwarded-host': 'nike.ziplofy.com',
      'x-forwarded-proto': 'https',
    });

    expect(
      canonicalStorefrontOrigin({ subdomain: 'nike', customDomain: 'shop.nike.com' }, req)
    ).toBe('https://shop.nike.com');
  });
});
