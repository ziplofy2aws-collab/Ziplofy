import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AmountOffOrderProvider, useAmountOffOrder } from './amount-off-order.context';

vi.mock('../config/axios.config', () => ({
  axiosi: { post: vi.fn() },
}));

const TestConsumer = () => {
  const { eligibleDiscounts, loading, fetchEligibleDiscounts, applyAutomaticDiscount, clearAppliedAutomaticDiscount } = useAmountOffOrder();
  return (
    <div>
      <span data-testid="count">{eligibleDiscounts.length}</span>
      <span data-testid="loading">{String(loading)}</span>
      <button onClick={() => fetchEligibleDiscounts('s1', null, [{ quantity: 1, price: 100 }])}>Fetch</button>
      <button onClick={() => applyAutomaticDiscount({ id: 'd1', method: 'automatic', valueType: 'fixed-amount', discountAmount: 10, message: 'ok', combinations: { productDiscounts: true, orderDiscounts: true, shippingDiscounts: true } })}>Apply</button>
      <button onClick={() => clearAppliedAutomaticDiscount()}>Clear</button>
    </div>
  );
};

describe('AmountOffOrderProvider', () => {
  beforeEach(() => vi.clearAllMocks());

  it('throws when used outside provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => {
      render(<TestConsumer />);
    }).toThrow(/useAmountOffOrder must be used within/);
    vi.restoreAllMocks();
  });

  it('fetchEligibleDiscounts fetches and sets discounts', async () => {
    const { axiosi } = await import('../config/axios.config');
    (axiosi.post as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        success: true,
        data: {
          eligibleDiscounts: [{ id: 'd1', method: 'automatic', discountAmount: 10 }],
          cartTotal: 100,
          totalQuantity: 1,
        },
      },
    });

    render(
      <AmountOffOrderProvider>
        <TestConsumer />
      </AmountOffOrderProvider>
    );

    expect(screen.getByTestId('count')).toHaveTextContent('0');
    await userEvent.click(screen.getByText('Fetch'));
    await waitFor(() => expect(screen.getByTestId('count')).toHaveTextContent('1'));
  });

  it('clearApplied does not clear eligible list from last fetch', async () => {
    const { axiosi } = await import('../config/axios.config');
    (axiosi.post as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { success: true, data: { eligibleDiscounts: [{ id: 'd1' }], cartTotal: 100, totalQuantity: 1 } },
    });

    render(
      <AmountOffOrderProvider>
        <TestConsumer />
      </AmountOffOrderProvider>
    );

    await userEvent.click(screen.getByText('Fetch'));
    await waitFor(() => expect(screen.getByTestId('count')).toHaveTextContent('1'));
    await userEvent.click(screen.getByText('Clear'));
    // clearAppliedAutomaticDiscount clears applied selection only; eligible list from fetch remains until next fetch
    await waitFor(() => expect(screen.getByTestId('count')).toHaveTextContent('1'));
  });
});
