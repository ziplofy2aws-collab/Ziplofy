/**
 * Lightweight verification for codiicCatalogApi (no test runner in package).
 * Run: node src/utils/codiicCatalogApi.verify.js
 */
const {
  resolveCodiicCatalogApiBase,
  requireCodiicCatalogApiBase,
  mapCodiicCatalogError,
} = require('./codiicCatalogApi');

let failed = 0;
function assert(cond, msg) {
  if (!cond) {
    failed += 1;
    console.error('FAIL:', msg);
  } else {
    console.log('PASS:', msg);
  }
}

const prevUrl = process.env.CODIIC_API_URL;
const prevServer = process.env.CODIIC_SERVER_URL;

delete process.env.CODIIC_API_URL;
delete process.env.CODIIC_SERVER_URL;
assert(resolveCodiicCatalogApiBase() === null, 'missing env → null base');
try {
  requireCodiicCatalogApiBase();
  assert(false, 'require should throw when missing');
} catch (err) {
  assert(err.statusCode === 503, 'require throws statusCode 503');
  const mapped = mapCodiicCatalogError(err);
  assert(mapped.status === 503, 'map missing config → 503');
  assert(mapped.body.code === 'CODIIC_CATALOG_NOT_CONFIGURED', '503 body code');
}

process.env.CODIIC_API_URL = 'https://example-catalog.test/api';
assert(
  resolveCodiicCatalogApiBase() === 'https://example-catalog.test/api',
  'configured URL resolves (no trailing slash)'
);

const mapped401 = mapCodiicCatalogError({
  response: { status: 401, data: { message: 'upstream unauthorized' } },
});
assert(mapped401.status === 502, 'upstream 401 → 502');
assert(mapped401.body.code === 'CODIIC_CATALOG_AUTH_FAILED', '401 mapped code');

const mapped403 = mapCodiicCatalogError({
  response: { status: 403, data: { message: 'forbidden' } },
});
assert(mapped403.status === 502, 'upstream 403 → 502');

if (prevUrl === undefined) delete process.env.CODIIC_API_URL;
else process.env.CODIIC_API_URL = prevUrl;
if (prevServer === undefined) delete process.env.CODIIC_SERVER_URL;
else process.env.CODIIC_SERVER_URL = prevServer;

if (failed) {
  console.error(`\n${failed} assertion(s) failed`);
  process.exit(1);
}
console.log('\nAll codiicCatalogApi checks passed');
