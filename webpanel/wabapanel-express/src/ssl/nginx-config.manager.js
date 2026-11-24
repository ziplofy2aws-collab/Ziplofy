/**
 * Safe per-domain nginx configuration manager.
 *
 * - Hostnames are strictly validated before they touch a filename or config.
 * - Config files are written to a hidden temp name (never matched by the
 *   `*.conf` include glob) and atomically renamed into place.
 * - `nginx -t` runs before every reload; on failure the previous working
 *   configuration is preserved.
 * - All subprocess calls use execFile with argument arrays — never a shell.
 */
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const { execFile } = require('child_process');
const { promisify } = require('util');

const execFileAsync = promisify(execFile);
const TEMPLATE_PATH = path.join(__dirname, 'templates', 'domain.conf.template');

/** Strict allowlist — anything outside [a-z0-9.-] is rejected outright. */
const SAFE_HOST_RE = /^(?=.{1,253}$)(?!-)[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/;

function assertSafeHostname(hostname) {
  const h = String(hostname || '').trim().toLowerCase();
  if (!SAFE_HOST_RE.test(h)) {
    const err = new Error(`Unsafe hostname rejected: ${JSON.stringify(hostname)}`);
    err.code = 'UNSAFE_HOSTNAME';
    throw err;
  }
  if (h.includes('..')) {
    const err = new Error(`Unsafe hostname rejected: ${JSON.stringify(hostname)}`);
    err.code = 'UNSAFE_HOSTNAME';
    throw err;
  }
  return h;
}

function renderDomainConf(template, { hostname, certPath, keyPath, acmeWebroot, rendererRoot, apiUpstream, apiHostHeader }) {
  const h = assertSafeHostname(hostname);
  return String(template)
    .replaceAll('{{HOSTNAME}}', h)
    .replaceAll('{{CERT_PATH}}', certPath)
    .replaceAll('{{KEY_PATH}}', keyPath)
    .replaceAll('{{ACME_WEBROOT}}', acmeWebroot)
    .replaceAll('{{RENDERER_ROOT}}', rendererRoot)
    .replaceAll('{{API_UPSTREAM}}', apiUpstream)
    .replaceAll('{{API_HOST_HEADER}}', apiHostHeader);
}

async function loadTemplate(templatePath = TEMPLATE_PATH) {
  return fsp.readFile(templatePath, 'utf8');
}

/** Hidden temp name — nginx's `*.conf` glob never picks it up mid-write. */
const confPathFor = (confDir, hostname) => path.join(confDir, `${hostname}.conf`);
const tmpPathFor = (confDir, hostname) => path.join(confDir, `.${hostname}.conf.tmp`);

/**
 * Write conf atomically: temp file → fsync → rename.
 * If nginx -t fails after rename, the temp slot is restored to the previous
 * state by the caller (swapConfSafely handles rollback).
 */
async function writeConfAtomic(confDir, hostname, content) {
  assertSafeHostname(hostname);
  const tmp = tmpPathFor(confDir, hostname);
  const final = confPathFor(confDir, hostname);
  await fsp.mkdir(confDir, { recursive: true, mode: 0o755 });
  const fh = await fsp.open(tmp, 'w', 0o644);
  try {
    await fh.writeFile(content, 'utf8');
    await fh.sync();
  } finally {
    await fh.close();
  }
  await fsp.rename(tmp, final);
  return final;
}

async function removeDomainConf(confDir, hostname) {
  assertSafeHostname(hostname);
  try {
    await fsp.unlink(confPathFor(confDir, hostname));
    return true;
  } catch (e) {
    if (e.code === 'ENOENT') return false;
    throw e;
  }
}

async function listManagedDomainConfs(confDir) {
  try {
    const names = await fsp.readdir(confDir);
    return names.filter((n) => /^[a-z0-9.-]+\.conf$/.test(n) && !n.startsWith('.')).map((n) => n.slice(0, -'.conf'.length));
  } catch (e) {
    if (e.code === 'ENOENT') return [];
    throw e;
  }
}

async function testNginx(nginxBin) {
  try {
    await execFileAsync(nginxBin, ['-t']);
    return { ok: true };
  } catch (e) {
    return { ok: false, stderr: String(e.stderr || e.message || 'nginx -t failed') };
  }
}

async function reloadNginx(reloadCmd) {
  const [bin, ...args] = String(reloadCmd).split(/\s+/).filter(Boolean);
  await execFileAsync(bin, args);
}

/**
 * Install (or update) a domain vhost: write → rename → nginx -t → reload.
 * On `nginx -t` failure the file is removed (if it was new) or the previous
 * file is restored from backup, and nginx is NOT reloaded.
 */
async function installDomainConf({ confDir, hostname, content, nginxBin, reloadCmd, backupDir }) {
  const final = confPathFor(confDir, hostname);
  const backup = path.join(backupDir || `${confDir}/.backup`, `${hostname}.conf`);
  const hadPrevious = fs.existsSync(final);

  if (hadPrevious) {
    await fsp.mkdir(path.dirname(backup), { recursive: true });
    await fsp.copyFile(final, backup);
  }

  await writeConfAtomic(confDir, hostname, content);

  const t = await testNginx(nginxBin);
  if (!t.ok) {
    if (hadPrevious) {
      await fsp.copyFile(backup, final);
    } else {
      await fsp.unlink(final).catch(() => {});
    }
    const err = new Error(`nginx -t failed after installing ${hostname}.conf — previous config restored`);
    err.stderr = t.stderr;
    err.code = 'NGINX_TEST_FAILED';
    throw err;
  }

  await reloadNginx(reloadCmd);
  return final;
}

module.exports = {
  SAFE_HOST_RE,
  TEMPLATE_PATH,
  assertSafeHostname,
  renderDomainConf,
  loadTemplate,
  writeConfAtomic,
  removeDomainConf,
  listManagedDomainConfs,
  testNginx,
  reloadNginx,
  installDomainConf,
  confPathFor,
};
