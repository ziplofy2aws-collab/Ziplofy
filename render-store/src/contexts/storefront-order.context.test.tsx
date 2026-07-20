import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StorefrontOrderProvider, useStorefrontOrder } from './storefront-order.context';
import { StorefrontAuthProvider } from './storefront-auth.context';

vi.mock('../config/axios.config', () => ({
  axiosi: { post: vi.fn(), get: vi.fn() },
}));

const TestConsumer = () => {
  const { orders, getOrdersByCustomerId } = useStorefrontOrder();
  return (
    <div>
      <span data-testid="count">{orders.length}</span>
      <button onClick={() => getOrdersByCustomerId('c1')}>Fetch</button>
    </div>
  );
};

describe('StorefrontOrderProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getOrdersByCustomerId fetches and sets orders', async () => {
    const { axiosi } = await import('../config/axios.config');
    (axiosi.get as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { success: true, data: [{ _id: 'o1', total: 100 }] },
    });

    render(
      <StorefrontAuthProvider>
        <StorefrontOrderProvider>
          <TestConsumer />
        </StorefrontOrderProvider>
      </StorefrontAuthProvider>
    );

    await userEvent.click(screen.getByText('Fetch'));

    await waitFor(() => {
      expect(screen.getByTestId('count')).toHaveTextContent('1');
    });
  });
});
