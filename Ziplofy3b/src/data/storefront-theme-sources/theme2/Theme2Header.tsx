import { Link } from 'react-router-dom';
import { useState } from 'react';

export function Theme2Header({
  userName,
  onCartOpen,
  onLogout,
}: {
  userName?: string;
  onCartOpen: () => void;
  onLogout: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const userLoggedIn = Boolean(userName);

  return (
    <div className="grid grid-cols-2 border-b-4 border-black sm:grid-cols-4">
      <Link
        to="/products"
        className="flex min-h-18 items-center justify-center border-r-4 border-b-4 border-black bg-white text-center text-xs font-black uppercase tracking-widest hover:bg-black hover:text-[#FFEB00] sm:border-b-0"
      >
        ALL_ITEMS
      </Link>
      <Link
        to="/collection"
        className="flex min-h-18 items-center justify-center border-b-4 border-black bg-[#FFEB00] text-center text-xs font-black uppercase tracking-widest hover:bg-white sm:border-r-4 sm:border-b-0"
      >
        GROUPS
      </Link>
      <button
        type="button"
        onClick={onCartOpen}
        className="flex min-h-18 items-center justify-center border-r-4 border-b-4 border-black bg-black text-center text-xs font-black uppercase tracking-widest text-[#FFEB00] hover:bg-white hover:text-black sm:border-b-0"
      >
        CART_OPEN
      </button>
      {userLoggedIn ? (
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex min-h-18 w-full items-center justify-center border-b-4 border-black bg-white text-center text-xs font-black uppercase tracking-widest hover:bg-[#FFEB00] sm:border-b-0"
          >
            {userName}
          </button>
          {menuOpen ? (
            <div className="absolute right-0 z-20 min-w-[180px] border-4 border-black bg-[#FFEB00] text-black">
              <Link to="/profile" className="block border-b-2 border-black px-3 py-2 text-xs font-black uppercase hover:bg-black hover:text-[#FFEB00]" onClick={() => setMenuOpen(false)}>
                Profile
              </Link>
              <Link to="/my-orders" className="block border-b-2 border-black px-3 py-2 text-xs font-black uppercase hover:bg-black hover:text-[#FFEB00]" onClick={() => setMenuOpen(false)}>
                Orders
              </Link>
              <Link to="/preferences" className="block border-b-2 border-black px-3 py-2 text-xs font-black uppercase hover:bg-black hover:text-[#FFEB00]" onClick={() => setMenuOpen(false)}>
                Preferences
              </Link>
              <button
                type="button"
                className="block w-full px-3 py-2 text-left text-xs font-black uppercase hover:bg-black hover:text-[#FFEB00]"
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
          className="flex min-h-18 items-center justify-center border-b-4 border-black bg-white text-center text-xs font-black uppercase tracking-widest hover:bg-[#FFEB00] sm:border-b-0"
        >
          LOGIN_→
        </Link>
      )}
    </div>
  );
}
