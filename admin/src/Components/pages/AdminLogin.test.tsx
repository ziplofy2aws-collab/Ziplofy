import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import AdminLogin from './AdminLogin';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../contexts/admin-auth.context', () => ({
  useAdminAuth: vi.fn(),
}));

import { useAdminAuth } from '../../contexts/admin-auth.context';

describe('AdminLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useAdminAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      login: vi.fn(),
      verifyOtp: vi.fn(),
      loading: false,
    });
  });

  it('renders email and password fields and submit button', () => {
    render(
      <MemoryRouter>
        <AdminLogin />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByText('Admin Login')).toBeInTheDocument();
  });

  it('calls login with email and password on form submit', async () => {
    const mockLogin = vi.fn().mockResolvedValue(undefined);
    (useAdminAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      login: mockLogin,
      verifyOtp: vi.fn(),
      loading: false,
    });

    render(
      <MemoryRouter>
        <AdminLogin />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await userEvent.type(emailInput, 'admin@example.com');
    await userEvent.type(passwordInput, 'password123');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('admin@example.com', 'password123');
    });
  });

  it('navigates to dashboard on successful login', async () => {
    const mockLogin = vi.fn().mockResolvedValue(undefined);
    (useAdminAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      login: mockLogin,
      verifyOtp: vi.fn(),
      loading: false,
    });

    render(
      <MemoryRouter>
        <AdminLogin />
      </MemoryRouter>
    );

    await userEvent.type(screen.getByLabelText(/email/i), 'admin@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/admin/dashboard');
    });
  });

  it('displays error when login fails', async () => {
    const mockLogin = vi.fn().mockRejectedValue({ response: { data: { message: 'Invalid credentials' } } });
    (useAdminAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      login: mockLogin,
      verifyOtp: vi.fn(),
      loading: false,
    });

    render(
      <MemoryRouter>
        <AdminLogin />
      </MemoryRouter>
    );

    await userEvent.type(screen.getByLabelText(/email/i), 'wrong@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'wrongpass');
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('disables submit button when loading', () => {
    (useAdminAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      login: vi.fn(),
      verifyOtp: vi.fn(),
      loading: true,
    });

    render(
      <MemoryRouter>
        <AdminLogin />
      </MemoryRouter>
    );

    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
  });
});
