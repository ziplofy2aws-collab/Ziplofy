import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStorefrontAuth } from '../../contexts/storefront-auth.context';
import { Theme2Header } from './Theme2Header';
import { Theme2Footer } from './Theme2Footer';

export function Theme2ProfilePage() {
  const navigate = useNavigate();
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

  if (!user) return null;

  return (
    <div className="min-h-svh bg-[#FFEB00] font-mono text-black">
      <div className="border-b-4 border-black bg-black px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-[#FFEB00]">PROFILE</div>
      <Theme2Header
        userName={`${user.firstName} ${user.lastName}`.trim()}
        onCartOpen={() => {}}
        onLogout={() => {
          logout().catch(() => {});
          navigate('/');
        }}
      />
      <main className="mx-auto max-w-4xl px-3 py-8">
        <div className="mx-auto max-w-xl border-4 border-black bg-white p-5">
          <h1 className="text-lg font-black uppercase">Profile</h1>
          <p className="mt-1 text-xs font-bold">{user.email}</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" className="border-2 border-black px-3 py-2 text-sm" />
            <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" className="border-2 border-black px-3 py-2 text-sm" />
          </div>
          <input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="Phone number" className="mt-2 w-full border-2 border-black px-3 py-2 text-sm" />
          <button type="button" onClick={() => void save()} className="mt-3 border-4 border-black bg-black px-4 py-2 text-xs font-black uppercase text-[#FFEB00] hover:bg-[#FFEB00] hover:text-black">
            Save
          </button>
        </div>
      </main>
      <Theme2Footer />
    </div>
  );
}
