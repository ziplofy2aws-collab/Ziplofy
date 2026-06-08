import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStorefront } from '../../contexts/store.context';
import { useStorefrontAuth } from '../../contexts/storefront-auth.context';
import { Theme1Header } from './Theme1Header';
import { Theme1Footer } from './Theme1Footer';

export function Theme1PreferencesPage() {
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
          <h1 className="text-xl font-semibold">User Preferences</h1>
          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">Language</label>
              <input value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">Tax preference</label>
              <select value={collectTax} onChange={(e) => setCollectTax(e.target.value as typeof collectTax)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                <option value="collect">Collect tax</option>
                <option value="dont_collect">Do not collect tax</option>
                <option value="collect_unless_exempt">Collect unless exempt</option>
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={agreedToMarketingEmails} onChange={(e) => setAgreedToMarketingEmails(e.target.checked)} />
              Email marketing updates
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={agreedToSmsMarketing} onChange={(e) => setAgreedToSmsMarketing(e.target.checked)} />
              SMS marketing updates
            </label>
          </div>
          <button type="button" onClick={() => void save()} className="mt-5 rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800">
            Save preferences
          </button>
        </div>
      </main>
      <Theme1Footer storeName={storeFrontMeta?.name ?? 'Store'} />
    </div>
  );
}
