"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const storefront_host_util_1 = require("./storefront-host.util");
function mockRequest(headers = {}) {
    return {
        get(name) {
            return headers[name.toLowerCase()];
        },
        protocol: 'http',
    };
}
(0, vitest_1.describe)('canonicalStorefrontOrigin', () => {
    (0, vitest_1.afterEach)(() => {
        vitest_1.vi.unstubAllEnvs();
    });
    (0, vitest_1.it)('uses forwarded storefront host in development', () => {
        vitest_1.vi.stubEnv('NODE_ENV', 'development');
        const req = mockRequest({
            'x-forwarded-host': 'developer-pgdp.localhost:5180',
            'x-forwarded-proto': 'http',
        });
        (0, vitest_1.expect)((0, storefront_host_util_1.canonicalStorefrontOrigin)({ subdomain: 'developer-pgdp' }, req)).toBe('http://developer-pgdp.localhost:5180');
    });
    (0, vitest_1.it)('falls back to production ziplofy storefront origin when API host does not match store', () => {
        vitest_1.vi.stubEnv('NODE_ENV', 'production');
        const req = mockRequest({ host: 'internal-api:5000' });
        (0, vitest_1.expect)((0, storefront_host_util_1.canonicalStorefrontOrigin)({ subdomain: 'nike' }, req)).toBe('https://nike.ziplofy.com');
    });
    (0, vitest_1.it)('forces https for production ziplofy forwarded hosts', () => {
        vitest_1.vi.stubEnv('NODE_ENV', 'production');
        const req = mockRequest({
            'x-forwarded-host': 'nike.ziplofy.com',
            'x-forwarded-proto': 'http',
        });
        (0, vitest_1.expect)((0, storefront_host_util_1.canonicalStorefrontOrigin)({ subdomain: 'nike' }, req)).toBe('https://nike.ziplofy.com');
    });
    (0, vitest_1.it)('prefers custom domain when configured', () => {
        vitest_1.vi.stubEnv('NODE_ENV', 'production');
        const req = mockRequest({
            'x-forwarded-host': 'nike.ziplofy.com',
            'x-forwarded-proto': 'https',
        });
        (0, vitest_1.expect)((0, storefront_host_util_1.canonicalStorefrontOrigin)({ subdomain: 'nike', customDomain: 'shop.nike.com' }, req)).toBe('https://shop.nike.com');
    });
});
