import '@testing-library/jest-dom';
import '@testing-library/jest-dom/vitest';

// Basic jsdom polyfills for tests
class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (typeof window !== 'undefined') {
  (window as any).IntersectionObserver = MockIntersectionObserver;

  if (!(window as any).matchMedia) {
    (window as any).matchMedia = () => ({
      matches: false,
      media: '',
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    });
  }

  // Always override localStorage with an in-memory implementation for tests
  const store: Record<string, string> = {};
  (window as any).localStorage = {
    getItem: (key: string) => (key in store ? store[key] : null),
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach(k => delete store[k]);
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
    get length() {
      return Object.keys(store).length;
    },
  };
}

