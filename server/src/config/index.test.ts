import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

const NODE_ENV = process.env.NODE_ENV;

describe('config', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    process.env.NODE_ENV = NODE_ENV;
  });

  it('allows localhost origins in development', async () => {
    process.env.NODE_ENV = 'development';
    const { config } = await import('./index.js');
    expect(config.allowedOrigins).toContain('http://localhost:3000');
    expect(config.allowedOrigins).toContain('http://localhost:5173');
  });

  it('allows production origin when not development', async () => {
    process.env.NODE_ENV = 'production';
    const { config } = await import('./index.js');
    expect(config.allowedOrigins).toContain('https://auth.ziplofy.com');
  });

  it('uses development config when NODE_ENV is unset', async () => {
    process.env.NODE_ENV = undefined;
    const { config } = await import('./index.js');
    expect(config.allowedOrigins).toContain('http://localhost:3000');
  });
});
