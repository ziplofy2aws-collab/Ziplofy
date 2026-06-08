/**
 * Master database seed runner: runs every seed script in a safe order for a new MongoDB database.
 *
 * Prerequisites:
 *   - .env.development or .env.production (or DOTENV_CONFIG_PATH) with the same variables the app expects
 *     (MONGODB_URI, JWT, email, AWS, etc.); connectDB pulls in env.utils.
 *   - npm run build so compiled seeds exist under build/seed/ (this file becomes build/seed/run-all-seeds.js).
 *
 * Usage (from repo root Ziplofy3b):
 *   npm run seed:database
 *
 * Or after build only:
 *   node build/seed/run-all-seeds.js
 *   node build/seed/run-all-seeds.js --skip-demo
 *
 * Flags:
 *   --skip-demo   Omit demo products + discount matrix (reference / admin data only).
 *
 * Warning: seed.roles clears all roles then inserts defaults. Use on empty DBs or when you accept
 * resetting roles (re-run seed:admins after if you need admin users).
 */
import * as fs from 'fs';
import * as path from 'path';
import { spawnSync } from 'child_process';

const repoRoot = path.resolve(__dirname, '../..');

/** Relative to repo root; order matters. */
const REFERENCE_SEEDS: string[] = [
  'build/seed/permissions/seed.permissions.js',
  'build/seed/seed.triggers.js',
  'build/seed/seed.actions.js',
  'build/seed/categories/seed.categories.js',
  'build/seed/variants/seed.variant.js',
  'build/seed/seed.countries.js',
  'build/seed/seed.states.js',
  'build/seed/notifications/seed.notification-categories.js',
  'build/seed/notifications/seed.notification-options.js',
  'build/seed/seed.tax-defaults-india.js',
  'build/seed/seed.country-tax.js',
  'build/seed/packaging/seed.packaging.js',
  'build/seed/seed.store-codes.js',
  'build/seed/roles/seed.roles.js',
  'build/seed/create-admins.js',
  'build/seed/seed.user-codes.js',
];

const DEMO_SEEDS: string[] = [
  'build/seed/seed.products-demo.js',
  'build/seed/seed.discounts-demo-matrix.js',
];

function parseArgs(argv: string[]): { skipDemo: boolean } {
  return { skipDemo: argv.includes('--skip-demo') };
}

function runScript(relPath: string): void {
  const abs = path.join(repoRoot, relPath);
  if (!fs.existsSync(abs)) {
    console.error('\nMissing seed file: ' + relPath);
    console.error('Run npm run build from the Ziplofy3b folder, then try again.\n');
    process.exit(1);
  }

  console.log(`\n${'='.repeat(72)}\n> ${relPath}\n${'='.repeat(72)}\n`);

  const r = spawnSync(process.execPath, [abs], {
    cwd: repoRoot,
    stdio: 'inherit',
    env: process.env,
  });

  if (r.error) {
    console.error(r.error);
    process.exit(1);
  }
  if (r.status !== 0 && r.status !== null) {
    console.error(`\nStopped: "${relPath}" exited with code ${r.status}.`);
    process.exit(r.status);
  }
}

function main(): void {
  const { skipDemo } = parseArgs(process.argv.slice(2));

  console.log('\nZiplofy3b - master database seed');
  console.log(`Repo root: ${repoRoot}`);
  console.log(skipDemo ? 'Mode: reference data only (--skip-demo)\n' : 'Mode: reference + demo data\n');

  for (const rel of REFERENCE_SEEDS) {
    runScript(rel);
  }

  if (!skipDemo) {
    for (const rel of DEMO_SEEDS) {
      runScript(rel);
    }
  } else {
    console.log('\n(Skipped demo seeds: products-demo, discounts-demo-matrix)\n');
  }

  console.log('\nAll seed steps finished successfully.\n');
}

main();
