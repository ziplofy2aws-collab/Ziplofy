import { describe, expect, it, vi, beforeEach } from 'vitest';
import { validateEnv } from './env.utils';

describe('validateEnv', () => {
  const required = ['PORT', 'MONGO_URI', 'ACCESS_TOKEN_SECRET', 'REFRESH_TOKEN_SECRET', 'CLIENT_URL', 'GOOGLE_CLIENT_ID'];
  const env = process.env as Partial<Record<string, string>>;

  beforeEach(() => {
    required.forEach((k) => {
      process.env[k] = 'test-value';
    });
  });

  it('does not throw when all required vars are set', () => {
    expect(() => validateEnv()).not.toThrow();
  });

  it('throws when a required var is missing', () => {
    delete env.PORT;
    expect(() => validateEnv()).toThrow(/Missing required environment variables.*PORT/);
  });

  it('throws with all missing vars listed', () => {
    required.forEach((k) => {
      delete env[k];
    });
    expect(() => validateEnv()).toThrow(/Missing required environment variables/);
  });
});
