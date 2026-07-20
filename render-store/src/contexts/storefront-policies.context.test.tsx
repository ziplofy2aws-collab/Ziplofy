import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StorefrontPoliciesProvider, useStorefrontPolicies } from './storefront-policies.context';

vi.mock('../config/axios.config', () => ({
  axiosi: { get: vi.fn() },
}));

const mockPolicies = {
  returnRefund: { content: '<p>Return policy</p>', updatedAt: '2026-01-01T00:00:00.000Z' },
  privacy: { content: '<p>Privacy policy</p>', updatedAt: '2026-01-01T00:00:00.000Z' },
  terms: null,
  shipping: null,
  contact: null,
};

const TestConsumer = () => {
  const { policies, fetchByStoreId, getPolicyByType } = useStorefrontPolicies();
  return (
    <div>
      <span data-testid="privacy">{getPolicyByType('privacy')?.content ?? ''}</span>
      <span data-testid="terms">{getPolicyByType('terms')?.content ?? 'missing'}</span>
      <span data-testid="loaded">{policies ? 'yes' : 'no'}</span>
      <button type="button" onClick={() => fetchByStoreId('store-1')}>
        FetchAll
      </button>
    </div>
  );
};

describe('StorefrontPoliciesProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetchByStoreId loads all written policies for a store', async () => {
    const { axiosi } = await import('../config/axios.config');
    (axiosi.get as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { success: true, data: mockPolicies },
    });

    render(
      <StorefrontPoliciesProvider>
        <TestConsumer />
      </StorefrontPoliciesProvider>
    );

    await userEvent.click(screen.getByText('FetchAll'));

    await waitFor(() => {
      expect(screen.getByTestId('loaded')).toHaveTextContent('yes');
      expect(screen.getByTestId('privacy')).toHaveTextContent('<p>Privacy policy</p>');
      expect(screen.getByTestId('terms')).toHaveTextContent('missing');
    });

    expect(axiosi.get).toHaveBeenCalledWith('/storefront/policies/store/store-1');
  });
});
