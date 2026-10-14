import type { PanelModule, SessionResponse } from './types';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3011/api').replace(/\/+$/, '');
const TOKEN_KEY = 'gatewayToken';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(`${API_URL}${path}`, { ...init, headers });
  const data = (await res.json().catch(() => ({}))) as T & { message?: string; success?: boolean };
  if (!res.ok) {
    throw new Error(data.message || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  register: (body: { name: string; email: string; password: string }) =>
    request<SessionResponse>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: { email: string; password: string }) =>
    request<SessionResponse>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  google: (credential: string) =>
    request<SessionResponse>('/auth/google', { method: 'POST', body: JSON.stringify({ credential }) }),
  me: () => request<SessionResponse>('/auth/me'),
  saveService: (selectedService: 'whatsapp_api' | 'website_builder') =>
    request<SessionResponse>('/onboarding/service', {
      method: 'PUT',
      body: JSON.stringify({ selectedService }),
    }),
  saveIndustry: (industryKind: 'ecommerce' | 'service', industry: string) =>
    request<SessionResponse>('/onboarding/industry', {
      method: 'PUT',
      body: JSON.stringify({ industryKind, industry }),
    }),
  modules: () => request<{ success: boolean; locked: string; modules: PanelModule[] }>('/onboarding/modules'),
  saveModules: (selectedModules: string[]) =>
    request<SessionResponse>('/onboarding/modules', {
      method: 'PUT',
      body: JSON.stringify({ selectedModules }),
    }),
  saveBusinessName: (businessName: string) =>
    request<SessionResponse>('/onboarding/business-name', {
      method: 'PUT',
      body: JSON.stringify({ businessName }),
    }),
  complete: (businessName?: string) =>
    request<SessionResponse>('/onboarding/complete', {
      method: 'POST',
      body: JSON.stringify(businessName ? { businessName } : {}),
    }),
};

export function applySession(data: SessionResponse): void {
  if (data.token) setToken(data.token);
}

export function goToSso(url: string): void {
  window.location.assign(url);
}
