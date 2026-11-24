import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const nginx = require('./nginx-config.manager.js');

const OPTS = {
  hostname: 'ziplofy.com',
  certPath: '/etc/letsencrypt/live/ziplofy.com/fullchain.pem',
  keyPath: '/etc/letsencrypt/live/ziplofy.com/privkey.pem',
  acmeWebroot: '/var/www/letsencrypt',
  rendererRoot: '/var/www/webpanel-store-renderer',
  apiUpstream: 'https://crm-backend.codiic.com',
  apiHostHeader: 'crm-backend.codiic.com',
};
const TEMPLATE = 'server { server_name {{HOSTNAME}}; ssl_certificate {{CERT_PATH}}; ssl_certificate_key {{KEY_PATH}}; root {{RENDERER_ROOT}}; location ^~ /.well-known/acme-challenge/ { root {{ACME_WEBROOT}}; } location /api/ { proxy_pass {{API_UPSTREAM}}; proxy_set_header Host {{API_HOST_HEADER}}; } }';

test('valid hostnames pass', () => {
  assert.equal(nginx.assertSafeHostname('ziplofy.com'), 'ziplofy.com');
  assert.equal(nginx.assertSafeHostname('  Shop.Example.COM '), 'shop.example.com');
  assert.equal(nginx.assertSafeHostname('a.b-c.example.co.uk'), 'a.b-c.example.co.uk');
});

test('injection / unsafe hostnames are rejected', () => {
  for (const h of ['a.com; rm -rf /', 'a.com$(id)', 'a`b`.com', '../etc', 'a b.com', '*.com', 'a..com', 'a.com\nfoo', '-a.com', 'a_com', 'a.com:80', 'localhost']) {
    assert.throws(() => nginx.assertSafeHostname(h), /Unsafe hostname/, h);
  }
});

test('renderDomainConf substitutes all placeholders', () => {
  const out = nginx.renderDomainConf(TEMPLATE, OPTS);
  assert.ok(!out.includes('{{'), 'no leftover placeholders');
  assert.ok(out.includes('server_name ziplofy.com'));
  assert.ok(out.includes('ssl_certificate /etc/letsencrypt/live/ziplofy.com/fullchain.pem'));
  assert.ok(out.includes('proxy_pass https://crm-backend.codiic.com'));
  assert.ok(out.includes('proxy_set_header Host crm-backend.codiic.com'));
});

test('writeConfAtomic writes only <host>.conf via hidden temp', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'nginx-conf-'));
  const final = await nginx.writeConfAtomic(dir, 'ziplofy.com', 'server {}');
  assert.equal(final, path.join(dir, 'ziplofy.com.conf'));
  assert.equal(fs.readFileSync(final, 'utf8'), 'server {}');
  const leftover = fs.readdirSync(dir).filter((f) => f.startsWith('.'));
  assert.deepEqual(leftover, [], 'no temp files left');
});

test('listManagedDomainConfs ignores dotfiles and non-conf files', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'nginx-conf-'));
  fs.writeFileSync(path.join(dir, 'ziplofy.com.conf'), 'x');
  fs.writeFileSync(path.join(dir, '.ziplofy.com.conf.tmp'), 'x');
  fs.writeFileSync(path.join(dir, 'not-a-host!.conf'), 'x');
  fs.writeFileSync(path.join(dir, 'other.txt'), 'x');
  assert.deepEqual(await nginx.listManagedDomainConfs(dir), ['ziplofy.com']);
});

test('removeDomainConf removes only validated names', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'nginx-conf-'));
  fs.writeFileSync(path.join(dir, 'ziplofy.com.conf'), 'x');
  assert.equal(await nginx.removeDomainConf(dir, 'ziplofy.com'), true);
  assert.equal(await nginx.removeDomainConf(dir, 'ziplofy.com'), false);
  await assert.rejects(() => nginx.removeDomainConf(dir, 'a.com; rm -rf /'));
});
