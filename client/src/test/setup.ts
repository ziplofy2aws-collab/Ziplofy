import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Ensure test-friendly window location by default
Object.defineProperty(window, 'location', {
  value: new URL('https://client.test/login'),
  writable: true,
});

// Basic IntersectionObserver stub (in case components add one later)
class MockIntersectionObserver {
  callback: IntersectionObserverCallback;
  options?: IntersectionObserverInit;
  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.callback = callback;
    this.options = options;
  }
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

// @ts-expect-error global assignment for tests
globalThis.IntersectionObserver = MockIntersectionObserver;

