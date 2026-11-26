#!/usr/bin/env node
/**
 * Onboarding hotfix patcher — wabapanel-express production.
 *
 * Adds the four missing client-business/onboarding endpoints that ship in
 * commit 45d3c117 (and the /business + /industry endpoints from 41105040):
 *
 *   GET  /api/auth/business            -> getClientBusinessOptions
 *   PUT  /api/auth/industry            -> updateClientIndustry
 *   GET  /api/auth/onboarding          -> getOnboardingStatus
 *   PUT  /api/auth/onboarding/profile  -> saveOnboardingProfile
 *
 * Touches:
 *   src/utils/gatewaySync.js          new file (copied verbatim from repo)
 *   src/utils/gatewayModules.js       replaced wholesale with repo version
 *                                     (same exports/signatures — superset data:
 *                                     9 sector modules, 9 industries)
 *   src/middleware/featureGate.js     replaced wholesale with repo version
 *                                     (same exports — superset catalog: adds
 *                                     7 sector feature keys)
 *   src/models/User.js                +3 schema fields
 *   src/controllers/authController.js +4 handler fns, +4 exports
 *   src/routes/auth.js                +2 import names, +4 route lines
 *
 * Idempotent: re-running is a no-op. Fails loudly (non-zero exit) if an
 * expected anchor is missing — never writes a broken file.
 *
 * Usage:  node deploy/onboarding-hotfix/patch.js [--dry-run]
 * Run from the wabapanel-express application root.
 */
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const DRY_RUN = process.argv.includes('--dry-run');
const PATCH_DIR = __dirname;

let failed = false;
const log = (...a) => console.log(...a);
const fail = (msg) => { failed = true; console.error(`FAIL  ${msg}`); };
const ok = (msg) => log(`ok    ${msg}`);
const skip = (msg) => log(`skip  ${msg}`);

function read(rel) {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) { fail(`${rel} not found`); return null; }
  return fs.readFileSync(p, 'utf8');
}

function write(rel, content) {
  if (DRY_RUN) { log(`dry   would write ${rel}`); return; }
  fs.writeFileSync(path.join(ROOT, rel), content);
}

/** Insert `insert` immediately after the first line containing `anchor`. */
function insertAfterLine(content, anchor, insert, file) {
  const lines = content.split('\n');
  const idx = lines.findIndex((l) => l.includes(anchor));
  if (idx === -1) { fail(`${file}: anchor not found: ${anchor}`); return null; }
  lines.splice(idx + 1, 0, ...insert.split('\n'));
  return lines.join('\n');
}

/** Insert `insert` immediately before the first line containing `anchor`. */
function insertBeforeLine(content, anchor, insert, file) {
  const lines = content.split('\n');
  const idx = lines.findIndex((l) => l.includes(anchor));
  if (idx === -1) { fail(`${file}: anchor not found: ${anchor}`); return null; }
  lines.splice(idx, 0, ...insert.split('\n'));
  return lines.join('\n');
}

// ── 1. src/utils/gatewaySync.js (new file) ──────────────────────────────
{
  const rel = 'src/utils/gatewaySync.js';
  const src = fs.readFileSync(path.join(PATCH_DIR, 'files', 'gatewaySync.js'), 'utf8');
  const existing = fs.existsSync(path.join(ROOT, rel)) ? fs.readFileSync(path.join(ROOT, rel), 'utf8') : null;
  if (existing === src) skip(`${rel} already up to date`);
  else { write(rel, src); ok(`${rel} ${existing ? 'replaced' : 'created'} (backup kept by apply.sh)`); }
}

// ── 2. wholesale replacements (same exports/signatures, superset data) ──
for (const [rel, file] of [
  ['src/utils/gatewayModules.js', 'gatewayModules.js'],
  ['src/middleware/featureGate.js', 'featureGate.js'],
]) {
  const src = fs.readFileSync(path.join(PATCH_DIR, 'files', file), 'utf8');
  const existing = read(rel);
  if (existing === null) continue;
  if (existing === src) skip(`${rel} already up to date`);
  else { write(rel, src); ok(`${rel} replaced with repo version (backup kept by apply.sh)`); }
}

// ── 3. src/models/User.js ───────────────────────────────────────────────
{
  const rel = 'src/models/User.js';
  let c = read(rel);
  if (c !== null) {
    if (!c.includes('preferredTimezone')) {
      const block = `  preferredTimezone: { type: String, default: '' },
  preferredLanguage: { type: String, default: 'en' },
  /** Gateway platform user id for CRM ↔ gateway sync */
  platformUserId: { type: String, default: '', index: true },`;
      c = insertAfterLine(c, 'vendorNotes:', block, rel);
      if (c !== null) { ok(`${rel}: added preferredTimezone/preferredLanguage/platformUserId`); write(rel, c); }
    } else skip(`${rel}: onboarding fields already present`);
  }
}

// ── 4. src/controllers/authController.js ────────────────────────────────
{
  const rel = 'src/controllers/authController.js';
  let c = read(rel);
  if (c !== null) {
    if (!c.includes('const getOnboardingStatus')) {
      const fns = fs.readFileSync(path.join(PATCH_DIR, 'files', 'auth-onboarding-fns.js'), 'utf8');
      c = insertBeforeLine(c, 'module.exports = {', fns, rel);
      if (c !== null) ok(`${rel}: inserted 4 handler functions`);
    } else skip(`${rel}: handler functions already present`);

    if (c !== null && !new RegExp('getOnboardingStatus,').test(c.slice(c.indexOf('module.exports')))) {
      c = insertAfterLine(c, 'getClientModules, updateClientModules,',
        '  getClientBusinessOptions, updateClientIndustry,\n  getOnboardingStatus, saveOnboardingProfile,', rel);
      if (c !== null) ok(`${rel}: added 4 exports`);
    } else if (c !== null) skip(`${rel}: exports already present`);
    if (c !== null) write(rel, c);
  }
}

// ── 5. src/routes/auth.js ───────────────────────────────────────────────
{
  const rel = 'src/routes/auth.js';
  let c = read(rel);
  if (c !== null) {
    if (!c.includes('getOnboardingStatus,')) {
      c = insertAfterLine(c, 'getClientModules, updateClientModules,',
        '  getClientBusinessOptions, updateClientIndustry,\n  getOnboardingStatus, saveOnboardingProfile,', rel);
      if (c !== null) ok(`${rel}: added 4 controller imports`);
    } else skip(`${rel}: controller imports already present`);

    if (c !== null) {
      const routes = [
        ["router.get('/business', protect, getClientBusinessOptions);", "router.get('/business'"],
        ["router.put('/industry', protect, updateClientIndustry);", "router.put('/industry'"],
        ["router.get('/onboarding', protect, getOnboardingStatus);", "router.get('/onboarding'"],
        ["router.put('/onboarding/profile', protect, saveOnboardingProfile);", "router.put('/onboarding/profile'"],
      ];
      const missingRoutes = routes.filter(([, probe]) => !c.includes(probe));
      if (missingRoutes.length) {
        if (missingRoutes.length !== routes.length) {
          fail(`${rel}: partial route state — only ${routes.length - missingRoutes.length}/4 missing, apply manually`);
        } else {
          c = insertAfterLine(c, "router.put('/modules', protect, updateClientModules);",
            routes.map(([r]) => r).join('\n'), rel);
          if (c !== null) ok(`${rel}: registered 4 routes`);
        }
      } else skip(`${rel}: routes already registered`);
      if (c !== null) write(rel, c);
    }
  }
}

if (failed) {
  console.error('\nPatch FAILED — review anchors above. No partial state is safe to run; restore backups if needed.');
  process.exit(1);
}
log('\nPatch applied. Next: node --check each touched file, then pm2 restart wabapanel-api.');
