import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStorefront } from '../../contexts/store.context';
import { useStorefrontAuth } from '../../contexts/storefront-auth.context';
import { Theme2Header } from './Theme2Header';
import { Theme2Footer } from './Theme2Footer';

export function Theme2PreferencesPage() {
  const navigate = useNavigate();
  const { storeFrontMeta } = useStorefront();
  const { user, checkAuth, updateUser, logout } = useStorefrontAuth();
  const [language, setLanguage] = useState('en');
  const [collectTax, setCollectTax] = useState<'collect' | 'dont_collect' | 'collect_unless_exempt'>('collect');
  const [agreedToMarketingEmails, setAgreedToMarketingEmails] = useState(false);
  const [agreedToSmsMarketing, setAgreedToSmsMarketing] = useState(false);

  useEffect(() => {
    checkAuth().catch(() => {});
  }, [checkAuth]);

  useEffect(() => {
    if (!user) return;
    setLanguage(user.language || 'en');
    setCollectTax(user.collectTax || 'collect');
    setAgreedToMarketingEmails(Boolean(user.agreedToMarketingEmails));
    setAgreedToSmsMarketing(Boolean(user.agreedToSmsMarketing));
  }, [user]);

  const save = async () => {
    if (!user?._id) return;
    await updateUser(user._id, {
      language,
      collectTax,
      agreedToMarketingEmails,
      agreedToSmsMarketing,
    });
  };

  if (!user) return null;

  return (
    <div className="min-h-svh bg-[#FFEB00] font-mono text-black">
      <div className="border-b-4 border-black bg-black px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-[#FFEB00]">
        PREFERENCES // {(storeFrontMeta?.name ?? 'STORE').toUpperCase()}
      </div>
      <Theme2Header
        userName={`${user.firstName} ${user.lastName}`.trim()}
        onCartOpen={() => {}}
        onLogout={() => {
          logout().catch(() => {});
          navigate('/');
        }}
      />
      <main className="mx-auto max-w-5xl px-3 py-8">
        <div className="mx-auto max-w-xl border-4 border-black bg-white p-5">
          <h1 className="text-lg font-black uppercase">User Preferences</h1>
          <div className="mt-4 space-y-3">
            <div>
              <label className="mb-1 block text-[10px] font-black uppercase">Language</label>
              <input value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full border-2 border-black px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-black uppercase">Tax preference</label>
              <select value={collectTax} onChange={(e) => setCollectTax(e.target.value as typeof collectTax)} className="w-full border-2 border-black px-3 py-2 text-sm">
                <option value="collect">Collect tax</option>
                <option value="dont_collect">Do not collect tax</option>
                <option value="collect_unless_exempt">Collect unless exempt</option>
              </select>
            </div>
            <label className="flex items-center gap-2 text-xs font-black uppercase">
              <input type="checkbox" checked={agreedToMarketingEmails} onChange={(e) => setAgreedToMarketingEmails(e.target.checked)} />
              Email marketing updates
            </label>
            <label className="flex items-center gap-2 text-xs font-black uppercase">
              <input type="checkbox" checked={agreedToSmsMarketing} onChange={(e) => setAgreedToSmsMarketing(e.target.checked)} />
              SMS marketing updates
            </label>
          </div>
          <button type="button" onClick={() => void save()} className="mt-4 border-4 border-black bg-black px-4 py-2 text-xs font-black uppercase text-[#FFEB00] hover:bg-[#FFEB00] hover:text-black">
            Save preferences
          </button>
        </div>
      </main>
      <Theme2Footer />
    </div>
  );
}
