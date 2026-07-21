import { existsSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const backends = [
  { dir: 'server', entry: 'build/index.js' },
  { dir: 'codiic-server', entry: 'build/index.js' },
];

for (const { dir, entry } of backends) {
  const entryPath = path.join(root, dir, entry);
  if (existsSync(entryPath)) continue;

  console.log(`[dev] Building ${dir} (missing ${entry})...`);
  const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const result = spawnSync(npmCmd, ['run', 'build'], {
    cwd: path.join(root, dir),
    stdio: 'inherit',
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
