import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AmountOffProductProvider, useAmountOffProduct } from './amount-off-product.context';

vi.mock('../config/axios.config', () => ({
  axiosi: { post: vi.fn() },
}));

const TestConsumer = () => {
  const { eligibleDiscounts, loading, fetchEligibleDiscounts, clearAppliedAutomaticDiscount } = useAmountOffProduct();
  return (
    <div>
      <span data-testid="count">{eligibleDiscounts.length}</span>
      <span data-testid="loading">{String(loading)}</span>
      <button onClick={() => fetchEligibleDiscounts('s1', null, [{ quantity: 1, price: 50 }])}>Fetch</button>
      <button onClick={() => clearAppliedAutomaticDiscount()}>Clear</button>
    </div>
  );
};

describe('AmountOffProductProvider', () => {
  beforeEach(() => vi.clearAllMocks());

  it('throws when used outside provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow(/useAmountOffProduct must be used within/);
    vi.restoreAllMocks();
  });

  it('fetchEligibleDiscounts fetches and sets discounts', async () => {
    const { axiosi } = await import('../config/axios.config');
    (axiosi.post as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        success: true,
        data: {
          eligibleDiscounts: [{ id: 'd1', method: 'automatic', discountAmount: 5 }],
          cartTotal: 50,
          totalQuantity: 1,
        },
      },
    });

    render(
      <AmountOffProductProvider>
        <TestConsumer />
      </AmountOffProductProvider>
    );

    expect(screen.getByTestId('count')).toHaveTextContent('0');
    await userEvent.click(screen.getByText('Fetch'));
    await waitFor(() => expect(screen.getByTestId('count')).toHaveTextContent('1'));
  });
});
