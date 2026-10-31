'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { authApi } from '@/lib/api';
import { GATEWAY_LOGOUT_URL } from '@/lib/gateway';
import { useAuthStore } from '@/stores/authStore';

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
        const payload = res.data.data;
        acceptSsoSession({
          token: payload.token,
          user: payload.user,
          workspaces: payload.workspaces,
          features: payload.features,
        });
        window.location.replace(payload.launchPath || '/client/dashboard');
      })
      .catch((err: any) => {
        setError(err?.response?.data?.message || 'Sign-in ticket expired. Please log in again.');
      });
  }, [acceptSsoSession, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f1f1f1] p-6">
      <div className="max-w-md w-full bg-white rounded-2xl border border-[#e3e3e3] p-8 text-center">
        {error ? (
          <>
            <p className="text-red-600 mb-4">{error}</p>
            <a className="text-sm font-semibold text-emerald-700 underline" href={GATEWAY_LOGOUT_URL}>
              Go to login
            </a>
          </>
        ) : (
          <p className="text-[#667085]">Signing you into Codiic Panel…</p>
        )}
      </div>
    </div>
  );
}

export default function SsoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#f1f1f1]"><p className="text-[#98A2B3] text-sm">Loading...</p></div>}>
      <SsoExchange />
    </Suspense>
  );
}
