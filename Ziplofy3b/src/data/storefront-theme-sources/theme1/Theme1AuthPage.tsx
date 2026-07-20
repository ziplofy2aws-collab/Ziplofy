import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStorefront } from '../../contexts/store.context';
import { useStorefrontAuth } from '../../contexts/storefront-auth.context';
import { Theme1Header } from './Theme1Header';
import { Theme1Footer } from './Theme1Footer';

export function Theme1AuthPage() {
  const navigate = useNavigate();
  const { storeFrontMeta } = useStorefront();
  const { login, signup, user, logout } = useStorefrontAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const name = storeFrontMeta?.name ?? 'Store';

  const submit = async () => {
    if (!storeFrontMeta?.storeId || !email || !password) return;
    setBusy(true);
    try {
      if (mode === 'login') {
        await login({ storeId: storeFrontMeta.storeId, email, password });
      } else {
        await signup({ storeId: storeFrontMeta.storeId, firstName, lastName, email, password });
      }
      navigate('/');
    } catch {
      /* context handles toasts */
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-svh bg-slate-50 text-slate-900">
      <Theme1Header
        storeName={name}
        userName={user ? `${user.firstName} ${user.lastName}`.trim() : undefined}
        onCartOpen={() => {}}
        onLogout={() => {
          logout().catch(() => {});
          navigate('/');
        }}
      />

      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold ${mode === 'login' ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-700'}`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold ${mode === 'signup' ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-700'}`}
            >
              Sign up
            </button>
          </div>

          {mode === 'signup' ? (
            <div className="mb-3 grid grid-cols-2 gap-3">
              <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </div>
          ) : null}
          <div className="space-y-3">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            <button
              type="button"
              onClick={() => void submit()}
              disabled={busy}
              className="w-full rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
            >
              {busy ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create account'}
            </button>
            <Link to="/" className="block text-center text-xs font-medium text-teal-700 hover:underline">
              Back to home
            </Link>
          </div>
        </div>
      </main>
      <Theme1Footer storeName={name} />
    </div>
  );
}
