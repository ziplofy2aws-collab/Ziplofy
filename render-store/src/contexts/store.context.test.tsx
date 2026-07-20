import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { StorefrontProvider, useStorefront } from './store.context';

vi.mock('../config/axios.config', () => ({
  axiosi: { get: vi.fn() },
}));

vi.mock('./product.context', () => ({
  StorefrontProductProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const TestConsumer = () => {
  const { isStoreFront, storeFrontChecked, storeFrontMeta } = useStorefront();
  return (
    <div>
      <span data-testid="checked">{String(storeFrontChecked)}</span>
      <span data-testid="isStoreFront">{String(isStoreFront)}</span>
      <span data-testid="meta">{storeFrontMeta ? storeFrontMeta.name : 'null'}</span>
    </div>
  );
};

describe('StorefrontProvider', () => {
  beforeEach(() => {
    vi.resetModules();
    Object.defineProperty(window, 'location', {
      value: { hostname: 'mystore.example.com' },
      writable: true,
    });
  });

  it('resolves valid subdomain and sets store meta', async () => {
    const { axiosi } = await import('../config/axios.config');
    (axiosi.get as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        success: true,
        data: { storeId: 's1', name: 'My Store', description: 'Desc' },
      },
    });

    render(
      <StorefrontProvider>
        <TestConsumer />
      </StorefrontProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('checked')).toHaveTextContent('true');
    });

    await waitFor(() => {
      expect(screen.getByTestId('isStoreFront')).toHaveTextContent('true');
      expect(screen.getByTestId('meta')).toHaveTextContent('My Store');
    });
  });

  it('sets storeFrontChecked true when subdomain invalid', async () => {
    const { axiosi } = await import('../config/axios.config');
    (axiosi.get as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Not found'));

    render(
      <StorefrontProvider>
        <TestConsumer />
      </StorefrontProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('checked')).toHaveTextContent('true');
    });
    expect(screen.getByTestId('isStoreFront')).toHaveTextContent('false');
    expect(screen.getByTestId('meta')).toHaveTextContent('null');
  });
});
