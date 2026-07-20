import { Link } from 'react-router-dom';
import { TbShoppingCart, TbUser } from 'react-icons/tb';
import { useState } from 'react';

export function Theme1Header({
  storeName,
  userName,
  onCartOpen,
  onLogout,
}: {
  storeName: string;
  userName?: string;
  onCartOpen: () => void;
  onLogout: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const userLoggedIn = Boolean(userName);

  return (
    <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-teal-700">{storeName}</span>
        <nav className="flex flex-wrap items-center justify-end gap-2">
          <Link to="/products" className="rounded-lg bg-teal-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-800">
            Catalog
          </Link>
          <Link to="/collection" className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-teal-800">
            Collections
          </Link>
          <button
            type="button"
            onClick={onCartOpen}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium hover:border-teal-300"
          >
            <TbShoppingCart className="text-base" /> Cart
          </button>
          {userLoggedIn ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-teal-600 px-3 py-1.5 text-xs font-semibold text-teal-800 hover:bg-teal-50"
              >
                <TbUser className="text-base" /> {userName}
              </button>
              {menuOpen ? (
                <div className="absolute right-0 z-20 mt-2 min-w-[170px] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
                  <Link to="/profile" className="block px-3 py-2 text-xs font-medium text-slate-700 hover:bg-teal-50" onClick={() => setMenuOpen(false)}>
                    Profile
                  </Link>
                  <Link to="/my-orders" className="block px-3 py-2 text-xs font-medium text-slate-700 hover:bg-teal-50" onClick={() => setMenuOpen(false)}>
                    Orders
                  </Link>
                  <Link to="/preferences" className="block px-3 py-2 text-xs font-medium text-slate-700 hover:bg-teal-50" onClick={() => setMenuOpen(false)}>
                    Preferences
                  </Link>
                  <button
                    type="button"
                    className="block w-full px-3 py-2 text-left text-xs font-medium text-rose-700 hover:bg-rose-50"
                    onClick={() => {
                      setMenuOpen(false);
                      onLogout();
                    }}
                  >
                    Logout
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <Link
              to="/auth/login"
              className="inline-flex items-center gap-1.5 rounded-lg border border-teal-600 px-3 py-1.5 text-xs font-semibold text-teal-800 hover:bg-teal-50"
            >
              <TbUser className="text-base" /> Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
