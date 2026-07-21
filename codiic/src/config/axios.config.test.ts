import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('axios', () => {
  const create = vi.fn(() => ({
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  }));
  return {
    default: { create },
  };
});

describe('axios.config', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('creates axios instance with withCredentials and timeout', async () => {
    const axios = await import('axios');
    const createSpy = vi.spyOn(axios.default, 'create');

    await import('./axios.config');

    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        withCredentials: true,
        timeout: 10000,
      }),
    );
  });
});

