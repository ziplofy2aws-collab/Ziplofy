import axios, { type AxiosInstance } from 'axios';

/** API base for checkout UI shared between admin and render-store (no admin-only env). */
function resolveCheckoutApiBaseUrl(): string {
  const viteApi = import.meta.env.VITE_API_URL;
  if (typeof viteApi === 'string' && viteApi.trim() !== '') {
    const trimmed = viteApi.trim().replace(/\/$/, '');
    return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
  }
  return '/api';
}

function readAccessToken(): string | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    return window.localStorage.getItem('accessToken');
  } catch {
    return null;
  }
}

export const checkoutHttp: AxiosInstance = axios.create({
  baseURL: resolveCheckoutApiBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

checkoutHttp.interceptors.request.use((config) => {
  const token = readAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }
  return config;
});
