import { describe, expect, it, vi, beforeEach } from 'vitest';

/**
 * Tests the IIFE in main.tsx that runs before React mounts.
 * It handles ?logout=true by clearing the token and stripping it from the URL.
 */

// --- Helpers ---

function setFakeUrl(url: string) {
  const w = window as unknown as { location?: { href: string } };
  delete w.location;
  w.location = { href: url };
}

function createFakeLocalStorage() {
  const store = new Map<string, string>();
  const fake = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => store.set(k, v),
    removeItem: (k: string) => store.delete(k),
    clear: () => store.clear(),
  };
  Object.defineProperty(window, 'localStorage', { value: fake, configurable: true });
  return fake;
}

function mockReactAndApp() {
  vi.doMock('react-dom/client', () => ({ createRoot: () => ({ render: vi.fn() }) }));
  vi.doMock('./App.tsx', () => ({ default: () => null }));
}

async function runPreBootCode() {
  mockReactAndApp();
  await import('./main.tsx');
}

// --- Tests ---

describe('main.tsx pre-boot logout handler', () => {
  let localStorageMock: ReturnType<typeof createFakeLocalStorage>;

  beforeEach(() => {
    vi.resetModules();
    localStorageMock = createFakeLocalStorage();
    document.body.innerHTML = '<div id="root"></div>';
  });

  it('with ?logout=true: removes token and strips param from URL', async () => {
    setFakeUrl('http://localhost:3000/login?logout=true');
    localStorageMock.setItem('accessToken', 'fake-token');

    const removeItemSpy = vi.spyOn(localStorageMock, 'removeItem');
    const replaceStateSpy = vi.spyOn(window.history, 'replaceState');

    await runPreBootCode();

    expect(removeItemSpy).toHaveBeenCalledWith('accessToken');
    expect(replaceStateSpy).toHaveBeenCalledTimes(1);
    const newUrl = replaceStateSpy.mock.calls[0]?.[2];
    expect(newUrl).not.toContain('logout=true');
  });

  it('without logout param: does nothing', async () => {
    setFakeUrl('http://localhost:3000/login');
    const removeItemSpy = vi.spyOn(localStorageMock, 'removeItem');
    const replaceStateSpy = vi.spyOn(window.history, 'replaceState');

    await runPreBootCode();

    expect(removeItemSpy).not.toHaveBeenCalled();
    expect(replaceStateSpy).not.toHaveBeenCalled();
  });
});
