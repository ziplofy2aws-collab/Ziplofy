/**
 * Run package.json seed scripts by preset or by explicit script name(s).
 *
 * Usage (from Ziplofy3b folder):
 *   node scripts/run-seeds.js <preset>
 *   node scripts/run-seeds.js seed:countries seed:states
 *   npm run seed:run -- full
 *   npm run seed:run -- seed:permissions
 *
 * Presets:
 *   base           — permissions, triggers, actions, categories, variants
 *   geo            — countries, states (countries first)
 *   notifications  — notification-categories, notification-options
 *   india-tax      — tax-defaults-india, country-tax (fix hardcoded India ID in seeds if needed)
 *   optional       — packaging, store-codes
 *   demo           — products-demo, discounts-demo (products first)
 *   full           — base → geo → notifications → india-tax → optional (recommended order)
 *   all            — full → demo (one-shot complete seeding; includes roles → admins → user-codes)
 *
 * Prefer a single entry for new DBs: `npm run seed:database` (runs build/seed/run-all-seeds.js).
 */
const { execSync } = require('child_process');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

/** npm script names exactly as in package.json "scripts" */
const PRESETS = {
  base: [
    'seed:permissions',
    'seed:triggers',
    'seed:actions',
    'seed:categories',
    'seed:variants',
  ],
  geo: ['seed:countries', 'seed:states'],
  notifications: ['seed:notification-categories', 'seed:notification-options'],
  'india-tax': ['seed:tax-defaults-india', 'seed:country-tax'],
  optional: ['seed:packaging', 'seed:store-codes'],
  demo: ['seed:products-demo', 'seed:discounts-demo'],
  full: [
    'seed:permissions',
    'seed:triggers',
    'seed:actions',
    'seed:categories',
    'seed:variants',
    'seed:countries',
    'seed:states',
    'seed:notification-categories',
    'seed:notification-options',
    'seed:tax-defaults-india',
    'seed:country-tax',
    'seed:packaging',
    'seed:store-codes',
    'seed:roles',
    'seed:admins',
    'seed:user-codes',
  ],
  all: [
    'seed:permissions',
    'seed:triggers',
    'seed:actions',
    'seed:categories',
    'seed:variants',
    'seed:countries',
    'seed:states',
    'seed:notification-categories',
    'seed:notification-options',
    'seed:tax-defaults-india',
    'seed:country-tax',
    'seed:packaging',
    'seed:store-codes',
    'seed:roles',
    'seed:admins',
    'seed:user-codes',
    'seed:products-demo',
    'seed:discounts-demo',
  ],
};

function runNpmScript(scriptName) {
  console.log(`\n>>> npm run ${scriptName}\n`);
  execSync(`npm run ${JSON.stringify(scriptName)}`, {
    cwd: ROOT,
    stdio: 'inherit',
    shell: true,
    env: process.env,
  });
}

function main() {
  const args = process.argv.slice(2).filter(Boolean);
  if (args.length === 0) {
    console.log(`Usage: node scripts/run-seeds.js <preset | seed:script ...>

Presets: ${Object.keys(PRESETS).join(', ')}

Examples:
  node scripts/run-seeds.js full
  node scripts/run-seeds.js geo
  node scripts/run-seeds.js seed:countries seed:states

Run "npm run build" first so build/seed/*.js exists.`);
    process.exit(1);
  }

  let scripts = [];
  for (const arg of args) {
    if (PRESETS[arg]) {
      scripts.push(...PRESETS[arg]);
    } else if (/^seed:[\w-]+$/.test(arg)) {
      scripts.push(arg);
    } else {
      console.error(`Unknown argument: "${arg}". Use a preset (${Object.keys(PRESETS).join(', ')}) or a script name like seed:countries.`);
      process.exit(1);
    }
  }

  for (const name of scripts) {
    try {
      runNpmScript(name);
    } catch (e) {
      console.error(`\nStopped: "${name}" failed.`);
      process.exit(e.status ?? 1);
    }
  }
  console.log('\nAll requested seed scripts finished.');
}

main();
