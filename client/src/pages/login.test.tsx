import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const loginMock = vi.fn();
const googleLoginMock = vi.fn();

vi.mock('../contexts/auth.context', () => {
  return {
    useAuth: () => ({
      login: (...args: unknown[]) => loginMock(...args),
      googleLogin: (...args: unknown[]) => googleLoginMock(...args),
    }),
  };
});

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

import Login from './login';

describe('Login page', () => {
  beforeEach(() => {
    loginMock.mockReset();
    googleLoginMock.mockReset();
    lastGoogleProps = undefined;
  });

  it('submitting form calls login(email, password)', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/email address/i), 'a@b.com');
    await user.type(screen.getByLabelText(/password/i), 'pw');
    await user.click(screen.getByRole('button', { name: /^sign in$/i }));

    expect(loginMock).toHaveBeenCalledWith('a@b.com', 'pw');
  });

  it('while submitting, disables the submit button and shows "Signing in..."', async () => {
    const user = userEvent.setup();
    let resolve!: () => void;
    loginMock.mockImplementation(() => new Promise<void>((r) => (resolve = r)));

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/email address/i), 'a@b.com');
    await user.type(screen.getByLabelText(/password/i), 'pw');
    await user.click(screen.getByRole('button', { name: /^sign in$/i }));

    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();

    resolve();
  });

  it('GoogleLogin onSuccess with missing credential shows error', async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(lastGoogleProps).toBeDefined();
    lastGoogleProps!.onSuccess({ credential: null });

    expect(await screen.findByText(/google jwt token is required/i)).toBeInTheDocument();
    expect(googleLoginMock).not.toHaveBeenCalled();
  });

  it('GoogleLogin onSuccess calls googleLogin(credential)', async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    lastGoogleProps!.onSuccess({ credential: 'jwt123' });

    expect(googleLoginMock).toHaveBeenCalledWith('jwt123');
  });

  it('GoogleLogin onError shows "Google sign-in failed"', async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    lastGoogleProps!.onError();

    expect(await screen.findByText(/google sign-in failed/i)).toBeInTheDocument();
  });

  it('renders link to /register', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const link = screen.getByRole('link', { name: /sign up/i });
    expect(link).toHaveAttribute('href', '/register');
  });
});

