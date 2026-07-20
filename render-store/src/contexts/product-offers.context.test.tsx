import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductOffersProvider, useProductOffers } from './product-offers.context';

vi.mock('../config/axios.config', () => ({
  axiosi: { get: vi.fn() },
}));

const TestConsumer = () => {
  const { freeShippingOffers, loading, fetchFreeShippingOffersForProduct, clear } = useProductOffers();
  return (
    <div>
      <span data-testid="count">{freeShippingOffers.length}</span>
      <span data-testid="loading">{String(loading)}</span>
      <button onClick={() => fetchFreeShippingOffersForProduct('p1', null)}>Fetch</button>
      <button onClick={() => clear()}>Clear</button>
    </div>
  );
};

describe('ProductOffersProvider', () => {
  beforeEach(() => vi.clearAllMocks());

  it('throws when used outside provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow(/useProductOffers must be used within/);
    vi.restoreAllMocks();
  });

  it('fetchFreeShippingOffersForProduct fetches offers', async () => {
    const { axiosi } = await import('../config/axios.config');
    (axiosi.get as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        success: true,
        data: {
          productId: 'p1',
          freeShippingOffers: [{ id: 'o1', method: 'automatic' }],
        },
      },
    });

    render(
      <ProductOffersProvider>
        <TestConsumer />
      </ProductOffersProvider>
    );

    expect(screen.getByTestId('count')).toHaveTextContent('0');
    await userEvent.click(screen.getByText('Fetch'));
    await waitFor(() => expect(screen.getByTestId('count')).toHaveTextContent('1'));
  });

  it('clear resets all offers', async () => {
    const { axiosi } = await import('../config/axios.config');
    (axiosi.get as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { success: true, data: { productId: 'p1', freeShippingOffers: [{ id: 'o1' }] } },
    });

    render(
      <ProductOffersProvider>
        <TestConsumer />
      </ProductOffersProvider>
    );

    await userEvent.click(screen.getByText('Fetch'));
    await waitFor(() => expect(screen.getByTestId('count')).toHaveTextContent('1'));
    await userEvent.click(screen.getByText('Clear'));
    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });
});
