import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FreeShippingProvider, useFreeShipping } from './storefront-free-shipping.context';

vi.mock('../config/axios.config', () => ({
  axiosi: { post: vi.fn() },
}));

const TestConsumer = () => {
  const { eligibleDiscounts, loading, checkEligibleFreeShippingDiscounts, applyAutomaticDiscount } = useFreeShipping();
  return (
    <div>
      <span data-testid="count">{eligibleDiscounts.length}</span>
      <span data-testid="loading">{String(loading)}</span>
      <button
        onClick={() =>
          checkEligibleFreeShippingDiscounts({
            storeId: 's1',
            customerId: 'c1',
            cartItems: [{ productId: 'p1', quantity: 1, price: 100 }],
          })
        }
      >
        Check
      </button>
      <button onClick={() => applyAutomaticDiscount({ id: 'fs1', method: 'automatic', message: 'Free ship', countrySelection: 'all-countries', excludeShippingRates: false, combinations: { productDiscounts: true, orderDiscounts: true } })}>
        Apply
      </button>
    </div>
  );
};

describe('FreeShippingProvider', () => {
  beforeEach(() => vi.clearAllMocks());

  it('throws when used outside provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow(/useFreeShipping must be used within/);
    vi.restoreAllMocks();
  });

  it('checkEligibleFreeShippingDiscounts fetches eligible discounts', async () => {
    const { axiosi } = await import('../config/axios.config');
    (axiosi.post as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { success: true, data: { eligibleDiscounts: [{ id: 'fs1', message: 'Free shipping' }] } },
    });

    render(
      <FreeShippingProvider>
        <TestConsumer />
      </FreeShippingProvider>
    );

    expect(screen.getByTestId('count')).toHaveTextContent('0');
    await userEvent.click(screen.getByText('Check'));
    await waitFor(() => expect(screen.getByTestId('count')).toHaveTextContent('1'));
  });
});
