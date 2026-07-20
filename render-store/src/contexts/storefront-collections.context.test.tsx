import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StorefrontCollectionsProvider, useStorefrontCollections } from './storefront-collections.context';

vi.mock('../config/axios.config', () => ({
  axiosi: { get: vi.fn() },
}));

const TestConsumer = () => {
  const {
    collections,
    activeCollection,
    products,
    fetchCollectionsByStoreId,
    getCollectionDetailsByUrlHandle,
    fetchProductsInCollectionByUrlHandle,
  } = useStorefrontCollections();
  return (
    <div>
      <span data-testid="collections">{collections.length}</span>
      <span data-testid="active">{activeCollection?.title ?? ''}</span>
      <span data-testid="products">{products.length}</span>
      <button onClick={() => fetchCollectionsByStoreId('s1')}>FetchCollections</button>
      <button onClick={() => getCollectionDetailsByUrlHandle('s1', 'home-page')}>FetchDetails</button>
      <button onClick={() => fetchProductsInCollectionByUrlHandle('s1', 'home-page')}>
        FetchProducts
      </button>
    </div>
  );
};

describe('StorefrontCollectionsProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetchCollectionsByStoreId sets collections', async () => {
    const { axiosi } = await import('../config/axios.config');
    (axiosi.get as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: [{ _id: 'c1', title: 'Collection 1', urlHandle: 'c1' }] },
    });

    render(
      <StorefrontCollectionsProvider>
        <TestConsumer />
      </StorefrontCollectionsProvider>
    );

    await userEvent.click(screen.getByText('FetchCollections'));

    await waitFor(() => {
      expect(screen.getByTestId('collections')).toHaveTextContent('1');
    });
  });

  it('getCollectionDetailsByUrlHandle sets activeCollection', async () => {
    const { axiosi } = await import('../config/axios.config');
    (axiosi.get as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { _id: 'c1', title: 'Home page', urlHandle: 'home-page' } },
    });

    render(
      <StorefrontCollectionsProvider>
        <TestConsumer />
      </StorefrontCollectionsProvider>
    );

    await userEvent.click(screen.getByText('FetchDetails'));

    await waitFor(() => {
      expect(screen.getByTestId('active')).toHaveTextContent('Home page');
    });

    expect(axiosi.get).toHaveBeenCalledWith(
      '/storefront/collections/store/s1/url-handle/home-page'
    );
  });

  it('fetchProductsInCollectionByUrlHandle sets products', async () => {
    const { axiosi } = await import('../config/axios.config');
    (axiosi.get as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: [{ _id: 'p1', title: 'Product 1' }], orderDiscount: null },
    });

    render(
      <StorefrontCollectionsProvider>
        <TestConsumer />
      </StorefrontCollectionsProvider>
    );

    await userEvent.click(screen.getByText('FetchProducts'));

    await waitFor(() => {
      expect(screen.getByTestId('products')).toHaveTextContent('1');
    });

    expect(axiosi.get).toHaveBeenCalledWith(
      '/storefront/collections/store/s1/url-handle/home-page/products',
      expect.objectContaining({ params: expect.any(Object) })
    );
  });
});
