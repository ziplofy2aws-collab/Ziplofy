import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toStoreMediaUploadResult } from './store-media-upload.ts';

const uploadedItem = {
  _id: 'm1',
  storeId: 's1',
  key: 'webpanel-stores/s1/media/screenshot.png',
  originalName: 'Screenshot.png',
  mimeType: 'image/png',
  size: 627950,
  url: '/api/stores/s1/media/file/webpanel-stores%2Fs1%2Fmedia%2Fscreenshot.png',
  createdAt: '2026-11-23T00:00:00.000Z',
};

// Mirrors what the backend returns on POST /api/stores/:id/media/upload (201)
// and what resolveStoreMediaUrl produces for library items.
test('successful upload exposes objectUrl — no false "Upload failed"', () => {
  const resolveUrl = (u) => `https://crm-backend.codiic.com${u.url}`;
  const result = toStoreMediaUploadResult(uploadedItem, resolveUrl);

  assert.equal(result.upload, uploadedItem);
  assert.equal(result.objectUrl, `https://crm-backend.codiic.com${uploadedItem.url}`);
  assert.equal(result.key, uploadedItem.key);
  assert.ok(result.objectUrl, 'objectUrl must be truthy so the picker guard passes');
});

test('objectUrl falls back to item.url when the resolver returns nothing', () => {
  const result = toStoreMediaUploadResult(uploadedItem, () => null);
  assert.equal(result.objectUrl, uploadedItem.url);
});

test('empty objectUrl is preserved so real failures still trigger "Upload failed"', () => {
  const broken = { ...uploadedItem, url: '' };
  const result = toStoreMediaUploadResult(broken, () => '');
  assert.equal(result.objectUrl, '');
});

test('objectUrl matches the URL a grid click would produce (Done selects correctly)', () => {
  // resolveUploadPreviewUrl in the picker maps list items through the same
  // resolver — a fresh upload must select identically.
  const resolveUploadPreviewUrl = (u) => `https://crm-backend.codiic.com${u.url}`;
  const listUrl = resolveUploadPreviewUrl(uploadedItem);
  const result = toStoreMediaUploadResult(uploadedItem, resolveUploadPreviewUrl);
  assert.equal(result.objectUrl, listUrl);
});

test('key survives empty/missing values', () => {
  const result = toStoreMediaUploadResult({ url: 'x.png' }, () => 'x.png');
  assert.equal(result.key, '');
  assert.equal(result.objectUrl, 'x.png');
});
