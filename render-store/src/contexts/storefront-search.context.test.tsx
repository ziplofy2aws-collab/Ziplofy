import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StorefrontSearchProvider, useStorefrontSearch } from './storefront-search.context';

vi.mock('../config/axios.config', () => ({
  axiosi: { get: vi.fn() },
}));

const TestConsumer = () => {
  const { products, loading, searchProducts, searchValue } = useStorefrontSearch();
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="count">{products.length}</span>
      <span data-testid="value">{searchValue}</span>
      <button
        onClick={() => searchProducts({ storeId: '507f1f77bcf86cd799439011', q: 'shirt' })}
      >
        Search
      </button>
    </div>
  );
};

describe('StorefrontSearchProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('searchProducts calls storefront search API and sets products', async () => {
    render(
      <StorefrontSearchProvider>
        <TestConsumer />
      </StorefrontSearchProvider>
    );
    const { axiosi } = await import('../config/axios.config');
    (axiosi.get as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        success: true,
        data: [{ _id: 'p1', title: 'Shirt' }],
        query: 'shirt',
        pagination: {
          page: 1,
          limit: 24,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      },
    });

    await userEvent.click(screen.getByText('Search'));

    await waitFor(() => {
      expect(screen.getByTestId('count')).toHaveTextContent('1');
      expect(screen.getByTestId('value')).toHaveTextContent('shirt');
    });

    expect(axiosi.get).toHaveBeenCalledWith(
      '/storefront/products/store/507f1f77bcf86cd799439011/search',
      { params: { q: 'shirt', page: 1, limit: 24 } }
    );
  });
});
