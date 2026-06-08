import { describe, expect, it, beforeEach } from 'vitest';
import { safeLocalStorage } from './local-storage';

describe('safeLocalStorage', () => {
  beforeEach(() => {
    // reset underlying storage between tests
    safeLocalStorage.clear();
  });

  it('sets and gets values when window.localStorage is available', () => {
    safeLocalStorage.setItem('accessToken', 'abc');
    expect(safeLocalStorage.getItem('accessToken')).toBe('abc');
  });

  it('removes values', () => {
    safeLocalStorage.setItem('ziplofy_guest_cart', 'cart-data');
    safeLocalStorage.removeItem('ziplofy_guest_cart');
    expect(safeLocalStorage.getItem('ziplofy_guest_cart')).toBeNull();
  });

  it('clear removes all keys', () => {
    safeLocalStorage.setItem('accessToken', 'abc');
    safeLocalStorage.setItem('ziplofy_guest_cart', 'cart-data');
    safeLocalStorage.clear();
    expect(safeLocalStorage.getItem('accessToken')).toBeNull();
    expect(safeLocalStorage.getItem('ziplofy_guest_cart')).toBeNull();
  });
});
