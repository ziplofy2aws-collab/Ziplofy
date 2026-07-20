import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AdminProtectedRoute from './AdminProtectedRoute';

vi.mock('../contexts/admin-auth.context', () => ({
  useAdminAuth: vi.fn(),
}));

import { useAdminAuth } from '../contexts/admin-auth.context';

describe('AdminProtectedRoute', () => {
  it('renders children when user and token exist', () => {
    (useAdminAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { id: '1', name: 'Test', email: 'test@example.com' },
      token: 'valid-token',
    });

    render(
      <MemoryRouter initialEntries={['/admin/dashboard']}>
        <Routes>
          <Route
            path="/admin/dashboard"
            element={
              <AdminProtectedRoute>
                <div data-testid="protected-content">Dashboard Content</div>
              </AdminProtectedRoute>
            }
          />
          <Route path="/admin/login" element={<div data-testid="login-page">Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
  });

  it('redirects to /admin/login when no token', () => {
    (useAdminAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { id: '1', name: 'Test', email: 'test@example.com' },
      token: null,
    });

    render(
      <MemoryRouter initialEntries={['/admin/dashboard']}>
        <Routes>
          <Route
            path="/admin/dashboard"
            element={
              <AdminProtectedRoute>
                <div data-testid="protected-content">Dashboard</div>
              </AdminProtectedRoute>
            }
          />
          <Route path="/admin/login" element={<div data-testid="login-page">Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('login-page')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('redirects to /admin/login when no user', () => {
    (useAdminAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      user: null,
      token: 'some-token',
    });

    render(
      <MemoryRouter initialEntries={['/admin/dashboard']}>
        <Routes>
          <Route
            path="/admin/dashboard"
            element={
              <AdminProtectedRoute>
                <div data-testid="protected-content">Dashboard</div>
              </AdminProtectedRoute>
            }
          />
          <Route path="/admin/login" element={<div data-testid="login-page">Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('login-page')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });
});
