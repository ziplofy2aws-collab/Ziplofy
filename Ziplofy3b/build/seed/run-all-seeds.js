"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
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
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const child_process_1 = require("child_process");
const repoRoot = path.resolve(__dirname, '../..');
/** Relative to repo root; order matters. */
const REFERENCE_SEEDS = [
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
const DEMO_SEEDS = [
    'build/seed/seed.products-demo.js',
    'build/seed/seed.discounts-demo-matrix.js',
];
function parseArgs(argv) {
    return { skipDemo: argv.includes('--skip-demo') };
}
function runScript(relPath) {
    const abs = path.join(repoRoot, relPath);
    if (!fs.existsSync(abs)) {
        console.error('\nMissing seed file: ' + relPath);
        console.error('Run npm run build from the Ziplofy3b folder, then try again.\n');
        process.exit(1);
    }
    console.log(`\n${'='.repeat(72)}\n> ${relPath}\n${'='.repeat(72)}\n`);
    const r = (0, child_process_1.spawnSync)(process.execPath, [abs], {
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
function main() {
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
    }
    else {
        console.log('\n(Skipped demo seeds: products-demo, discounts-demo-matrix)\n');
    }
    console.log('\nAll seed steps finished successfully.\n');
}
main();
