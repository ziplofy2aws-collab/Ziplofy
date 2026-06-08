import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CustomerAddressProvider, useCustomerAddresses } from './customer-address-storefront.context';
import { StorefrontAuthProvider } from './storefront-auth.context';

vi.mock('../config/axios.config', () => ({
  axiosi: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

const TestConsumer = () => {
  const { addresses, fetchCustomerAddressesByCustomerId, addCustomerAddress } = useCustomerAddresses();
  return (
    <div>
      <span data-testid="count">{addresses.length}</span>
      <button onClick={() => fetchCustomerAddressesByCustomerId('c1')}>Fetch</button>
      <button
        onClick={() =>
          addCustomerAddress({
            customerId: 'c1',
            firstName: 'Jane',
            lastName: 'Doe',
            address: '123 Main St',
            city: 'Mumbai',
            state: 'MH',
            pinCode: '400001',
            phoneNumber: '9876543210',
          })
        }
      >
        Add
      </button>
    </div>
  );
};

describe('CustomerAddressProvider', () => {
  beforeEach(() => vi.clearAllMocks());

  it('throws when used outside provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow(/useCustomerAddresses must be used within/);
    vi.restoreAllMocks();
  });

  it('fetchCustomerAddressesByCustomerId fetches addresses', async () => {
    const { axiosi } = await import('../config/axios.config');
    (axiosi.get as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { success: true, data: [{ _id: 'a1', firstName: 'John', lastName: 'Doe', address: '123 St', city: 'Mum', state: 'MH', pinCode: '400001', phoneNumber: '999' }], count: 1 },
    });

    render(
      <StorefrontAuthProvider>
        <CustomerAddressProvider>
          <TestConsumer />
        </CustomerAddressProvider>
      </StorefrontAuthProvider>
    );

    expect(screen.getByTestId('count')).toHaveTextContent('0');
    await userEvent.click(screen.getByText('Fetch'));
    await waitFor(() => expect(screen.getByTestId('count')).toHaveTextContent('1'));
  });

  it('addCustomerAddress adds address', async () => {
    const { axiosi } = await import('../config/axios.config');
    (axiosi.post as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        success: true,
        data: {
          _id: 'a2',
          customerId: 'c1',
          firstName: 'Jane',
          lastName: 'Doe',
          address: '123 Main St',
          city: 'Mumbai',
          state: 'MH',
          pinCode: '400001',
          phoneNumber: '9876543210',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          countryId: 'in1',
          company: '',
          apartment: '',
          addressType: 'home',
        },
      },
    });

    render(
      <StorefrontAuthProvider>
        <CustomerAddressProvider>
          <TestConsumer />
        </CustomerAddressProvider>
      </StorefrontAuthProvider>
    );

    await userEvent.click(screen.getByText('Add'));
    await waitFor(() => expect(screen.getByTestId('count')).toHaveTextContent('1'));
  });
});
