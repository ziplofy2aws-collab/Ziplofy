import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { StoreProvider, useStore, type Store } from './store.context';

vi.mock('../config/axios.config', () => ({
  axiosi: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

const TestConsumer = () => {
  const { stores, activeStoreId, fetchStores } = useStore();
  return (
    <div>
      <span data-testid="count">{stores.length}</span>
      <span data-testid="active">{activeStoreId ?? 'null'}</span>
      <button onClick={fetchStores}>fetch</button>
    </div>
  );
};

describe('StoreProvider / useStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('fetchStores populates stores and sets first as active', async () => {
    const stores: Store[] = [
      { _id: 's1', userId: 'u1', storeName: 'S1', storeDescription: 'D1', defaultLocation: null, createdAt: '', updatedAt: '' },
      { _id: 's2', userId: 'u1', storeName: 'S2', storeDescription: 'D2', defaultLocation: null, createdAt: '', updatedAt: '' },
    ];
    const { axiosi } = await import('../config/axios.config');
    (axiosi.get as any).mockResolvedValue({ data: { success: true, data: stores, count: 2 } });

    render(
      <StoreProvider>
        <TestConsumer />
      </StoreProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('count').textContent).toBe('2'));
    expect(screen.getByTestId('active').textContent).toBe('s1');
  });

  it('throws if useStore is used outside provider', () => {
    const Bad = () => {
      useStore();
      return null;
    };
    expect(() => render(<Bad />)).toThrow(/useStore must be used within a StoreProvider/);
  });
});

