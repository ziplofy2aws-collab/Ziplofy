import { describe, expect, it } from 'vitest';
import { formatINR } from './currency';

describe('formatINR', () => {
  it('formats whole rupees correctly', () => {
    expect(formatINR(10000)).toBe('₹100.00');
    expect(formatINR(0)).toBe('₹0.00');
  });

  it('formats rupees with paise correctly', () => {
    expect(formatINR(10050)).toBe('₹100.50');
    expect(formatINR(12345)).toBe('₹123.45');
  });
});
