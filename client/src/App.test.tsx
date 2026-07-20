import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

vi.mock('@react-oauth/google', () => ({
  GoogleOAuthProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="google-provider">{children}</div>
  ),
}));

vi.mock('./contexts/auth.context', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth-provider">{children}</div>
  ),
}));

vi.mock('./pages/login', () => ({
  default: () => <div>Login Page</div>,
}));

vi.mock('./pages/Register', () => ({
  default: () => <div>Register Page</div>,
}));

describe('App shell', () => {
  it('renders within Google and Auth providers', () => {
    window.history.pushState({}, '', '/login');
    render(<App />);
    expect(screen.getByTestId('google-provider')).toBeInTheDocument();
    expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
  });
});

