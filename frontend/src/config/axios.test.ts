import { describe, it, expect, vi, beforeEach } from 'vitest';

const store: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => {
    store[key] = value;
  },
  removeItem: (key: string) => {
    delete store[key];
  },
};

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('axios config', () => {
  beforeEach(() => {
    Object.keys(store).forEach((k) => delete store[k]);
  });

  it('exports an axios instance with request method', async () => {
    const axiosi = (await import('./axios')).default;
    expect(axiosi).toBeDefined();
    expect(typeof axiosi.get).toBe('function');
    expect(typeof axiosi.post).toBe('function');
  });

  it('request interceptor adds Authorization when admin_token exists', async () => {
    store['admin_token'] = 'test-jwt-xyz';

    const axiosi = (await import('./axios')).default;
    let capturedConfig: any = null;
    const originalAdapter = axiosi.defaults.adapter;
    axiosi.defaults.adapter = (config) => {
      capturedConfig = config;
      return Promise.resolve({ data: {}, status: 200, statusText: 'OK', headers: {}, config });
    };

    await axiosi.get('/auth/me');

    expect(capturedConfig).toBeDefined();
    expect(capturedConfig.headers.Authorization).toBe('Bearer test-jwt-xyz');
  });

  it('request interceptor does not add Authorization when no token', async () => {
    expect(store['admin_token']).toBeUndefined();

    const axiosi = (await import('./axios')).default;
    let capturedConfig: any = null;
    axiosi.defaults.adapter = (config) => {
      capturedConfig = config;
      return Promise.resolve({ data: {}, status: 200, statusText: 'OK', headers: {}, config });
    };

    await axiosi.get('/auth/me');

    expect(capturedConfig).toBeDefined();
    expect(capturedConfig.headers?.Authorization).toBeUndefined();
  });

  it('response interceptor clears localStorage on 401', async () => {
    store['admin_token'] = 'token';
    store['userData'] = '{}';
    store['userRole'] = 'admin';

    const axiosi = (await import('./axios')).default;
    axiosi.defaults.adapter = () =>
      Promise.reject({
        response: { status: 401, data: {} },
        isAxiosError: true,
      });

    await expect(axiosi.get('/auth/me')).rejects.toBeDefined();

    expect(store['admin_token']).toBeUndefined();
    expect(store['userData']).toBeUndefined();
    expect(store['userRole']).toBeUndefined();
  });
});
