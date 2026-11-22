import { beforeAll } from 'vitest';

process.env.SUPER_ADMIN_TOKEN =
  process.env.SUPER_ADMIN_TOKEN || 'test-super-admin-token';

beforeAll(() => {
  process.env.ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'test-secret-key-for-unit-tests';
});
