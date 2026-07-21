import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { UserProvider, useUserContext } from './user.context';

vi.mock('../config/axios.config', () => ({
  axiosi: {
    get: vi.fn(),
  },
}));

const TestConsumer = () => {
  const { loggedInUser, fetchLoggedInUser } = useUserContext();
  return (
    <div>
      <span data-testid="email">{loggedInUser?.email ?? 'null'}</span>
      <button onClick={fetchLoggedInUser}>fetch</button>
    </div>
  );
};

describe('UserProvider / useUserContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.replaceState({}, '', '/');
    window.localStorage.clear();
  });

  it('stores accessToken from URL and removes it from query string', async () => {
    window.history.replaceState({}, '', '/?accessToken=abc123');
    const { axiosi } = await import('../config/axios.config');
    (axiosi.get as any).mockResolvedValue({ data: { email: 'test@example.com' } });

    render(
      <UserProvider>
        <TestConsumer />
      </UserProvider>,
    );

    await waitFor(() => expect(localStorage.getItem('accessToken')).toBe('abc123'));
    expect(window.location.search).toBe('');
  });

  it('fetchLoggedInUser populates loggedInUser on success', async () => {
    const { axiosi } = await import('../config/axios.config');
    (axiosi.get as any).mockResolvedValue({ data: { email: 'user@test.com' } });
    localStorage.setItem('accessToken', 'tok');

    render(
      <UserProvider>
        <TestConsumer />
      </UserProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('email').textContent).toBe('user@test.com'));
  });

  it('throws if useUserContext is used outside provider', () => {
    const Bad = () => {
      useUserContext();
      return null;
    };
    expect(() => render(<Bad />)).toThrow(/useUser must be used within a UserProvider/);
  });
});

