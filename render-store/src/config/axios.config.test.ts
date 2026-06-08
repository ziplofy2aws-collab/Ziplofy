import { describe, expect, it, vi, beforeEach } from 'vitest';

type RequestUseHandler = (config: { headers: Record<string, string> }) => unknown;
type AxiosCreateConfig = Record<string, unknown>;
type AxiosCreateMock = (config?: AxiosCreateConfig) => {
  interceptors: { request: { use: ReturnType<typeof vi.fn> } };
};

describe('axios.config', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it('creates axios instance with baseURL `${VITE_API_URL}/api` and withCredentials true', async () => {
    vi.stubEnv('VITE_API_URL', 'https://api.example.com');

    const createSpy = vi.fn<AxiosCreateMock>(() => ({
      interceptors: { request: { use: vi.fn() } },
    }));

    vi.doMock('axios', () => ({
      default: { create: createSpy },
    }));

    vi.doMock('../types/local-storage', () => ({
      safeLocalStorage: { getItem: vi.fn(() => null) },
    }));

    await import('./axios.config');

    expect(createSpy).toHaveBeenCalledTimes(1);
    const configArg = (createSpy.mock.calls[0]?.[0] ?? {}) as AxiosCreateConfig;
    expect(configArg.baseURL).toBe('https://api.example.com/api');
    expect(configArg.withCredentials).toBe(true);
  });

  it('request interceptor adds Authorization header when accessToken exists', async () => {
    const requestUseSpy = vi.fn((fulfilled: RequestUseHandler) => fulfilled);
    const createSpy = vi.fn<AxiosCreateMock>(() => ({
      interceptors: { request: { use: requestUseSpy } },
    }));

    vi.doMock('axios', () => ({
      default: { create: createSpy },
    }));

    const getItem = vi.fn(() => 'tok123');
    vi.doMock('../types/local-storage', () => ({
      safeLocalStorage: { getItem },
    }));

    await import('./axios.config');

    expect(requestUseSpy).toHaveBeenCalledTimes(1);
    const fulfilled = requestUseSpy.mock.calls[0]?.[0];
    if (!fulfilled) {
      throw new Error('Missing request interceptor');
    }
    const cfg = { headers: {} as Record<string, string> };
    const out = (fulfilled as RequestUseHandler)(cfg) as typeof cfg;
    expect(out.headers.Authorization).toBe('Bearer tok123');
  });

  it('request interceptor leaves Authorization undefined when no token', async () => {
    const requestUseSpy = vi.fn((fulfilled: RequestUseHandler) => fulfilled);
    const createSpy = vi.fn<AxiosCreateMock>(() => ({
      interceptors: { request: { use: requestUseSpy } },
    }));

    vi.doMock('axios', () => ({
      default: { create: createSpy },
    }));

    const getItem = vi.fn(() => null);
    vi.doMock('../types/local-storage', () => ({
      safeLocalStorage: { getItem },
    }));

    await import('./axios.config');

    const fulfilled = requestUseSpy.mock.calls[0]?.[0];
    if (!fulfilled) {
      throw new Error('Missing request interceptor');
    }
    const cfg = { headers: {} as Record<string, string> };
    const out = (fulfilled as RequestUseHandler)(cfg) as typeof cfg;
    expect(out.headers.Authorization).toBeUndefined();
  });
});
