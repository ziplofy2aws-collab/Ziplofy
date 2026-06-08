import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StorefrontCartProvider, useStorefrontCart } from './storefront-cart.context';
import { StorefrontAuthProvider } from './storefront-auth.context';

vi.mock('../config/axios.config', () => ({
  axiosi: { post: vi.fn(), get: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

vi.mock('react-hot-toast', () => ({ default: { success: vi.fn(), error: vi.fn(), dismiss: vi.fn() } }));

const variant = {
  _id: 'v1',
  price: 100,
  sku: 'SKU1',
  optionValues: {},
  images: [],
  productId: 'p1',
  barcode: null,
  chargeTax: false,
  createdAt: '',
  updatedAt: '',
};

const TestConsumer = () => {
  const { guestItems, items, createCartEntry, getAllItems } = useStorefrontCart();
  const list = guestItems.length ? guestItems : items;
  return (
    <div>
      <span data-testid="count">{list.length}</span>
      <span data-testid="all">{getAllItems().length}</span>
      <button onClick={() => createCartEntry({ storeId: 's1', productVariantId: 'v1' }, variant)}>Add</button>
    </div>
  );
};

describe('StorefrontCartProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    try {
      localStorage?.removeItem?.('ziplofy_guest_cart');
    } catch {
      // ignore
    }
  });

  it('guest: createCartEntry adds to guest cart', async () => {
    render(
      <StorefrontAuthProvider>
        <StorefrontCartProvider>
          <TestConsumer />
        </StorefrontCartProvider>
      </StorefrontAuthProvider>
    );

    await userEvent.click(screen.getByText('Add'));

    await waitFor(() => {
      expect(screen.getByTestId('count')).toHaveTextContent('1');
    });
  });

  it('getAllItems returns guest items when not logged in', async () => {
    render(
      <StorefrontAuthProvider>
        <StorefrontCartProvider>
          <TestConsumer />
        </StorefrontCartProvider>
      </StorefrontAuthProvider>
    );

    await userEvent.click(screen.getByText('Add'));
    await waitFor(() => expect(screen.getByTestId('all')).toHaveTextContent('1'));
  });
});
