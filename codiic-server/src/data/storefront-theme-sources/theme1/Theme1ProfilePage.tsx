import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStorefront } from '../../contexts/store.context';
import { useStorefrontAuth } from '../../contexts/storefront-auth.context';
import { Theme1Header } from './Theme1Header';
import { Theme1Footer } from './Theme1Footer';

export function Theme1ProfilePage() {
  const navigate = useNavigate();
  const { storeFrontMeta } = useStorefront();
  const { user, checkAuth, updateUser, logout } = useStorefrontAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    checkAuth().catch(() => {});
  }, [checkAuth]);

  useEffect(() => {
    if (!user) return;
    setFirstName(user.firstName || '');
    setLastName(user.lastName || '');
    setPhoneNumber(user.phoneNumber || '');
  }, [user]);

  const save = async () => {
    if (!user?._id) return;
    await updateUser(user._id, { firstName, lastName, phoneNumber });
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-svh bg-slate-50 text-slate-900">
      <Theme1Header
        storeName={storeFrontMeta?.name ?? 'Store'}
        userName={`${user.firstName} ${user.lastName}`.trim()}
        onCartOpen={() => {}}
        onLogout={() => {
          logout().catch(() => {});
          navigate('/');
        }}
      />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold">Profile</h1>
          <p className="mt-1 text-xs text-slate-500">{user.email}</p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="Phone number" className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          <button type="button" onClick={() => void save()} className="mt-4 rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800">
            Save changes
          </button>
        </div>
      </main>
      <Theme1Footer storeName={storeFrontMeta?.name ?? 'Store'} />
    </div>
  );
}
