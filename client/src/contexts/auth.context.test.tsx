import { useEffect } from 'react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';

const { storage } = vi.hoisted(() => {
  const store = new Map<string, string>();
  const storageImpl = {
    getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
    setItem: (k: string, v: string) => {
      store.set(k, String(v));
    },
    removeItem: (k: string) => {
      store.delete(k);
    },
    clear: () => {
      store.clear();
    },
  };
  return { storage: storageImpl };
});

const toastSuccess = vi.fn();
const toastError = vi.fn();

vi.mock('react-hot-toast', () => ({
  default: {
    success: (...args: unknown[]) => toastSuccess(...args),
    error: (...args: unknown[]) => toastError(...args),
  },
}));

const axiosGet = vi.fn();
const axiosPost = vi.fn();
vi.mock('../config/axios.config', () => ({
  axiosi: {
    get: (...args: unknown[]) => axiosGet(...args),
    post: (...args: unknown[]) => axiosPost(...args),
  },
}));

vi.mock('../types/local-storage', () => ({
  safeLocalStorage: storage,
}));

import AuthProvider, { useAuth, type IUser } from './auth.context';

function setTestLocationHref(href: string) {
  // jsdom location is not fully writable; replace it for deterministic tests.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  delete w.location;
  w.location = {
    href,
    reload: vi.fn(),
  };
}

function TestConsumer({
  onValue,
}: {
  onValue: (value: ReturnType<typeof useAuth>) => void;
}) {
  const value = useAuth();
  useEffect(() => {
    onValue(value);
  }, [value, onValue]);
  return null;
}

describe('AuthProvider / useAuth', () => {
  beforeEach(() => {
    toastSuccess.mockReset();
    toastError.mockReset();
    axiosGet.mockReset();
    axiosPost.mockReset();
    storage.clear();
    vi.unstubAllEnvs();
    // Prevent redirect effect from throwing Invalid URL in tests
    vi.stubEnv('VITE_REDIRECTION_URL', 'http://example.com/redirect');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('useAuth throws if used outside AuthProvider', () => {
    function Bad() {
      useAuth();
      return null;
    }
    expect(() => render(<Bad />)).toThrow('useAuth must be used within an AuthProvider');
  });

  it('checkAuth: when accessToken exists, calls GET /auth/me and sets user', async () => {
    setTestLocationHref('http://localhost:3000/login');
    storage.setItem('accessToken', 'token-123');

    const me: IUser = {
      id: 'u1',
      email: 'a@b.com',
      role: 'client',
      name: 'A',
      accessToken: 'token-123',
      assignedSupportDeveloperId: 's1',
      storeId: 'st1',
    };
    axiosGet.mockResolvedValueOnce({ data: me });

    let latest: ReturnType<typeof useAuth> | null = null;
    render(
      <AuthProvider>
        <TestConsumer onValue={(v) => (latest = v)} />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(axiosGet).toHaveBeenCalledWith('/auth/me');
      expect(latest?.user?.id).toBe('u1');
      expect(latest?.isAuthenticated).toBe(true);
    });
  });

  it('checkAuth: when /auth/me fails, removes accessToken and leaves user null', async () => {
    setTestLocationHref('http://localhost:3000/login');
    storage.setItem('accessToken', 'token-123');

    axiosGet.mockRejectedValueOnce(new Error('nope'));

    let latest: ReturnType<typeof useAuth> | null = null;
    render(
      <AuthProvider>
        <TestConsumer onValue={(v) => (latest = v)} />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(axiosGet).toHaveBeenCalledWith('/auth/me');
      expect(storage.getItem('accessToken')).toBeNull();
      expect(latest?.user).toBeNull();
      expect(latest?.isAuthenticated).toBe(false);
    });
  });

  it('login(): posts /auth/login, stores accessToken, sets user, and shows success toast', async () => {
    setTestLocationHref('http://localhost:3000/login');

    const loginUser: IUser = {
      id: 'u2',
      email: 'x@y.com',
      role: 'client',
      name: 'X',
      accessToken: 'tok-login',
      assignedSupportDeveloperId: 's2',
    };
    axiosPost.mockResolvedValueOnce({ data: loginUser });

    let api: ReturnType<typeof useAuth> | null = null;
    render(
      <AuthProvider>
        <TestConsumer onValue={(v) => (api = v)} />
      </AuthProvider>
    );

    await waitFor(() => expect(api).not.toBeNull());
    await api!.login('x@y.com', 'pw');

    expect(axiosPost).toHaveBeenCalledWith('/auth/login', { email: 'x@y.com', password: 'pw' });
    expect(storage.getItem('accessToken')).toBe('tok-login');
    expect(toastSuccess).toHaveBeenCalled();
    await waitFor(() => expect(api!.user?.id).toBe('u2'));
  });

  it('login(): on API error, shows error toast and does not set user', async () => {
    setTestLocationHref('http://localhost:3000/login');
    const err = { response: { data: { message: 'Bad credentials' } } };
    axiosPost.mockRejectedValueOnce(err);

    let api: ReturnType<typeof useAuth> | null = null;
    render(
      <AuthProvider>
        <TestConsumer onValue={(v) => (api = v)} />
      </AuthProvider>
    );

    await waitFor(() => expect(api).not.toBeNull());
    await api!.login('x@y.com', 'pw');

    expect(toastError).toHaveBeenCalledWith('Bad credentials');
    expect(api!.user).toBeNull();
  });

  it('register(): posts /auth/register, stores accessToken, sets user, and shows success toast', async () => {
    setTestLocationHref('http://localhost:3000/register');
    const regUser: IUser = {
      id: 'u3',
      email: 'r@e.com',
      role: 'client',
      name: 'R',
      accessToken: 'tok-reg',
      assignedSupportDeveloperId: 's3',
    };
    axiosPost.mockResolvedValueOnce({ data: regUser });

    let api: ReturnType<typeof useAuth> | null = null;
    render(
      <AuthProvider>
        <TestConsumer onValue={(v) => (api = v)} />
      </AuthProvider>
    );

    await waitFor(() => expect(api).not.toBeNull());
    await api!.register('R', 'r@e.com', 'pw');

    expect(axiosPost).toHaveBeenCalledWith('/auth/register', { name: 'R', email: 'r@e.com', password: 'pw' });
    expect(storage.getItem('accessToken')).toBe('tok-reg');
    await waitFor(() => expect(api!.user?.id).toBe('u3'));
    expect(toastSuccess).toHaveBeenCalled();
  });

  it('register(): on API error, shows error toast and rethrows', async () => {
    setTestLocationHref('http://localhost:3000/register');
    const err = { response: { data: { message: 'Registration failed' } } };
    axiosPost.mockRejectedValueOnce(err);

    let api: ReturnType<typeof useAuth> | null = null;
    render(
      <AuthProvider>
        <TestConsumer onValue={(v) => (api = v)} />
      </AuthProvider>
    );
    await waitFor(() => expect(api).not.toBeNull());

    await expect(api!.register('R', 'r@e.com', 'pw')).rejects.toBe(err);
    expect(toastError).toHaveBeenCalledWith('Registration failed');
  });

  it('googleLogin(): posts /auth/google, stores accessToken, sets user, and shows success toast', async () => {
    setTestLocationHref('http://localhost:3000/login');
    const gUser: IUser = {
      id: 'u4',
      email: 'g@o.com',
      role: 'client',
      name: 'G',
      accessToken: 'tok-google',
      assignedSupportDeveloperId: 's4',
    };
    axiosPost.mockResolvedValueOnce({ data: gUser });

    let api: ReturnType<typeof useAuth> | null = null;
    render(
      <AuthProvider>
        <TestConsumer onValue={(v) => (api = v)} />
      </AuthProvider>
    );
    await waitFor(() => expect(api).not.toBeNull());
    await api!.googleLogin('jwt123');

    expect(axiosPost).toHaveBeenCalledWith('/auth/google', { credential: 'jwt123' });
    expect(storage.getItem('accessToken')).toBe('tok-google');
    await waitFor(() => expect(api!.user?.id).toBe('u4'));
    expect(toastSuccess).toHaveBeenCalled();
  });

  it('redirect effect: when initialized and user exists and token exists, sets window.location.href to VITE_REDIRECTION_URL?accessToken=...', async () => {
    const hrefSpy = vi.fn();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    delete w.location;
    w.location = {
      get href() {
        return 'http://localhost:3000/login';
      },
      set href(v: string) {
        hrefSpy(v);
      },
      reload: vi.fn(),
    };

    vi.stubEnv('VITE_REDIRECTION_URL', 'http://example.com/redirect');
    storage.setItem('accessToken', 'tok-redir');
    axiosGet.mockResolvedValueOnce({
      data: {
        id: 'u5',
        email: 'u@u.com',
        role: 'client',
        name: 'U',
        accessToken: 'tok-redir',
        assignedSupportDeveloperId: 's5',
      } as IUser,
    });

    render(
      <AuthProvider>
        <div />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(hrefSpy).toHaveBeenCalledTimes(1);
      const redirected = String(hrefSpy.mock.calls[0]?.[0]);
      expect(redirected).toContain('http://example.com/redirect');
      expect(redirected).toContain('accessToken=tok-redir');
    });
  });

  it('logout(): removes accessToken, clears user, and calls window.location.reload', async () => {
    setTestLocationHref('http://localhost:3000/login');
    storage.setItem('accessToken', 'tok');

    let api: ReturnType<typeof useAuth> | null = null;
    render(
      <AuthProvider>
        <TestConsumer onValue={(v) => (api = v)} />
      </AuthProvider>
    );
    await waitFor(() => expect(api).not.toBeNull());

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const reloadSpy = (window as any).location.reload as unknown as ReturnType<typeof vi.fn>;

    await api!.logout();
    expect(storage.getItem('accessToken')).toBeNull();
    expect(reloadSpy).toHaveBeenCalledTimes(1);
  });
});

