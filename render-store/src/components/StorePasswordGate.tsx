import { type FormEvent, useState } from 'react';
import { useStorefront } from '../contexts/store.context';
import { useStorefrontAccess } from '../contexts/store-access.context';

export function StorePasswordGate() {
  const { storeFrontMeta } = useStorefront();
  const { messageToYourVisitors, verifying, error, verifyPassword } = useStorefrontAccess();
  const [password, setPassword] = useState('');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!password.trim() || verifying) return;
    await verifyPassword(password.trim());
  };

  const storeName = storeFrontMeta?.name || 'This store';

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6f6f7] px-4 py-10">
      <div className="w-full max-w-[420px] rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
            Password protected
          </p>
          <h1 className="mt-2 text-[22px] font-semibold text-gray-900">{storeName}</h1>
        </div>

        {messageToYourVisitors ? (
          <p className="mb-6 whitespace-pre-wrap text-center text-[14px] leading-relaxed text-gray-600">
            {messageToYourVisitors}
          </p>
        ) : (
          <p className="mb-6 text-center text-[14px] leading-relaxed text-gray-600">
            This store is password protected. Enter the password to continue shopping.
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="storefront-password" className="mb-1.5 block text-[13px] font-medium text-gray-700">
              Password
            </label>
            <input
              id="storefront-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-[14px] text-gray-900 outline-none transition-colors focus:border-gray-500 focus:ring-1 focus:ring-gray-300"
              placeholder="Enter store password"
              disabled={verifying}
            />
          </div>

          {error ? (
            <p className="text-[13px] text-red-600" role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={verifying || !password.trim()}
            className="w-full rounded-lg bg-gray-900 px-4 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {verifying ? 'Checking…' : 'Enter'}
          </button>
        </form>
      </div>
    </div>
  );
}
