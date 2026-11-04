/**
 * Verifies logout interceptor path rules without a browser test runner.
 * Run: node scripts/verify-api-logout-interceptor.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const apiPath = path.join(__dirname, '../src/lib/api.ts');
const src = fs.readFileSync(apiPath, 'utf8');

let failed = 0;
function assert(cond, msg) {
  if (!cond) {
    failed += 1;
    console.error('FAIL:', msg);
  } else {
    console.log('PASS:', msg);
  }
}

assert(src.includes('isCatalogIntegrationRequest'), 'catalog exception flag present');
assert(
  /informatic-themes\|informatic-installed-themes\|informatic-theme-config\|informatic-theme-runtime/.test(
    src
  ),
  'catalog path regex present'
);
assert(
  src.includes('!isAuthRequest && !isCatalogIntegrationRequest'),
  'logout requires non-auth AND non-catalog'
);
assert(src.includes('GATEWAY_LOGOUT_URL'), 'genuine expiry still redirects to gateway logout');
assert(src.includes("localStorage.removeItem('token')"), 'genuine expiry still clears token');

// Auth endpoints listed remain excluded (unchanged security behavior)
assert(src.includes('isAuthRequest'), 'auth request flag present');
assert(src.includes('login|admin'), 'auth login/admin exclusions present');
assert(src.includes('sso'), 'auth sso exclusion present');

// Simulate path classification logic (mirror of interceptor)
const catalogRe =
  /informatic-themes|informatic-installed-themes|informatic-theme-config|informatic-theme-runtime/;
const authRe = /\/auth\/(login|admin\/login|register|google|sso\/exchange)/;

function wouldLogout(url, status = 401) {
  if (status !== 401) return false;
  const isAuthRequest = authRe.test(url);
  const isCatalogIntegrationRequest = catalogRe.test(url);
  return !isAuthRequest && !isCatalogIntegrationRequest;
}

assert(wouldLogout('/auth/me') === true, '401 on /auth/me → logout (genuine session)');
assert(wouldLogout('/stores/123') === true, '401 on normal CRM route → logout');
assert(wouldLogout('/informatic-themes') === false, '401 on catalog list → no logout');
assert(
  wouldLogout('/stores/abc/informatic-installed-themes') === false,
  '401 on installed themes → no logout'
);
assert(wouldLogout('/auth/login') === false, '401 on login → no logout loop');

if (failed) {
  console.error(`\n${failed} assertion(s) failed`);
  process.exit(1);
}
console.log('\nAll api logout interceptor checks passed');
