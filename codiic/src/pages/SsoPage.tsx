import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { axiosi } from '../config/axios.config';
import { safeLocalStorage } from '../types/local-storage';
import { markOnboardingComplete, setAuthUserId } from '../utils/onboarding.util';
import type { IUser } from '../contexts/auth.context';

// Dev Strict Mode mounts this page twice. The ticket can be redeemed only once,
// so both mounts must share a single in-flight exchange.
const ssoExchangeInflight = new Map<string, Promise<IUser>>();

function exchangeTicketOnce(ticket: string) {
  const existing = ssoExchangeInflight.get(ticket);
  if (existing) return existing;
  const pending = axiosi
    .post<IUser>('/auth/sso/exchange', { ticket })
    .then(({ data }) => data)
    .catch((err) => {
      ssoExchangeInflight.delete(ticket);
      throw err;
    });
  ssoExchangeInflight.set(ticket, pending);
  return pending;
}

export default function SsoPage() {
  const [params] = useSearchParams();
  const [error, setError] = useState('');

  useEffect(() => {
    const ticket = params.get('ticket');
    if (!ticket) {
      setError('Missing sign-in ticket');
      return;
    }

    let active = true;
    exchangeTicketOnce(ticket)
      .then((data) => {
        if (!active) return;
        safeLocalStorage.setItem('accessToken', data.accessToken);
        setAuthUserId(data.id);
        markOnboardingComplete(data.id);
        window.location.replace('/');
      })
      .catch((err: any) => {
        if (!active) return;
        setError(err?.response?.data?.error || err?.response?.data?.message || 'Sign-in ticket expired. Please log in again.');
      });

    return () => {
      active = false;
    };
  }, [params]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md w-full bg-white rounded-xl border border-slate-200 p-8 text-center">
        {error ? (
          <>
            <p className="text-red-600 mb-4">{error}</p>
            <a className="text-sm font-semibold underline" href="/login">Go to login</a>
          </>
        ) : (
          <p className="text-slate-600">Signing you into Codiic…</p>
        )}
      </div>
    </div>
  );
}
