'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { authApi } from '@/lib/api';
import { GATEWAY_LOGOUT_URL } from '@/lib/gateway';
import { useAuthStore } from '@/stores/authStore';
import AppStatusScreen from '@/components/status/AppStatusScreen';

function inflightMap(): Map<string, Promise<any>> {
  const g = globalThis as typeof globalThis & { __webpanelSsoExchange?: Map<string, Promise<any>> };
  if (!g.__webpanelSsoExchange) g.__webpanelSsoExchange = new Map();
  return g.__webpanelSsoExchange;
}

function exchangeTicketOnce(ticket: string) {
  const cache = inflightMap();
  const existing = cache.get(ticket);
  if (existing) return existing;
  const pending = authApi.ssoExchange(ticket).catch((err) => {
    cache.delete(ticket);
    throw err;
  });
  cache.set(ticket, pending);
  return pending;
}

function SsoErrorShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10"
      style={{
        backgroundColor: '#e8f5ef',
        backgroundImage:
          "linear-gradient(160deg, rgba(232, 245, 239, 0.55), rgba(236, 253, 245, 0.42)), url('/assets/mint-grid-bg.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="page-blur-transition page-blur-transition--in relative w-full max-w-md overflow-hidden rounded-[28px] border border-[#e3e3e3] bg-white/95 p-8 text-center shadow-[0_24px_60px_rgba(15,23,42,0.10)] backdrop-blur-sm">
        <img
          src="/logo_with_text.webp"
          alt="CODIIC"
          className="mx-auto mb-6 h-10 w-auto object-contain"
        />
        {children}
      </div>
    </div>
  );
}

function SsoExchange() {
  const searchParams = useSearchParams();
  const acceptSsoSession = useAuthStore((s) => s.acceptSsoSession);
  const [error, setError] = useState('');

  useEffect(() => {
    const ticket = searchParams.get('ticket');
    if (!ticket) {
      setError('Missing sign-in ticket');
      return;
    }

    exchangeTicketOnce(ticket)
      .then((res) => {
        const payload = res?.data?.data;
        if (!payload?.token) {
          setError('Sign-in failed: empty session from server. Please log in again.');
          return;
        }
        acceptSsoSession({
          token: payload.token,
          user: payload.user,
          workspaces: payload.workspaces,
          features: payload.features,
        });
        window.location.replace(payload.launchPath || '/client/dashboard');
      })
      .catch((err: any) => {
        const msg =
          err?.response?.data?.message ||
          (err?.code === 'ECONNABORTED'
            ? 'Sign-in timed out. Please try logging in again.'
            : 'Sign-in ticket expired or invalid. Please log in again.');
        setError(msg);
      });
  }, [acceptSsoSession, searchParams]);

  if (error) {
    return (
      <SsoErrorShell>
        <p className="mb-5 text-[14px] leading-relaxed text-red-600">{error}</p>
        <a
          className="inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-600 px-5 text-[14px] font-semibold text-white shadow-[0_12px_24px_rgba(5,150,105,0.28)]"
          href={GATEWAY_LOGOUT_URL}
        >
          Go to login
        </a>
      </SsoErrorShell>
    );
  }

  return <AppStatusScreen variant="loading" silent />;
}

export default function SsoPage() {
  return (
    <Suspense fallback={<AppStatusScreen variant="loading" silent />}>
      <SsoExchange />
    </Suspense>
  );
}
