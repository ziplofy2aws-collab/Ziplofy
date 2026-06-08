import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const registerMock = vi.fn();
const googleLoginMock = vi.fn();
const toastErrorMock = vi.fn();

vi.mock('../contexts/auth.context', () => {
  return {
    useAuth: () => ({
      register: (...args: unknown[]) => registerMock(...args),
      googleLogin: (...args: unknown[]) => googleLoginMock(...args),
    }),
  };
});

vi.mock('react-hot-toast', () => ({
  default: {
    error: (...args: unknown[]) => toastErrorMock(...args),
  },
}));

let lastGoogleProps:
  | {
      onSuccess: (cred: { credential?: string | null }) => void;
      onError: () => void;
    }
  | undefined;

vi.mock('@react-oauth/google', () => ({
  GoogleLogin: (props: { onSuccess: (cred: { credential?: string | null }) => void; onError: () => void }) => {
    lastGoogleProps = props;
    return <button type="button">GoogleLoginMock</button>;
  },
}));

vi.mock('../components/SlantedImageCarouselWrapper', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="wrapper">{children}</div>,
}));

import Register from './Register';

describe('Register page', () => {
  beforeEach(() => {
    registerMock.mockReset();
    googleLoginMock.mockReset();
    toastErrorMock.mockReset();
    lastGoogleProps = undefined;
  });

  it('when passwords do not match, shows error and does not call register', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/full name/i), 'John');
    await user.type(screen.getByLabelText(/email address/i), 'a@b.com');
    await user.type(screen.getByLabelText(/^password$/i), 'pw1');
    await user.type(screen.getByLabelText(/confirm password/i), 'pw2');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
    expect(registerMock).not.toHaveBeenCalled();
  });

  it('submitting valid form calls register(name, email, password)', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/full name/i), 'John');
    await user.type(screen.getByLabelText(/email address/i), 'a@b.com');
    await user.type(screen.getByLabelText(/^password$/i), 'pw');
    await user.type(screen.getByLabelText(/confirm password/i), 'pw');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(registerMock).toHaveBeenCalledWith('John', 'a@b.com', 'pw');
  });

  it('shows API error banner when register throws', async () => {
    const user = userEvent.setup();
    registerMock.mockRejectedValueOnce({ response: { data: { message: 'Nope' } } });

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/full name/i), 'John');
    await user.type(screen.getByLabelText(/email address/i), 'a@b.com');
    await user.type(screen.getByLabelText(/^password$/i), 'pw');
    await user.type(screen.getByLabelText(/confirm password/i), 'pw');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByText('Nope')).toBeInTheDocument();
  });

  it('GoogleLogin onSuccess without credential shows toast error and does not call googleLogin', () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    lastGoogleProps!.onSuccess({ credential: null });

    expect(toastErrorMock).toHaveBeenCalledWith('Google JWT token is required');
    expect(googleLoginMock).not.toHaveBeenCalled();
  });

  it('GoogleLogin onSuccess calls googleLogin(credential)', () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    lastGoogleProps!.onSuccess({ credential: 'jwt123' });

    expect(googleLoginMock).toHaveBeenCalledWith('jwt123');
  });

  it('renders link to /login', () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    const link = screen.getByRole('link', { name: /sign in/i });
    expect(link).toHaveAttribute('href', '/login');
  });
});

