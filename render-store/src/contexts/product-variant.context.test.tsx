import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StorefrontProductVariantProvider, useStorefrontProductVariants } from './product-variant.context';

vi.mock('../config/axios.config', () => ({
  axiosi: { get: vi.fn() },
}));

const TestConsumer = () => {
  const { variants, loading, fetchVariantsByProductId, clear } = useStorefrontProductVariants();
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="count">{variants.length}</span>
      <button onClick={() => fetchVariantsByProductId('p1')}>Fetch</button>
      <button onClick={() => clear()}>Clear</button>
    </div>
  );
};

describe('StorefrontProductVariantProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetchVariantsByProductId sets variants', async () => {
    const { axiosi } = await import('../config/axios.config');
    (axiosi.get as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { success: true, data: [{ _id: 'v1', sku: 'SKU1', price: 100 }], count: 1 },
    });

    render(
      <StorefrontProductVariantProvider>
        <TestConsumer />
      </StorefrontProductVariantProvider>
    );

    await userEvent.click(screen.getByText('Fetch'));

    await waitFor(() => {
      expect(screen.getByTestId('count')).toHaveTextContent('1');
    });
  });

  it('clear resets variants', async () => {
    const { axiosi } = await import('../config/axios.config');
    (axiosi.get as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { success: true, data: [{ _id: 'v1' }], count: 1 },
    });

    render(
      <StorefrontProductVariantProvider>
        <TestConsumer />
      </StorefrontProductVariantProvider>
    );

    await userEvent.click(screen.getByText('Fetch'));
    await waitFor(() => expect(screen.getByTestId('count')).toHaveTextContent('1'));

    await userEvent.click(screen.getByText('Clear'));
    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });
});
