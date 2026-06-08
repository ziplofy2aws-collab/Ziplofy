import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StorefrontProductProvider, useStorefrontProducts } from './product.context';

vi.mock('../config/axios.config', () => ({
  axiosi: { get: vi.fn() },
}));

const TestConsumer = () => {
  const { products, loading, fetchProductsByStoreId, fetchProductById } = useStorefrontProducts();
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="count">{products.length}</span>
      <button onClick={() => fetchProductsByStoreId({ storeId: 's1' })}>Fetch</button>
      <button onClick={() => fetchProductById('p1')}>FetchOne</button>
    </div>
  );
};

describe('StorefrontProductProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetchProductsByStoreId sets products', async () => {
    render(
      <StorefrontProductProvider>
        <TestConsumer />
      </StorefrontProductProvider>
    );
    const { axiosi } = await import('../config/axios.config');
    (axiosi.get as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        success: true,
        data: [{ _id: 'p1', title: 'Product 1' }],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1, hasNext: false, hasPrev: false },
      },
    });

    await userEvent.click(screen.getByText('Fetch'));

    await waitFor(() => {
      expect(screen.getByTestId('count')).toHaveTextContent('1');
    });
  });

  it('clearProductDetail clears product detail', async () => {
    const Consumer = () => {
      const { productDetail, fetchProductById, clearProductDetail } = useStorefrontProducts();
      return (
        <div>
          <span data-testid="detail">{productDetail ? productDetail.title : 'null'}</span>
          <button onClick={() => fetchProductById('p1')}>Fetch</button>
          <button onClick={() => clearProductDetail()}>Clear</button>
        </div>
      );
    };
    const { axiosi } = await import('../config/axios.config');
    (axiosi.get as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { success: true, data: { _id: 'p1', title: 'P1' } },
    });

    render(
      <StorefrontProductProvider>
        <Consumer />
      </StorefrontProductProvider>
    );

    await userEvent.click(screen.getByText('Fetch'));
    await waitFor(() => expect(screen.getByTestId('detail')).toHaveTextContent('P1'));

    await userEvent.click(screen.getByText('Clear'));
    await waitFor(() => expect(screen.getByTestId('detail')).toHaveTextContent('null'));
  });
});
