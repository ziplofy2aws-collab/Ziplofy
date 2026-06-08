import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BuyXGetYProvider, useBuyXGetY } from './buy-x-get-y.context';

vi.mock('../config/axios.config', () => ({
  axiosi: { post: vi.fn() },
}));

const TestConsumer = () => {
  const { eligibleDiscounts, selectedGetsItems, setSelectedGetsItems, fetchEligibleDiscounts, clearAppliedAutomaticDiscount } = useBuyXGetY();
  return (
    <div>
      <span data-testid="count">{eligibleDiscounts.length}</span>
      <span data-testid="selected">{selectedGetsItems?.length ?? 0}</span>
      <button onClick={() => fetchEligibleDiscounts('s1', null, [{ quantity: 2, price: 100 }])}>Fetch</button>
      <button onClick={() => setSelectedGetsItems([{ productId: 'p1', productVariantId: 'v1', productTitle: 'T', productImage: null, originalPrice: 50, discountedPrice: 0, discountPerItem: 50, quantity: 1, discountType: 'free', discountTypeLabel: 'FREE', discountValue: null, savings: 50 }])}>
        Set
      </button>
      <button onClick={() => clearAppliedAutomaticDiscount()}>Clear</button>
    </div>
  );
};

describe('BuyXGetYProvider', () => {
  beforeEach(() => vi.clearAllMocks());

  it('throws when used outside provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow(/useBuyXGetY must be used within/);
    vi.restoreAllMocks();
  });

  it('fetchEligibleDiscounts fetches discounts', async () => {
    const { axiosi } = await import('../config/axios.config');
    (axiosi.post as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        success: true,
        data: {
          eligibleDiscounts: [{
            id: 'bxgy1',
            method: 'automatic',
            discountedValue: 'free',
            customerGetsQuantity: 1,
            maxUsesPerOrder: null,
            totalDiscountAmount: 50,
            getsItems: [],
            discountSummary: 'Buy X Get Y',
            message: '',
            combinations: { productDiscounts: true, orderDiscounts: true, shippingDiscounts: true },
          }],
          cartTotal: 200,
          totalQuantity: 2,
        },
      },
    });

    render(
      <BuyXGetYProvider>
        <TestConsumer />
      </BuyXGetYProvider>
    );

    expect(screen.getByTestId('count')).toHaveTextContent('0');
    await userEvent.click(screen.getByText('Fetch'));
    await waitFor(() => expect(screen.getByTestId('count')).toHaveTextContent('1'));
  });

  it('setSelectedGetsItems updates selected items', async () => {
    render(
      <BuyXGetYProvider>
        <TestConsumer />
      </BuyXGetYProvider>
    );
    expect(screen.getByTestId('selected')).toHaveTextContent('0');
    await userEvent.click(screen.getByText('Set'));
    expect(screen.getByTestId('selected')).toHaveTextContent('1');
  });
});
