import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const svc = require('./ssl-provisioning.service.js');

test('computeBackoffMs is exponential and capped', () => {
  const o = { base: 1000, cap: 60_000 };
  assert.equal(svc.computeBackoffMs(0, o), 1000);
  assert.equal(svc.computeBackoffMs(1, o), 2000);
  assert.equal(svc.computeBackoffMs(3, o), 8000);
  assert.equal(svc.computeBackoffMs(20, o), 60_000, 'capped');
});

test('rate-limit errors detected', () => {
  assert.equal(svc.isRateLimitError('too many certificates (5) already issued'), true);
  assert.equal(svc.isRateLimitError('Rate limit exceeded'), true);
  assert.equal(svc.isRateLimitError('connection refused'), false);
});

test('sanitizeSslError returns customer-safe messages, never raw output', () => {
  assert.match(svc.sanitizeSslError(new Error('urn:ietf:params:acme:error:rateLimited :: too many certificates')), /rate limit/i);
  assert.match(svc.sanitizeSslError({ stderr: 'Invalid response from http://x/.well-known/acme-challenge/abc' }), /verification challenge/i);
  assert.match(svc.sanitizeSslError(new Error('connect ECONNREFUSED 1.2.3.4:80 — connection refused')), /reach the domain/i);
  assert.match(svc.sanitizeSslError(new Error('DNS problem: NXDOMAIN looking up A for x.com')), /DNS resolution/i);
  const generic = svc.sanitizeSslError(new Error('some /etc/letsencrypt/secret-path detail'));
  assert.match(generic, /retrying automatically/i);
  assert.ok(!generic.includes('/etc/'), 'no internal paths leak');
});

test('cert paths derive from hostname', () => {
  assert.equal(svc.certPathFor('ziplofy.com'), '/etc/letsencrypt/live/ziplofy.com/fullchain.pem');
  assert.equal(svc.keyPathFor('ziplofy.com'), '/etc/letsencrypt/live/ziplofy.com/privkey.pem');
});
