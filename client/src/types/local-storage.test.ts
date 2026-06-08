import { describe, expect, it, beforeEach } from 'vitest';
import { safeLocalStorage, typedLocalStorage } from './local-storage';

describe('safeLocalStorage', () => {
  beforeEach(() => {
    // provide a simple in-memory implementation so tests are deterministic
    const store = new Map<string, string>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).localStorage = {
      getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
      setItem: (k: string, v: string) => {
        store.set(k, String(v));
      },
      removeItem: (k: string) => {
        store.delete(k);
      },
      clear: () => {
        store.clear();
      },
    };
  });

  it('sets and gets values', () => {
    safeLocalStorage.setItem('accessToken', 'abc');
    expect(safeLocalStorage.getItem('accessToken')).toBe('abc');
  });

  it('removes values', () => {
    safeLocalStorage.setItem('user', 'u1');
    safeLocalStorage.removeItem('user');
    expect(safeLocalStorage.getItem('user')).toBeNull();
  });

  it('clears all values', () => {
    safeLocalStorage.setItem('accessToken', 'abc');
    safeLocalStorage.setItem('user', 'u1');
    safeLocalStorage.clear();
    expect(safeLocalStorage.getItem('accessToken')).toBeNull();
    expect(safeLocalStorage.getItem('user')).toBeNull();
  });
});

describe('typedLocalStorage', () => {
  it('behaves like safeLocalStorage', () => {
    typedLocalStorage.setItem('accessToken', 'xyz');
    expect(typedLocalStorage.getItem('accessToken')).toBe('xyz');
    typedLocalStorage.removeItem('accessToken');
    expect(typedLocalStorage.getItem('accessToken')).toBeNull();
  });
});

