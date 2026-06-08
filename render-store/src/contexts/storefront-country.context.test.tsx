import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StorefrontCountryProvider, useStorefrontCountries } from './storefront-country.context';

vi.mock('../config/axios.config', () => ({
  axiosi: { get: vi.fn() },
}));

const TestConsumer = () => {
  const { countries, getCountries } = useStorefrontCountries();
  return (
    <div>
      <span data-testid="count">{countries.length}</span>
      <button onClick={() => getCountries({ limit: 100 })}>Fetch</button>
    </div>
  );
};

describe('StorefrontCountryProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getCountries fetches and sets countries', async () => {
    const { axiosi } = await import('../config/axios.config');
    (axiosi.get as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { success: true, data: [{ _id: 'c1', name: 'India', iso2: 'IN' }] },
    });

    render(
      <StorefrontCountryProvider>
        <TestConsumer />
      </StorefrontCountryProvider>
    );

    await userEvent.click(screen.getByText('Fetch'));

    await waitFor(() => {
      expect(screen.getByTestId('count')).toHaveTextContent('1');
    });
  });
});
